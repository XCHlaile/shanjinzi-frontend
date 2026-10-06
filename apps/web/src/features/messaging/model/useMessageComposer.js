import { createClientMessageId } from '../lib/messageActions.js'
import {
  contactId,
  mergeById,
  sortMessages
} from '../lib/messageViewModel.js'

export function useMessageComposer({
  api,
  conversations,
  history,
  loadConversations,
  notify,
  state
}) {
  async function submitMessage() {
    if (!state.canSend.value || state.sending.value) return
    const receiverId = state.activeParticipant.value.id
    const uploadedAttachments = [...state.messageAttachments.value]
    const attachmentFileIds = uploadedAttachments
      .map(item => Number(item.fileId))
      .filter(Number.isFinite)
    state.sending.value = true
    try {
      const sentMessage = await api.sendMessage({
        clientMessageId: createClientMessageId(),
        receiverId,
        content: state.draft.value.trim(),
        attachmentFileIds
      })
      state.draft.value = ''
      state.messageAttachments.value = []
      if (sentMessage?.messageId) {
        const displayMessage = {
          ...sentMessage,
          attachmentFileIds: sentMessage.attachmentFileIds || attachmentFileIds,
          attachmentFiles: [
            ...(Array.isArray(sentMessage.attachmentFiles)
              ? sentMessage.attachmentFiles
              : []),
            ...uploadedAttachments
          ]
        }
        state.messages.value = sortMessages(
          mergeById(state.messages.value, [displayMessage], 'messageId')
        )
        await history.scrollToBottom()
      }
      await loadConversations()
      const conversationId = sentMessage?.conversationId
        || state.activeConversation.value?.conversationId
      const refreshedConversation = conversations.value.find(item => (
        conversationId
          ? String(item.conversationId) === String(conversationId)
          : contactId(item.participant) === String(receiverId)
      ))
      if (refreshedConversation) {
        state.activeConversation.value = refreshedConversation
        state.activeContact.value = null
        if (!sentMessage?.messageId) await history.loadMessages()
      }
      notify.success('消息已发送')
    } catch (error) {
      notify.error(error.message || '消息发送失败，请稍后重试')
    } finally {
      state.sending.value = false
    }
  }

  return { submitMessage }
}
