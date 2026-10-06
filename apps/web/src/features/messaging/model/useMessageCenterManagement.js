import { useMessageCenterSync } from './useMessageCenterSync.js'
import { useMessageDirectory } from './useMessageDirectory.js'
import { useMessageNotifications } from './useMessageNotifications.js'
import { useMessageThread } from './useMessageThread.js'

export function useMessageCenterManagement({
  currentUserId,
  confirm = async () => {},
  notify = { success() {}, error() {} },
  createDirectory = useMessageDirectory,
  createNotifications = useMessageNotifications,
  createThread = useMessageThread,
  createSync = useMessageCenterSync
} = {}) {
  const directory = createDirectory()
  const notifications = createNotifications({
    activeChannel: directory.activeChannel,
    broadcastConversations: directory.broadcastConversations,
    messageUnreadCount: directory.unreadCount,
    refreshMessageUnreadCount: directory.loadUnreadCount,
    notify
  })
  directory.onBroadcastConversationsLoaded(notifications.loadBroadcastNotifications)

  const thread = createThread({
    activeConversation: directory.activeConversation,
    conversations: directory.conversations,
    showContacts: directory.showContacts,
    currentUserId,
    loadConversations: directory.loadConversations,
    loadUnreadCount: directory.loadUnreadCount,
    confirm,
    notify
  })
  const sync = createSync({
    activeChannel: directory.activeChannel,
    activeConversation: directory.activeConversation,
    applyPushedMessage: thread.applyPushedMessage,
    loadConversations: directory.loadConversations,
    loadMessages: thread.loadMessages,
    loadNotifications: notifications.loadNotifications,
    loadNotificationUnreadCount: notifications.loadNotificationUnreadCount,
    loadUnreadCount: directory.loadUnreadCount
  })

  return {
    ...directory,
    ...notifications,
    ...thread,
    ...sync
  }
}
