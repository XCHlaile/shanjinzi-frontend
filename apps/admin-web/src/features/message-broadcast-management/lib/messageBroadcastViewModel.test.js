import assert from 'node:assert/strict'
import test from 'node:test'

import {
  activeMessageSchools,
  availableMessageUsers,
  canRetryMessageBroadcast,
  emptyMessageBroadcastForm,
  joinedMessageIds,
  matchesMessageBroadcast,
  messageBroadcastExportFilter,
  messageBroadcastPayload,
  messageBroadcastScopeLabel,
  messageBroadcastStatusLabel,
  messageBroadcastStatusOptions,
  messageBroadcastUserLabel,
  messageBroadcastValidation,
  messageRecipientStatusLabel,
  messageRecipientStatusRows,
  shortMessageBroadcastDate
} from './messageBroadcastViewModel.js'

test('message broadcast view model filters and labels task rows', () => {
  const rows = [
    { id: 12, schoolId: 3, scope: 'SCHOOL', status: 'FAILED' },
    { id: 13, scope: 'PLATFORM', status: 'COMPLETED' }
  ]

  assert.deepEqual(messageBroadcastStatusOptions(rows), ['FAILED', 'COMPLETED'])
  assert.equal(matchesMessageBroadcast(rows[0], {
    keyword: '3',
    scope: 'SCHOOL',
    status: 'FAILED'
  }), true)
  assert.equal(matchesMessageBroadcast(rows[1], { scope: 'SCHOOL' }), false)
  assert.equal(messageBroadcastStatusLabel('PARTIAL_FAILED'), '部分失败')
  assert.equal(messageRecipientStatusLabel('DELIVERED'), '已送达')
  assert.equal(messageBroadcastScopeLabel('USER'), '指定用户')
})

test('message broadcast view model validates and builds strict payloads', () => {
  assert.equal(messageBroadcastValidation(emptyMessageBroadcastForm()), '请输入消息内容')
  assert.equal(messageBroadcastValidation({
    ...emptyMessageBroadcastForm(),
    scope: 'SCHOOL',
    content: '通知'
  }), '请选择学校')
  assert.equal(messageBroadcastValidation({
    ...emptyMessageBroadcastForm(),
    scope: 'USER',
    content: '通知'
  }), '请选择接收用户')

  assert.deepEqual(messageBroadcastPayload({
    scope: 'USER',
    schoolId: null,
    recipientUserIds: ['2', 'invalid', 3],
    content: ' 通知 ',
    attachmentFileIds: ['8', 0, 'invalid']
  }), {
    scope: 'USER',
    content: '通知',
    recipientUserIds: [2, 3],
    attachmentFileIds: [8]
  })
})

test('message broadcast view model normalizes options and details', () => {
  assert.deepEqual(activeMessageSchools([
    { id: 1, status: 'ACTIVE' },
    { id: 2, status: 'DISABLED' }
  ]), [{ id: 1, status: 'ACTIVE' }])
  assert.deepEqual(availableMessageUsers([
    { id: 1, status: 'ACTIVE' },
    { id: 2, status: 'DELETED' }
  ]), [{ id: 1, status: 'ACTIVE' }])
  assert.deepEqual(messageRecipientStatusRows({
    recipientStatusCounts: { SENT: 2, FAILED: 1 }
  }), [
    { status: 'SENT', count: 2 },
    { status: 'FAILED', count: 1 }
  ])
  assert.equal(messageBroadcastUserLabel({
    realName: '赵老师',
    phone: '13900000000'
  }), '赵老师 · 13900000000')
})

test('message broadcast view model centralizes export and display helpers', () => {
  assert.deepEqual(messageBroadcastExportFilter({
    keyword: ' 12 ',
    scope: 'SCHOOL',
    status: 'FAILED'
  }), {
    keyword: '12',
    scope: 'SCHOOL',
    status: 'FAILED'
  })
  assert.equal(canRetryMessageBroadcast({ failureCount: 1 }), true)
  assert.equal(canRetryMessageBroadcast({ status: 'PARTIAL_FAILED' }), true)
  assert.equal(canRetryMessageBroadcast({ status: 'COMPLETED' }), false)
  assert.equal(joinedMessageIds([2, 3]), '2, 3')
  assert.equal(joinedMessageIds([]), '-')
  assert.equal(shortMessageBroadcastDate('2026-07-31T12:34:56.000Z'), '2026-07-31 12:34:56')
})
