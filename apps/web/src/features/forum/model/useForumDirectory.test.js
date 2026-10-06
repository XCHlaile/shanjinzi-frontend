import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useForumDirectory } from './useForumDirectory.js'

function createDirectory() {
  const calls = []
  const topicDetails = ref({})
  const expandedTopicId = ref(null)
  const repliesByTopic = ref({})
  const replyPages = ref({})
  const api = {
    async fetchForumTopics(options) {
      calls.push(['topics', options])
      return {
        items: [{ topicId: 7, title: '新话题', likesCount: 2 }],
        total: 1,
        totalPages: 1
      }
    },
    async fetchMyForumTopics(options) {
      calls.push(['mine', options])
      return { items: [{ topicId: 8, title: '我的话题' }], total: 1, totalPages: 1 }
    },
    async fetchForumTopicDetail(topicId) {
      calls.push(['detail', topicId])
      return { topicId, viewsCount: 12, likesCount: 4, repliesCount: 2, likedByMe: true }
    }
  }
  const directory = useForumDirectory({
    topicDetails,
    expandedTopicId,
    repliesByTopic,
    replyPages,
    fetchLatestReplies: async topicId => {
      calls.push(['latest-replies', topicId])
      return {
        items: [{ replyId: 2, createdAt: '2026-07-31T02:00:00Z' }],
        totalPages: 2
      }
    },
    api
  })
  return {
    calls,
    directory,
    expandedTopicId,
    repliesByTopic,
    replyPages,
    topicDetails
  }
}

test('forum directory loads tagged topic pages and resets pagination', async () => {
  const { calls, directory } = createDirectory()
  directory.page.value = 3

  await directory.selectTab('成长')

  assert.deepEqual(calls, [['topics', { page: 1, pageSize: 20, tag: '成长' }]])
  assert.equal(directory.page.value, 1)
  assert.equal(directory.topics.value[0].topicId, 7)
  assert.equal(directory.total.value, 1)
})

test('forum directory switches to the current user topic scope', async () => {
  const { calls, directory } = createDirectory()

  await directory.selectScope('mine')

  assert.deepEqual(calls, [['mine', { page: 1, pageSize: 20 }]])
  assert.equal(directory.topicScope.value, 'mine')
  assert.equal(directory.activeTab.value, '')
  assert.equal(directory.topics.value[0].topicId, 8)
})

test('forum directory live refresh merges expanded topic details and replies', async () => {
  const {
    calls,
    directory,
    expandedTopicId,
    repliesByTopic,
    replyPages,
    topicDetails
  } = createDirectory()
  directory.topics.value = [{ topicId: 7, title: '旧话题', likedByMe: false }]
  repliesByTopic.value = {
    7: [{ replyId: 1, createdAt: '2026-07-31T01:00:00Z' }]
  }
  replyPages.value = { 7: { page: 1, totalPages: 1 } }
  expandedTopicId.value = 7

  await directory.refreshForumLive()

  assert.deepEqual(calls.map(call => call[0]), ['topics', 'detail', 'latest-replies'])
  assert.equal(directory.topics.value[0].title, '新话题')
  assert.equal(directory.topics.value[0].likedByMe, true)
  assert.equal(topicDetails.value[7].viewsCount, 12)
  assert.deepEqual(repliesByTopic.value[7].map(reply => reply.replyId), [1, 2])
  assert.deepEqual(replyPages.value[7], { page: 1, totalPages: 2 })
})
