import assert from 'node:assert/strict'
import test from 'node:test'

import { createForumApi } from './forumApi.js'

function recordingTransport(calls) {
  return Object.fromEntries(['get', 'post', 'put', 'delete'].map(method => [
    method,
    (path, data) => {
      calls.push({ method: method.toUpperCase(), path, data })
      return Promise.resolve({ ok: true })
    }
  ]))
}

test('forum API owns topic, reply, reaction, and report requests', async () => {
  const calls = []
  const api = createForumApi(recordingTransport(calls))

  await api.fetchTopics({ tag: '育儿交流' })
  await api.createTopic({ title: '主题', body: '正文', mediaFileIds: ['8'] })
  await api.replyTopic(6, { text: '回复', mediaFileIds: ['9'] })
  await api.updateForumReply(6, 7, { content: '更新', mediaFileIds: ['10'] })
  await api.reportForumTopic(6, { reason: '  广告  ' })
  await api.unlikeForumTopic(6)

  assert.deepEqual(calls, [
    {
      method: 'GET',
      path: '/api/app/forum-topics',
      data: { query: { page: 1, pageSize: 10, tag: '育儿交流' } }
    },
    {
      method: 'POST',
      path: '/api/app/forum-topics',
      data: { title: '主题', content: '正文', mediaFileIds: [8] }
    },
    {
      method: 'POST',
      path: '/api/app/forum-topics/6/replies',
      data: { content: '回复', mediaFileIds: [9] }
    },
    {
      method: 'PUT',
      path: '/api/app/forum-topics/6/replies/7',
      data: { content: '更新', mediaFileIds: [10] }
    },
    {
      method: 'POST',
      path: '/api/app/forum-topics/6/reports',
      data: { reason: '广告' }
    },
    { method: 'DELETE', path: '/api/app/forum-topics/6/like', data: undefined }
  ])
  assert.ok(Object.isFrozen(api))
})
