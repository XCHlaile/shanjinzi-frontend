import assert from 'node:assert/strict'
import test from 'node:test'

import { useActivityComments } from './useActivityComments.js'

function createCommentModel(apiOverrides = {}) {
  const calls = []
  const successes = []
  const api = {
    async fetchActivityComments(momentId, options) {
      calls.push(['list', momentId, options])
      return {
        items: [
          { commentId: 3, userId: 9, content: '第一条' },
          { commentId: 4, userId: 10, content: '第二条' }
        ]
      }
    },
    async commentActivity(momentId, data) {
      calls.push(['create', momentId, data])
      return { commentId: 5, userId: 9, content: data.content }
    },
    async removeActivityComment(momentId, commentId) {
      calls.push(['remove', momentId, commentId])
    },
    ...apiOverrides
  }
  const model = useActivityComments({
    currentUserId: '9',
    api,
    confirm: async (...args) => { calls.push(['confirm', ...args]) },
    notify: {
      success(message) { successes.push(message) },
      error() {}
    }
  })
  return { calls, model, successes }
}

test('activity comment model loads and closes a moment thread', async () => {
  const { calls, model } = createCommentModel()
  const moment = { id: 7 }

  await model.toggleComments(moment)

  assert.equal(model.activeMomentId.value, 7)
  assert.deepEqual(model.comments.value.map(comment => comment.commentId), [3, 4])
  assert.equal(model.canDeleteComment(model.comments.value[0]), true)
  assert.equal(model.canDeleteComment(model.comments.value[1]), false)
  assert.deepEqual(calls, [['list', 7, { page: 1, pageSize: 100 }]])

  model.commentText.value = 'draft'
  await model.toggleComments(moment)
  assert.equal(model.activeMomentId.value, null)
  assert.equal(model.commentText.value, '')
})

test('activity comment model submits text and attachments then resets its draft', async () => {
  const { calls, model, successes } = createCommentModel()
  const moment = { id: 7, comments: 2 }
  model.commentText.value = '  新评论  '
  model.commentMedia.value = [{ fileId: '21' }]

  assert.equal(model.canSubmitComment.value, true)
  await model.submitComment(moment)

  assert.deepEqual(calls, [[
    'create',
    7,
    { content: '新评论', mediaFileIds: [21] }
  ]])
  assert.equal(moment.comments, 3)
  assert.equal(model.commentText.value, '')
  assert.deepEqual(model.commentMedia.value, [])
  assert.deepEqual(successes, ['评论已发布'])
})

test('activity comment model deletes through a confirmed backend action', async () => {
  const { calls, model, successes } = createCommentModel()
  const moment = { id: 7, comments: 1 }
  const comment = { commentId: 3, userId: 9 }
  model.comments.value = [comment]

  await model.deleteComment(moment, comment)

  assert.deepEqual(model.comments.value, [])
  assert.equal(moment.comments, 0)
  assert.ok(calls.some(call => call[0] === 'confirm'))
  assert.ok(calls.some(call => call[0] === 'remove' && call[1] === 7 && call[2] === 3))
  assert.deepEqual(successes, ['评论已删除'])
})
