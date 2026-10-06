import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useForumInteractions } from './useForumInteractions.js'

function createInteractionModel() {
  const calls = []
  const successes = []
  const errors = []
  const topicDetails = ref({
    7: { topicId: 7, likedByMe: false, likesCount: 2 }
  })
  const api = {
    async likeForumTopic(topicId) {
      calls.push(['like', topicId])
      return { liked: true, likesCount: 3 }
    },
    async unlikeForumTopic(topicId) {
      calls.push(['unlike', topicId])
      return { liked: false, likesCount: 2 }
    },
    async reportForumTopic(topicId, data) {
      calls.push(['report-topic', topicId, data])
      return { reportId: 51 }
    },
    async reportForumReply(topicId, replyId, data) {
      calls.push(['report-reply', topicId, replyId, data])
      return { reportId: 52 }
    }
  }
  const model = useForumInteractions({
    topicDetails,
    api,
    prompt: async (...args) => {
      calls.push(['prompt', args[1]])
      return { value: ' 广告内容 ' }
    },
    notify: {
      success(message) { successes.push(message) },
      error(message) { errors.push(message) }
    }
  })
  return { calls, errors, model, successes, topicDetails }
}

test('forum interactions toggles likes and synchronizes topic details', async () => {
  const { calls, model, topicDetails } = createInteractionModel()
  const topic = { topicId: 7, likedByMe: false, likesCount: 2 }

  await model.toggleLike(topic)
  await model.toggleLike(topic)

  assert.deepEqual(calls, [['like', 7], ['unlike', 7]])
  assert.equal(topic.likedByMe, false)
  assert.equal(topic.likesCount, 2)
  assert.equal(topicDetails.value[7].likedByMe, false)
  assert.equal(topicDetails.value[7].likesCount, 2)
  assert.equal(model.likingTopicId.value, null)
})

test('forum interactions reports a topic with a normalized reason', async () => {
  const { calls, model, successes } = createInteractionModel()

  await model.reportTopic({ topicId: 7 })

  assert.deepEqual(calls, [
    ['prompt', '举报话题'],
    ['report-topic', 7, { reason: '广告内容' }]
  ])
  assert.deepEqual(successes, ['举报已提交（编号 #51）'])
  assert.equal(model.reportingTarget.value, '')
})

test('forum interactions reports a reply against its parent topic', async () => {
  const { calls, model, successes } = createInteractionModel()

  await model.reportReply({ topicId: 7 }, { replyId: 8 })

  assert.deepEqual(calls, [
    ['prompt', '举报回复'],
    ['report-reply', 7, 8, { reason: '广告内容' }]
  ])
  assert.deepEqual(successes, ['举报已提交（编号 #52）'])
  assert.equal(model.reportingTarget.value, '')
})
