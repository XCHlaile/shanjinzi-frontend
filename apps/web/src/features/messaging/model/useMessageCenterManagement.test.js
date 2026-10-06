import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useMessageCenterManagement } from './useMessageCenterManagement.js'

test('message center facade wires directory, notifications, thread and sync', () => {
  const calls = []
  let broadcastLoader
  const directory = {
    activeChannel: ref('PRIVATE'),
    activeConversation: ref(null),
    broadcastConversations: ref([]),
    conversations: ref([]),
    loadConversations: async () => {},
    loadUnreadCount: async () => {},
    onBroadcastConversationsLoaded(loader) {
      broadcastLoader = loader
    },
    showContacts: ref(false),
    unreadCount: ref(0)
  }
  const notifications = {
    loadBroadcastNotifications: async () => {},
    loadNotifications: async () => {},
    loadNotificationUnreadCount: async () => {}
  }
  const thread = {
    applyPushedMessage() {},
    loadMessages: async () => {}
  }
  const sync = {
    initializeMessageCenter: async () => {}
  }

  const facade = useMessageCenterManagement({
    currentUserId: '8',
    createDirectory() {
      calls.push('directory')
      return directory
    },
    createNotifications(options) {
      calls.push('notifications')
      assert.equal(options.activeChannel, directory.activeChannel)
      assert.equal(options.messageUnreadCount, directory.unreadCount)
      return notifications
    },
    createThread(options) {
      calls.push('thread')
      assert.equal(options.currentUserId, '8')
      assert.equal(options.activeConversation, directory.activeConversation)
      return thread
    },
    createSync(options) {
      calls.push('sync')
      assert.equal(options.applyPushedMessage, thread.applyPushedMessage)
      assert.equal(options.loadNotifications, notifications.loadNotifications)
      return sync
    }
  })

  assert.deepEqual(calls, ['directory', 'notifications', 'thread', 'sync'])
  assert.equal(broadcastLoader, notifications.loadBroadcastNotifications)
  assert.equal(facade.initializeMessageCenter, sync.initializeMessageCenter)
  assert.equal(facade.activeConversation, directory.activeConversation)
})
