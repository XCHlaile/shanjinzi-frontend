import { ref } from 'vue'

import { messageApi } from '../api/messageApi.js'
import {
  isSuperAdminContact,
  splitMessageConversations
} from '../lib/messageChannels.js'
import {
  mergeById,
  pageItems,
  sortConversations
} from '../lib/messageViewModel.js'

export function useMessageDirectory({ api = messageApi } = {}) {
  const conversations = ref([])
  const broadcastConversations = ref([])
  const activeConversation = ref(null)
  const conversationPage = ref(1)
  const conversationTotalPages = ref(0)
  const conversationLoading = ref(false)
  const conversationPolling = ref(false)
  const conversationError = ref('')
  const unreadCount = ref(0)
  const activeChannel = ref('messages')
  const showContacts = ref(false)
  const contacts = ref([])
  const contactsLoading = ref(false)
  const contactsError = ref('')
  const contactKeyword = ref('')
  const broadcastLoadListeners = new Set()

  function onBroadcastConversationsLoaded(listener) {
    broadcastLoadListeners.add(listener)
    return () => broadcastLoadListeners.delete(listener)
  }

  async function emitBroadcastConversationsLoaded() {
    await Promise.all(
      [...broadcastLoadListeners].map(listener => listener(broadcastConversations.value))
    )
  }

  async function loadUnreadCount() {
    try {
      const payload = await api.fetchUnreadCount()
      unreadCount.value = Number(payload?.unreadCount ?? 0)
    } catch {
      unreadCount.value = 0
    }
  }

  async function loadConversations({ append = false, silent = false } = {}) {
    if (conversationLoading.value || conversationPolling.value) return
    if (silent) {
      conversationPolling.value = true
    } else {
      conversationLoading.value = true
      conversationError.value = ''
    }
    const requestedPage = append ? conversationPage.value + 1 : 1
    try {
      const payload = await api.fetchConversations({
        page: requestedPage,
        pageSize: 20
      })
      const items = pageItems(payload)
      const {
        privateConversations: privateItems,
        broadcastConversations: broadcastItems
      } = splitMessageConversations(items)
      conversations.value = sortConversations(
        append
          ? mergeById(conversations.value, privateItems, 'conversationId')
          : privateItems
      )
      broadcastConversations.value = append
        ? mergeById(
          broadcastConversations.value,
          broadcastItems,
          'conversationId'
        )
        : broadcastItems
      await emitBroadcastConversationsLoaded()
      conversationPage.value = Number(payload?.page ?? requestedPage)
      conversationTotalPages.value = Number(
        payload?.totalPages ?? (items.length ? 1 : 0)
      )
      if (activeConversation.value) {
        activeConversation.value = conversations.value.find(
          item => String(item.conversationId)
            === String(activeConversation.value.conversationId)
        ) || null
      }
    } catch (error) {
      if (!silent) {
        if (!append) conversations.value = []
        conversationError.value = error.message || '会话加载失败，请稍后重试'
      }
    } finally {
      if (silent) conversationPolling.value = false
      else conversationLoading.value = false
    }
  }

  function loadMoreConversations() {
    return loadConversations({ append: true })
  }

  async function loadContacts() {
    contactsLoading.value = true
    contactsError.value = ''
    try {
      const payload = await api.fetchMessageContacts(contactKeyword.value)
      const items = Array.isArray(payload) ? payload : pageItems(payload)
      contacts.value = items.filter(contact => !isSuperAdminContact(contact))
    } catch (error) {
      contacts.value = []
      contactsError.value = error.message || '联系人加载失败，请稍后重试'
    } finally {
      contactsLoading.value = false
    }
  }

  async function toggleContacts() {
    showContacts.value = !showContacts.value
    if (showContacts.value && !contacts.value.length) await loadContacts()
  }

  return {
    activeChannel,
    activeConversation,
    broadcastConversations,
    contactKeyword,
    contacts,
    contactsError,
    contactsLoading,
    conversationError,
    conversationLoading,
    conversationPage,
    conversationPolling,
    conversations,
    conversationTotalPages,
    loadContacts,
    loadConversations,
    loadMoreConversations,
    loadUnreadCount,
    onBroadcastConversationsLoaded,
    showContacts,
    toggleContacts,
    unreadCount
  }
}
