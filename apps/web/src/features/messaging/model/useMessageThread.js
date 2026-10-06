import { messageApi } from '../api/messageApi.js'
import { useMessageComposer } from './useMessageComposer.js'
import { useMessageConversationActions } from './useMessageConversationActions.js'
import { useMessageHistory } from './useMessageHistory.js'
import { useMessageThreadState } from './useMessageThreadState.js'

const noop = () => {}

export function useMessageThread({
  conversations,
  showContacts,
  currentUserId,
  loadConversations,
  loadUnreadCount,
  activeConversation: providedActiveConversation,
  api = messageApi,
  confirm = async () => {},
  notify = { success: noop, error: noop, warning: noop }
}) {
  const state = useMessageThreadState({
    currentUserId,
    providedActiveConversation
  })
  const history = useMessageHistory({
    api,
    conversations,
    loadUnreadCount,
    notify,
    showContacts,
    state
  })
  const composer = useMessageComposer({
    api,
    conversations,
    history,
    loadConversations,
    notify,
    state
  })
  const conversationActions = useMessageConversationActions({
    api,
    confirm,
    conversations,
    loadConversations,
    notify,
    state
  })
  const publicState = { ...state }
  delete publicState.messageAttachmentCache
  delete publicState.messagePolling

  return {
    ...publicState,
    ...history,
    ...composer,
    ...conversationActions
  }
}
