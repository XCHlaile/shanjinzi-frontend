import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useMessageNotifications } from './useMessageNotifications.js'

function createNotificationModel(overrides = {}) {
  const calls = []
  const api = {
    async fetchMessageHistory(conversationId, options) {
      calls.push(['history', conversationId, options])
      return {
        items: [{
          messageId: 31,
          content: '平台公告',
          createdAt: '2026-07-31T10:00:00.000Z'
        }],
        totalPages: 1
      }
    },
    async fetchNotifications(options) {
      calls.push(['notifications', options])
      return {
        items: [{
          notificationId: 21,
          title: '报名提醒',
          createdAt: '2026-07-31T09:00:00.000Z'
        }],
        page: 1,
        totalPages: 1
      }
    },
    async fetchNotificationUnreadCount() {
      return { unreadCount: 2 }
    },
    async markMessageRead(messageId) {
      calls.push(['mark-message', messageId])
    },
    async markNotificationRead(notificationId) {
      calls.push(['mark-notification', notificationId])
    },
    async markAllNotificationsRead() {
      calls.push(['mark-all'])
    },
    async markConversationRead(conversationId) {
      calls.push(['mark-conversation', conversationId])
    },
    ...overrides.api
  }
  let messageUnreadRefreshes = 0
  const model = useMessageNotifications({
    activeChannel: ref('messages'),
    broadcastConversations: ref([{
      conversationId: 11,
      participant: { id: 1, roleCode: 'SUPER_ADMIN' }
    }]),
    messageUnreadCount: ref(4),
    refreshMessageUnreadCount: async () => { messageUnreadRefreshes += 1 },
    api,
    notify: overrides.notify,
    now: () => '2026-07-31T12:00:00.000Z'
  })
  return {
    calls,
    getMessageUnreadRefreshes: () => messageUnreadRefreshes,
    model
  }
}

test('notification model merges broadcasts and derives channel counts', async () => {
  const { calls, model } = createNotificationModel()

  await model.loadBroadcastNotifications()
  await model.loadNotifications()
  await model.loadNotificationUnreadCount()

  assert.equal(model.broadcastUnreadCount.value, 1)
  assert.equal(model.privateUnreadCount.value, 3)
  assert.equal(model.combinedNotificationUnreadCount.value, 3)
  assert.deepEqual(
    model.visibleNotifications.value.map(item => item.notificationId),
    ['admin-broadcast-31', 21]
  )
  model.notificationReadStatus.value = 'UNREAD'
  assert.equal(model.visibleNotifications.value.length, 2)
  assert.deepEqual(calls.slice(0, 2), [
    ['history', 11, { page: 1, pageSize: 100 }],
    ['notifications', { page: 1, pageSize: 20, readStatus: undefined }]
  ])
})

test('notification model marks direct and broadcast notifications as read', async () => {
  const { calls, getMessageUnreadRefreshes, model } = createNotificationModel()
  const directNotification = { notificationId: 21 }
  const broadcastNotification = {
    notificationId: 'admin-broadcast-31',
    messageId: 31,
    adminBroadcast: true,
    message: {}
  }
  model.notificationUnreadCount.value = 2

  await model.markNotificationRead(directNotification)
  await model.markNotificationRead(broadcastNotification)

  assert.equal(directNotification.readAt, '2026-07-31T12:00:00.000Z')
  assert.equal(broadcastNotification.message.readAt, '2026-07-31T12:00:00.000Z')
  assert.equal(model.notificationUnreadCount.value, 1)
  assert.equal(getMessageUnreadRefreshes(), 1)
  assert.deepEqual(calls, [
    ['mark-notification', 21],
    ['mark-message', 31]
  ])
})

test('notification model marks every notification and broadcast conversation as read', async () => {
  const successes = []
  const { calls, getMessageUnreadRefreshes, model } = createNotificationModel({
    notify: {
      success(message) { successes.push(message) },
      error() {}
    }
  })
  model.notifications.value = [{ notificationId: 21 }]
  model.broadcastNotifications.value = [
    { notificationId: 'a', conversationId: 11, message: {} },
    { notificationId: 'b', conversationId: 11, message: {} },
    { notificationId: 'c', conversationId: 12, readAt: 'already-read', message: {} }
  ]
  model.notificationUnreadCount.value = 2

  await model.markAllNotificationsRead()

  assert.deepEqual(calls, [
    ['mark-all'],
    ['mark-conversation', 11]
  ])
  assert.equal(model.notificationUnreadCount.value, 0)
  assert.equal(getMessageUnreadRefreshes(), 1)
  assert.deepEqual(successes, ['全部通知已标为已读'])
  assert.equal(model.notifications.value[0].readAt, '2026-07-31T12:00:00.000Z')
})
