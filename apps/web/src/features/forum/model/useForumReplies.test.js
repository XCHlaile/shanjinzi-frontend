import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useForumReplies } from './useForumReplies.js'

function createReplyModel(apiOverrides = {}) {
  const calls = []
  const successes = []
  const topicDetails = ref({})
  const api = {
    async fetchForumTopicDetail(topicId) {
      calls.push(['detail', topicId])
      return { topicId, viewsCount: 12, repliesCount: 1 }
    },
    async fetchForumReplies(topicId, options) {
      calls.push(['replies', topicId, options])
      return {
        items: [{ replyId: options.page, content: `第 ${options.page} 页` }],
        page: options.page,
        totalPages: 2
      }
    },
    async replyForumTopic(topicId, data) {
      calls.push(['reply', topicId, data])
      return { replyId: 9, content: data.content, media: [] }
    },
    async updateForumReply(topicId, replyId, data) {
      calls.push(['update', topicId, replyId, data])
      return { replyId, content: data.content }
    },
    async removeForumReply(topicId, replyId) {
      calls.push(['remove', topicId, replyId])
    },
    ...apiOverrides
  }
  const model = useForumReplies({
    topicDetails,
    api,
    confirm: async (...args) => { calls.push(['confirm', ...args]) },
    notify: {
      success(message) { successes.push(message) },
      error() {}
    }
  })
  return { calls, model, successes, topicDetails }
}

test('forum reply model loads topic details and paginates replies', async () => {
  const { calls, model, topicDetails } = createReplyModel()
  const topic = { topicId: 7, viewsCount: 0, repliesCount: 0 }

  await model.toggleTopic(topic)
  await model.loadMoreReplies(7)

  assert.equal(model.expandedTopicId.value, 7)
  assert.equal(topic.viewsCount, 12)
  assert.equal(topicDetails.value[7].topicId, 7)
  assert.deepEqual(model.repliesByTopic.value[7].map(reply => reply.replyId), [1, 2])
  assert.equal(model.canLoadMoreReplies(7), false)
  assert.deepEqual(calls, [
    ['detail', 7],
    ['replies', 7, { page: 1, pageSize: 20 }],
    ['replies', 7, { page: 2, pageSize: 20 }]
  ])
})

test('forum reply model submits text or attachment replies and resets drafts', async () => {
  const { calls, model, successes, topicDetails } = createReplyModel()
  const topic = { topicId: 7, repliesCount: 1 }
  topicDetails.value = { 7: { repliesCount: 1 } }
  model.replyTexts.value = { 7: '  收到  ' }
  model.setReplyMedia(7, [{ fileId: '21' }])

  assert.equal(model.canSubmitReply(7), true)
  await model.submitReply(topic)

  assert.deepEqual(calls, [[
    'reply',
    7,
    { content: '收到', mediaFileIds: [21] }
  ]])
  assert.equal(topic.repliesCount, 2)
  assert.equal(topicDetails.value[7].repliesCount, 2)
  assert.equal(model.replyTexts.value[7], '')
  assert.deepEqual(model.replyMediaByTopic.value[7], [])
  assert.deepEqual(successes, ['回复已提交并保存到后台'])
})

test('forum reply model updates and deletes replies through confirmed actions', async () => {
  const { calls, model, successes } = createReplyModel()
  const topic = { topicId: 7, repliesCount: 1 }
  const reply = { replyId: 9, content: '原回复', media: [] }
  model.repliesByTopic.value = { 7: [reply] }

  model.startEditReply(reply)
  model.replyEditText.value = '更新回复'
  await model.submitReplyEdit(topic, reply)
  await model.deleteReply(topic, reply)

  assert.equal(reply.content, '更新回复')
  assert.deepEqual(model.repliesByTopic.value[7], [])
  assert.equal(topic.repliesCount, 0)
  assert.ok(calls.some(call => call[0] === 'update' && call[2] === 9))
  assert.ok(calls.some(call => call[0] === 'remove' && call[2] === 9))
  assert.deepEqual(successes, ['回复已更新', '回复已删除'])
})
