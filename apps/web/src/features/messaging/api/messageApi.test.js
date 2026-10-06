import assert from 'node:assert/strict'
import test from 'node:test'

import { createMessageApi } from './messageApi.js'

function recordingTransport(calls) {
  return Object.fromEntries(['get', 'post', 'patch', 'delete'].map(method => [
    method,
    (path, data) => {
      calls.push({ method: method.toUpperCase(), path, data })
      return Promise.resolve({ ok: true })
    }
  ]))
}

test('message API owns conversations, notifications, and payload normalization', async () => {
  const calls = []
  const api = createMessageApi(recordingTransport(calls))

  await api.fetchMessageHistory('conversation/7', { page: 2 })
  await api.sendMessage({
    receiverId: '9',
    text: 'hello',
    attachmentFileIds: ['3', 4]
  })
  await api.updateConversationSettings(7, { pinned: false, ignored: true })
  await api.markNotificationRead(11)

  assert.deepEqual(calls, [
    {
      method: 'GET',
      path: '/api/app/messages/conversations/conversation%2F7/messages',
      data: { query: { page: 2, pageSize: 50 } }
    },
    {
      method: 'POST',
      path: '/api/app/messages',
      data: {
        receiverId: 9,
        content: 'hello',
        attachmentFileIds: [3, 4]
      }
    },
    {
      method: 'PATCH',
      path: '/api/app/messages/conversations/7/settings',
      data: { pinned: false }
    },
    {
      method: 'PATCH',
      path: '/api/app/notifications/11/read',
      data: undefined
    }
  ])
  assert.ok(Object.isFrozen(api))
})
