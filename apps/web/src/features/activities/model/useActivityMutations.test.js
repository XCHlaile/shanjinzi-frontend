import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useActivityMutations } from './useActivityMutations.js'

function createMutationModel() {
  const calls = []
  const successes = []
  const errors = []
  const activityList = ref([
    {
      id: 7,
      content: '旧内容',
      media: [],
      likedByMe: false,
      likes: 2,
      authorUserId: 10
    }
  ])
  const api = {
    async updateActivity(id, data) {
      calls.push(['update', id, data])
      return { content: data.content, media: [{ fileId: 32 }] }
    },
    async removeActivity(id) {
      calls.push(['remove', id])
    },
    async likeActivity(id) {
      calls.push(['like', id])
      return { likedByMe: true, likesCount: 3 }
    },
    async unlikeActivity(id) {
      calls.push(['unlike', id])
      return { likedByMe: false, likesCount: 2 }
    },
    async reportActivity(id, data) {
      calls.push(['report-moment', id, data])
      return { reportId: 51 }
    },
    async reportActivityComment(id, commentId, data) {
      calls.push(['report-comment', id, commentId, data])
      return { reportId: 52 }
    }
  }
  const model = useActivityMutations({
    activityList,
    currentUserId: '10',
    api,
    confirm: async (...args) => { calls.push(['confirm', ...args]) },
    prompt: async (...args) => {
      calls.push(['prompt', args[1]])
      return { value: ' 广告内容 ' }
    },
    notify: {
      success(message) { successes.push(message) },
      error(message) { errors.push(message) }
    }
  })
  return { activityList, calls, errors, model, successes }
}

test('activity mutations edits content and media through a strict payload', async () => {
  const { activityList, calls, model, successes } = createMutationModel()
  const item = activityList.value[0]
  model.startEditActivity(item)
  model.editForm.content = ' 修改内容 '
  model.editMedia.value = [{ fileId: '21' }]

  await model.saveActivityEdit(item)

  assert.deepEqual(calls, [
    ['update', 7, { content: '修改内容', mediaFileIds: [21] }]
  ])
  assert.equal(item.content, '修改内容')
  assert.deepEqual(item.media, [{ fileId: 32 }])
  assert.equal(model.editingMomentId.value, null)
  assert.deepEqual(successes, ['动态已更新'])
})

test('activity mutations deletes a confirmed activity from the list', async () => {
  const { activityList, calls, model, successes } = createMutationModel()

  await model.deleteActivity(activityList.value[0])

  assert.equal(calls[0][0], 'confirm')
  assert.deepEqual(calls[1], ['remove', 7])
  assert.deepEqual(activityList.value, [])
  assert.deepEqual(successes, ['动态已删除'])
})

test('activity mutations toggles backend like state', async () => {
  const { activityList, calls, model } = createMutationModel()
  const item = activityList.value[0]

  await model.toggleActivityLike(item)
  await model.toggleActivityLike(item)

  assert.deepEqual(calls, [['like', 7], ['unlike', 7]])
  assert.equal(item.likedByMe, false)
  assert.equal(item.likes, 2)
  assert.equal(model.likingMomentId.value, null)
})

test('activity mutations reports activities and comments with normalized reasons', async () => {
  const { activityList, calls, model, successes } = createMutationModel()
  const item = activityList.value[0]

  await model.reportActivity(item)
  await model.reportActivityComment(item, { commentId: 8 })

  assert.deepEqual(calls, [
    ['prompt', '举报动态'],
    ['report-moment', 7, { reason: '广告内容' }],
    ['prompt', '举报评论'],
    ['report-comment', 7, 8, { reason: '广告内容' }]
  ])
  assert.deepEqual(successes, ['举报已提交（编号 #51）', '举报已提交（编号 #52）'])
  assert.equal(model.reportingTarget.value, '')
  assert.equal(model.canReportMoment(item), false)
  assert.equal(model.canReportMoment({ authorUserId: 11 }), true)
})
