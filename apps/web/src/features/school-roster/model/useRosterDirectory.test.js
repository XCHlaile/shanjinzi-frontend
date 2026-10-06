import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useRosterDirectory } from './useRosterDirectory.js'

function createDirectory(initialMode = 'students', { includeForeign = false } = {}) {
  const calls = []
  const mode = ref(initialMode)
  const api = {
    async listOpenStudents(options) {
      calls.push(['students', options])
      if (options.name) return { items: [], total: 0, totalPages: 0 }
      return {
        items: [{ id: 7, name: '小明', schoolId: 3, guardiansCount: 1 }],
        total: 1,
        totalPages: 1
      }
    },
    async getOpenStudent(id) {
      calls.push(['student-detail', id])
      return {
        id,
        schoolId: 3,
        studentNo: 'S-7',
        classes: [{ classId: 11, className: '一班', isPrimary: true }]
      }
    },
    async listOpenStudentGuardians(id) {
      calls.push(['guardians', id])
      return { items: [{ id: 21, status: 'BOUND' }] }
    },
    async listOpenUsers(options) {
      calls.push(['users', options])
      return {
        items: [
          { id: 8, realName: '王老师', schoolId: 3 },
          ...(includeForeign ? [{ id: 9, realName: '外校教师', schoolId: 4 }] : [])
        ],
        total: includeForeign ? 2 : 1,
        totalPages: 1
      }
    }
  }
  const directory = useRosterDirectory({
    mode,
    modeLabel: ref(initialMode === 'students' ? '学生' : '教师'),
    roleCode: ref(initialMode === 'teachers' ? 'TEACHER' : 'PARENT'),
    api,
    getUser: () => ({ schoolId: 3 }),
    refreshUser: async () => ({ schoolId: 3 })
  })
  return { calls, directory, mode }
}

test('roster directory falls back across student search fields and enriches rows', async () => {
  const { calls, directory } = createDirectory()
  directory.keyword.value = '小明'

  await directory.loadRows()

  assert.deepEqual(calls.slice(0, 2), [
    ['students', { schoolId: 3, page: 1, pageSize: 20, status: undefined, name: '小明' }],
    ['students', { schoolId: 3, page: 1, pageSize: 20, status: undefined, studentNo: '小明' }]
  ])
  assert.equal(directory.rows.value[0].studentNo, 'S-7')
  assert.equal(directory.rows.value[0].className, '一班')
  assert.equal(directory.rows.value[0].guardianCount, 1)
  assert.equal(calls.some(call => call[0] === 'guardians'), false)
})

test('roster directory skips per-row requests when list responses include summary fields', async () => {
  const apiCalls = []
  const aggregated = useRosterDirectory({
    mode: ref('students'),
    modeLabel: ref('学生'),
    roleCode: ref('PARENT'),
    api: {
      async listOpenStudents() {
        apiCalls.push('list')
        return {
          items: [{
            id: 9,
            schoolId: 3,
            name: '小新',
            studentNo: 'S-9',
            classId: 12,
            className: '二班',
            guardiansCount: 2
          }],
          total: 1,
          totalPages: 1
        }
      },
      async getOpenStudent() { apiCalls.push('detail') },
      async listOpenStudentGuardians() { apiCalls.push('guardians') }
    },
    getUser: () => ({ schoolId: 3 }),
    refreshUser: async () => ({ schoolId: 3 })
  })

  await aggregated.loadRows()

  assert.deepEqual(apiCalls, ['list'])
  assert.equal(aggregated.rows.value[0].className, '二班')
  assert.equal(aggregated.rows.value[0].guardianCount, 2)
})

test('roster directory submits role, status, and class filters for users', async () => {
  const { calls, directory } = createDirectory('teachers')
  directory.keyword.value = '王'
  directory.statusFilter.value = 'ENABLED'
  directory.classIdFilter.value = 11

  await directory.loadRows()

  assert.deepEqual(calls, [[
    'users',
    {
      schoolId: 3,
      page: 1,
      pageSize: 20,
      realName: '王',
      roleCode: 'TEACHER',
      status: 'ENABLED',
      classId: 11
    }
  ]])
  assert.equal(directory.rows.value[0].realName, '王老师')
  assert.equal(directory.total.value, 1)
})

test('roster directory locks candidate resources to the signed-in school', async () => {
  const { directory } = createDirectory()

  assert.equal(await directory.resolveSchoolId(), 3)
  assert.equal(await directory.resolveSchoolId(3), 3)
  await assert.rejects(() => directory.resolveSchoolId(9), /其他学校/)
})

test('roster directory drops records returned outside the signed-in school', async () => {
  const { directory } = createDirectory('teachers', { includeForeign: true })

  await directory.loadRows()

  assert.deepEqual(directory.rows.value.map(item => item.schoolId), [3])
  assert.equal(directory.total.value, 1)
})
