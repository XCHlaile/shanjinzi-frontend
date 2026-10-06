import assert from 'node:assert/strict'
import test from 'node:test'

import {
  contactRoleText,
  displayUnread,
  mergeById,
  notificationTypeLabel,
  sortConversations,
  sortMessages
} from '../index.js'

test('message presentation helpers are exported from the feature', () => {
  assert.equal(typeof contactRoleText, 'function')
})

test('builds contact context and notification labels', () => {
  assert.equal(contactRoleText(
    { roles: ['TEACHER'] },
    { role: 'parent', currentStudent: { schoolName: '山前幼儿园' } }
  ), '山前幼儿园·教师')
  assert.equal(notificationTypeLabel('ADMIN_BROADCAST'), '平台通知')
  assert.equal(displayUnread(120), '99+')
})

test('merges and sorts conversation and message records', () => {
  assert.deepEqual(mergeById([{ id: 1, value: 'old' }], [{ id: 1, value: 'new' }], 'id'), [
    { id: 1, value: 'new' }
  ])
  assert.equal(sortConversations([
    { id: 1, pinned: false, lastMessageAt: '2026-01-02' },
    { id: 2, pinned: true, lastMessageAt: '2026-01-01' }
  ])[0].id, 2)
  assert.deepEqual(sortMessages([
    { messageId: 2, createdAt: '2026-01-02' },
    { messageId: 1, createdAt: '2026-01-01' }
  ]).map(item => item.messageId), [1, 2])
})
