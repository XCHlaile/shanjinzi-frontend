import { nextTick } from 'vue'

import {
  contactId,
  mergeById,
  pageItems,
  sortMessages
} from '../lib/messageViewModel.js'

export function useMessageHistory({
  api,
  conversations,
  loadUnreadCount,
  notify,
  showContacts,
  state
}) {
  async function selectContact(contact) {
    const existing = conversations.value.find(item => (
      contactId(item.participant) === contactId(contact)
    ))
    if (existing) return selectConversation(existing)
    state.activeConversation.value = null
    state.activeContact.value = contact
    state.messages.value = []
    state.messagePage.value = 1
    state.messageTotalPages.value = 0
    state.messageError.value = ''
    state.messageAttachments.value = []
    showContacts.value = false
  }

  async function selectConversation(conversation) {
    state.activeConversation.value = conversation
    state.activeContact.value = null
    state.messageAttachments.value = []
    showContacts.value = false
    await loadMessages()
    if (Number(conversation.unreadCount || 0) > 0) {
      try {
        await api.markConversationRead(conversation.conversationId)
        conversation.unreadCount = 0
        await loadUnreadCount()
      } catch (error) {
        notify.warning(error.message || '消息已显示，但已读状态同步失败')
      }
    }
  }

  async function loadMessages({ append = false, silent = false } = {}) {
    const conversationId = state.activeConversation.value?.conversationId
    if (
      !conversationId
      || state.messagesLoading.value
      || state.messagePolling.value
    ) return
    if (silent) state.messagePolling.value = true
    else {
      state.messagesLoading.value = true
      state.messageError.value = ''
    }
    const requestedPage = append ? state.messagePage.value + 1 : 1
    const shouldFollowLatest = !state.streamRef.value
      || state.streamRef.value.scrollHeight
        - state.streamRef.value.scrollTop
        - state.streamRef.value.clientHeight < 120
    try {
      const payload = await api.fetchMessageHistory(
        conversationId,
        { page: requestedPage, pageSize: 50 }
      )
      const items = pageItems(payload)
      state.messages.value = sortMessages(
        (append || silent)
          ? mergeById(state.messages.value, items, 'messageId')
          : items
      )
      if (!silent) state.messagePage.value = Number(payload?.page ?? requestedPage)
      state.messageTotalPages.value = Number(
        payload?.totalPages ?? (items.length ? 1 : 0)
      )
      if (!append && (!silent || shouldFollowLatest)) await scrollToBottom()
      if (
        silent
        && Number(state.activeConversation.value?.unreadCount || 0) > 0
      ) {
        await api.markConversationRead(conversationId)
        state.activeConversation.value.unreadCount = 0
        await loadUnreadCount()
      }
    } catch (error) {
      if (!silent) {
        if (!append) state.messages.value = []
        state.messageError.value = error.message || '消息记录加载失败，请稍后重试'
      }
    } finally {
      if (silent) state.messagePolling.value = false
      else state.messagesLoading.value = false
    }
  }

  function loadOlderMessages() {
    return loadMessages({ append: true })
  }

  async function scrollToBottom() {
    await nextTick()
    if (state.streamRef.value) {
      state.streamRef.value.scrollTop = state.streamRef.value.scrollHeight
    }
  }

  function applyPushedMessage(event) {
    const message = event.data?.message
    if (event.eventType !== 'MESSAGE_CREATED' || !message?.messageId) return
    const activeId = state.activeConversation.value?.conversationId
    const eventConversationId = event.conversationId ?? message.conversationId ?? ''
    if (String(activeId ?? '') !== String(eventConversationId)) return
    const shouldFollowLatest = !state.streamRef.value
      || state.streamRef.value.scrollHeight
        - state.streamRef.value.scrollTop
        - state.streamRef.value.clientHeight < 120
    state.messages.value = sortMessages(
      mergeById(state.messages.value, [message], 'messageId')
    )
    if (shouldFollowLatest) void scrollToBottom()
  }

  return {
    applyPushedMessage,
    loadMessages,
    loadOlderMessages,
    scrollToBottom,
    selectContact,
    selectConversation
  }
}
