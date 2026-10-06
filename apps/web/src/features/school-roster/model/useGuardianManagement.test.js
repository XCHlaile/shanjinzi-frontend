import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useGuardianManagement } from './useGuardianManagement.js'

function createGuardianModel(apiOverrides = {}) {
  const calls = []
  const successes = []
  const errors = []
  const rows = ref([{ id: 7, name: '小明', guardianCount: 0 }])
  const api = {
    async listOpenStudentGuardians(studentId) {
      calls.push(['list-guardians', studentId])
      return {
        items: [
          { guardianUserId: 21, guardianName: '家长甲', bindStatus: 'BOUND' },
          { guardianUserId: 22, guardianName: '家长乙', guardianPhone: '13900000022', bindStatus: 'UNBOUND' }
        ]
      }
    },
    async getOpenUser(userId) {
      calls.push(['get-user', userId])
      return { id: userId, phone: `139000000${userId}` }
    },
    async listOpenUsers(options) {
      calls.push(['list-users', options])
      return {
        items: [
          { id: 21, realName: '家长甲', schoolId: 3 },
          { id: 23, realName: '其他学校家长', schoolId: 4 }
        ]
      }
    },
    async bindOpenUserStudents(parentId, studentIds, relationType) {
      calls.push(['bind', parentId, studentIds, relationType])
    },
    async unbindOpenStudentGuardian(studentId, guardianUserId) {
      calls.push(['unbind', studentId, guardianUserId])
    },
    ...apiOverrides
  }
  const model = useGuardianManagement({
    rows,
    resolveSchoolId: async () => 3,
    api,
    confirm: async (...args) => { calls.push(['confirm', ...args]) },
    notify: {
      success(message) { successes.push(message) },
      error(message) { errors.push(message) }
    }
  })
  return { calls, errors, model, rows, successes }
}

test('guardian management enriches phone numbers and updates the roster count', async () => {
  const { calls, model, rows } = createGuardianModel()

  await model.openGuardians({ id: 7, name: '小明', schoolId: 3 })

  assert.equal(model.guardianDialog.value, true)
  assert.equal(model.guardianError.value, '')
  assert.deepEqual(model.guardians.value.map(item => item.guardianPhone), [
    '13900000021',
    '13900000022'
  ])
  assert.equal(rows.value[0].guardianCount, 1)
  assert.deepEqual(calls, [
    ['list-guardians', 7],
    ['get-user', 21],
    ['get-user', 22]
  ])
})

test('guardian management keeps parent search within the current school', async () => {
  const { calls, model } = createGuardianModel()
  model.activeStudent.value = { id: 7, schoolId: 3 }

  await model.searchParentOptions('13900000000')

  assert.deepEqual(model.parentOptions.value.map(item => item.id), [21])
  assert.deepEqual(calls, [[
    'list-users',
    {
      page: 1,
      pageSize: 100,
      roleCode: 'PARENT',
      schoolId: 3,
      status: 'ACTIVE',
      phone: '13900000000'
    }
  ]])
})

test('guardian management binds and unbinds through confirmed backend actions', async () => {
  const { calls, model, rows, successes } = createGuardianModel({
    async listOpenStudentGuardians(studentId) {
      calls.push(['list-guardians', studentId])
      return { items: [{ guardianUserId: 21, guardianName: '家长甲', bindStatus: 'BOUND' }] }
    }
  })
  model.activeStudent.value = { id: 7, name: '小明', schoolId: 3 }
  model.parentOptions.value = [{ id: 21, realName: '家长甲', schoolId: 3 }]
  model.bindGuardianForm.parentId = 21
  model.bindGuardianForm.relationType = 'MOTHER'

  await model.submitGuardianBinding()
  await model.unbindStudentGuardian({ guardianUserId: 21 })

  assert.ok(calls.some(call => (
    call[0] === 'bind'
    && call[1] === 21
    && call[2][0] === 7
    && call[3] === 'MOTHER'
  )))
  assert.ok(calls.some(call => call[0] === 'unbind' && call[1] === 7 && call[2] === 21))
  assert.equal(rows.value[0].guardianCount, 0)
  assert.deepEqual(successes, ['家长绑定成功', '家长绑定已解除'])
})
