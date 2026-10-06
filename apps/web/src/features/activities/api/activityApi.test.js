import assert from 'node:assert/strict'
import test from 'node:test'

import { createActivityApi } from './activityApi.js'

function recordingTransport(calls) {
  return Object.fromEntries(['get', 'post', 'put', 'delete'].map(method => [
    method,
    (path, data) => {
      calls.push({ method: method.toUpperCase(), path, data })
      return Promise.resolve({ ok: true })
    }
  ]))
}

test('activity API owns moment queries and mutations', async () => {
  const calls = []
  const api = createActivityApi(recordingTransport(calls))

  await api.fetchActivities({ page: 2 }, { signal: 'request-signal' })
  await api.createActivity({
    content: '成长记录',
    classId: '8',
    mediaFileIds: ['10'],
    studentIds: ['11']
  })
  await api.updateActivity(4, { content: '修订记录', mediaFileIds: ['12'] })
  await api.commentActivity(4, { text: '收到', mediaFileIds: ['13'] })
  await api.reportActivityComment(4, 9, { reason: '  不当内容  ' })

  assert.deepEqual(calls, [
    {
      method: 'GET',
      path: '/api/app/moments',
      data: { signal: 'request-signal', query: { page: 2, pageSize: 10 } }
    },
    {
      method: 'POST',
      path: '/api/app/moments',
      data: { content: '成长记录', classId: 8, mediaFileIds: [10], studentIds: [11] }
    },
    {
      method: 'PUT',
      path: '/api/app/moments/4',
      data: { content: '修订记录', mediaFileIds: [12] }
    },
    {
      method: 'POST',
      path: '/api/app/moments/4/comments',
      data: { content: '收到', mediaFileIds: [13] }
    },
    {
      method: 'POST',
      path: '/api/app/moments/4/comments/9/reports',
      data: { reason: '不当内容' }
    }
  ])
  assert.ok(Object.isFrozen(api))
})
