import assert from 'node:assert/strict'
import test from 'node:test'

import {
  adminMessageNotification,
  isAdminBroadcastConversation,
  isSuperAdminContact,
  splitMessageConversations
} from './messageChannels.js'

test('recognizes super administrator conversations as platform broadcasts', () => {
  assert.equal(isSuperAdminContact({ roles: ['SUPER_ADMIN'] }), true)
  assert.equal(isSuperAdminContact({ roleCode: 'super_admin' }), true)
  assert.equal(isSuperAdminContact({ roles: ['SCHOOL_ADMIN'] }), false)
  assert.equal(isAdminBroadcastConversation({ participant: { roles: ['SUPER_ADMIN'] } }), true)
  assert.equal(isAdminBroadcastConversation({ conversationType: 'BROADCAST' }), true)
})

test('separates administrator broadcasts from private conversations', () => {
  const result = splitMessageConversations([
    { conversationId: 1, participant: { roles: ['SUPER_ADMIN'] } },
    { conversationId: 2, participant: { roles: ['TEACHER'] } }
  ])

  assert.deepEqual(result.broadcastConversations.map(item => item.conversationId), [1])
  assert.deepEqual(result.privateConversations.map(item => item.conversationId), [2])
})

test('maps administrator messages to notification records without losing read state', () => {
  const notification = adminMessageNotification({
    messageId: 9,
    content: '放假通知',
    readAt: '2026-07-28T08:00:00Z',
    createdAt: '2026-07-28T07:00:00Z'
  }, { conversationId: 3 })

  assert.equal(notification.notificationId, 'admin-broadcast-9')
  assert.equal(notification.type, 'ADMIN_BROADCAST')
  assert.equal(notification.content, '放假通知')
  assert.equal(notification.conversationId, 3)
  assert.equal(notification.readAt, '2026-07-28T08:00:00Z')
  assert.equal(notification.adminBroadcast, true)
})
