import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useForumTopicManagement } from './useForumTopicManagement.js'

function createTopicModel(overrides = {}) {
  const calls = []
  const successes = []
  const errors = []
  const topics = ref([{ topicId: 7, title: '旧标题', contentSummary: '旧内容', tag: '成长' }])
  const total = ref(1)
  const topicDetails = ref({})
  const topicScope = ref('all')
  const activeTab = ref('成长')
  const page = ref(3)
  const api = {
    async createForumTopic(data) {
      calls.push(['create', data])
      return { topicId: 8 }
    },
    async fetchForumTopicDetail(topicId) {
      calls.push(['detail', topicId])
      return {
        topicId,
        title: '完整标题',
        content: '完整内容',
        tag: '教育',
        media: [{ fileId: 31 }]
      }
    },
    async updateForumTopic(topicId, data) {
      calls.push(['update', topicId, data])
      return { ...data, content: data.content, media: [{ fileId: 32 }] }
    },
    async removeForumTopic(topicId) {
      calls.push(['remove', topicId])
    },
    ...overrides.api
  }
  const model = useForumTopicManagement({
    topics,
    total,
    topicDetails,
    topicScope,
    activeTab,
    page,
    reloadTopics: async () => { calls.push(['reload']) },
    api,
    confirm: async (...args) => { calls.push(['confirm', ...args]) },
    notify: {
      success(message) { successes.push(message) },
      error(message) { errors.push(message) }
    }
  })
  return {
    activeTab,
    calls,
    errors,
    model,
    page,
    successes,
    topicDetails,
    topicScope,
    topics,
    total
  }
}

test('forum topic management publishes a normalized draft and reloads mine', async () => {
  const { activeTab, calls, model, page, successes, topicScope } = createTopicModel()
  model.showForm.value = true
  model.newTopic.value = { title: ' 新话题 ', content: ' 新内容 ', tag: '成长' }
  model.newTopicMedia.value = [{ fileId: '21' }]

  await model.submitTopic()

  assert.deepEqual(calls, [
    ['create', {
      title: '新话题',
      content: '新内容',
      tag: '成长',
      mediaFileIds: [21]
    }],
    ['reload']
  ])
  assert.equal(topicScope.value, 'mine')
  assert.equal(activeTab.value, '')
  assert.equal(page.value, 1)
  assert.equal(model.showForm.value, false)
  assert.deepEqual(model.newTopicMedia.value, [])
  assert.deepEqual(successes, ['话题已发布并保存到后台'])
})

test('forum topic management loads details and persists edits', async () => {
  const { calls, model, successes, topicDetails, topics } = createTopicModel()
  const topic = topics.value[0]

  await model.startEditTopic(topic)
  model.topicEditForm.value.title = ' 修改标题 '
  model.topicEditForm.value.content = ' 修改内容 '
  model.topicEditMedia.value = [{ fileId: 41 }]
  await model.submitTopicEdit(topic)

  assert.deepEqual(calls, [
    ['detail', 7],
    ['update', 7, {
      title: '修改标题',
      content: '修改内容',
      tag: '教育',
      mediaFileIds: [41]
    }]
  ])
  assert.equal(topic.title, '修改标题')
  assert.equal(topic.contentSummary, '修改内容')
  assert.deepEqual(topic.media, [{ fileId: 32 }])
  assert.equal(topicDetails.value[7].content, '修改内容')
  assert.equal(model.editingTopicId.value, null)
  assert.deepEqual(successes, ['话题已更新'])
})

test('forum topic management removes confirmed topics and updates totals', async () => {
  const { calls, model, successes, topics, total } = createTopicModel()

  await model.deleteTopic(topics.value[0])

  assert.equal(calls[0][0], 'confirm')
  assert.deepEqual(calls[1], ['remove', 7])
  assert.deepEqual(topics.value, [])
  assert.equal(total.value, 0)
  assert.deepEqual(successes, ['话题已删除'])
})
