import assert from 'node:assert/strict'
import test from 'node:test'

import { useStudentBinding } from './useStudentBinding.js'

function createBindingModel(apiOverrides = {}, options = {}) {
  const calls = []
  const messages = []
  const model = useStudentBinding({
    api: {
      async bindGuardian(payload) {
        calls.push(['bind', payload])
        return { bindStatus: 'APPROVED' }
      },
      async unbindGuardian(bindingId) {
        calls.push(['unbind', bindingId])
      },
      ...apiOverrides
    },
    schoolApi: {
      async fetchPublicSchools(query) {
        calls.push(['schools', query])
        return {
          items: [
            { id: 3, name: '山金子小学' },
            { id: null, name: '无效学校' }
          ]
        }
      }
    },
    confirm: async (...args) => {
      calls.push(['confirm', ...args])
      if (options.cancelConfirmation) throw 'cancel'
    },
    notify: {
      success: message => messages.push(['success', message]),
      error: message => messages.push(['error', message]),
      warning: message => messages.push(['warning', message])
    },
    reloadStudents: async () => calls.push(['reload'])
  })
  return { calls, messages, model }
}

test('student binding loads valid schools and resets an unavailable selection', async () => {
  const { calls, model } = createBindingModel()
  model.bindForm.schoolId = 99

  await model.loadSchools()

  assert.deepEqual(calls, [['schools', { page: 1, pageSize: 100 }]])
  assert.deepEqual(model.schoolOptions.value, [{ id: 3, name: '山金子小学' }])
  assert.equal(model.bindForm.schoolId, '')
  assert.equal(model.schoolLoadError.value, '')
  assert.equal(model.schoolsLoading.value, false)
})

test('student binding validates and submits a strict guardian payload', async () => {
  const { calls, messages, model } = createBindingModel(
    {
      async bindGuardian(payload) {
        calls.push(['bind', payload])
        return { status: 'PENDING' }
      }
    }
  )

  assert.equal(await model.submitBinding(), false)
  assert.deepEqual(messages, [['warning', '请选择学校']])

  Object.assign(model.bindForm, {
    schoolId: '3',
    studentName: ' 小金 ',
    studentNo: ' S003 ',
    birthday: '2020-08-01',
    bindCode: ' CODE-3 ',
    relationType: 'MOTHER'
  })
  assert.equal(await model.submitBinding(), true)

  assert.deepEqual(calls, [
    ['bind', {
      schoolId: 3,
      studentName: '小金',
      studentNo: 'S003',
      birthday: '2020-08-01',
      bindCode: 'CODE-3',
      relationType: 'MOTHER'
    }],
    ['reload']
  ])
  assert.equal(model.bindDialogVisible.value, false)
  assert.match(model.bindFeedback.value, /绑定申请已提交/)
  assert.equal(model.binding.value, false)
  assert.deepEqual(messages.at(-1), ['success', '绑定申请已提交'])
})

test('student binding confirms and reloads after unbinding an active student', async () => {
  const { calls, messages, model } = createBindingModel()

  assert.equal(
    await model.unbindStudent({
      id: 7,
      name: '小山',
      bindingId: 11,
      bindStatus: 'APPROVED'
    }),
    true
  )

  assert.equal(calls[0][0], 'confirm')
  assert.deepEqual(calls.slice(1), [['unbind', 11], ['reload']])
  assert.deepEqual(messages, [['success', '学生绑定已解除']])
  assert.equal(model.unbindingId.value, null)
})

test('student binding ignores a cancelled unbind confirmation', async () => {
  const { calls, messages, model } = createBindingModel(
    {},
    { cancelConfirmation: true }
  )

  assert.equal(
    await model.unbindStudent({
      id: 7,
      name: '小山',
      bindingId: 11,
      bindStatus: 'BOUND'
    }),
    false
  )

  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], 'confirm')
  assert.deepEqual(messages, [])
})
