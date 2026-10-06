import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useRosterRecordManagement } from './useRosterRecordManagement.js'

function createRecordModel(initialMode = 'students') {
  const calls = []
  const successes = []
  const errors = []
  const mode = ref(initialMode)
  const api = {
    async fetchPublicClasses(options) {
      calls.push(['classes', options])
      return {
        items: [
          { id: 12, name: '二班', schoolId: 3, sortOrder: 2 },
          { id: 11, name: '一班', schoolId: 3, sortOrder: 1 },
          { id: 99, name: '外校班', schoolId: 4, sortOrder: 0 }
        ]
      }
    },
    async getOpenStudent(id) {
      calls.push(['student-detail', id])
      return {
        id,
        name: '小明',
        studentNo: 'S-1',
        schoolId: 3,
        classes: [{ classId: 11, className: '一班', isPrimary: true }]
      }
    },
    async updateOpenStudent(id, data) {
      calls.push(['update-student', id, { ...data }])
    },
    async setOpenStudentClass(id, classId) {
      calls.push(['set-class', id, classId])
    },
    async createOpenStudent(data) {
      calls.push(['create-student', { ...data }])
    },
    async getOpenUser(id) {
      calls.push(['user-detail', id])
      return {
        id,
        realName: '王老师',
        schoolId: 3,
        classes: [{ classId: 11 }]
      }
    },
    async updateOpenUser(id, data) {
      calls.push(['update-user', id, { ...data }])
    },
    async updateOpenUserClasses(id, classIds) {
      calls.push(['update-user-classes', id, classIds])
    },
    async createOpenUser(data) {
      calls.push(['create-user', data])
      return {}
    },
    async enableOpenStudent(id) {
      calls.push(['enable-student', id])
    },
    async disableOpenStudent(id) {
      calls.push(['disable-student', id])
    },
    async enableOpenUser(id) {
      calls.push(['enable-user', id])
    },
    async disableOpenUser(id) {
      calls.push(['disable-user', id])
    }
  }
  const model = useRosterRecordManagement({
    mode,
    roleCode: ref(initialMode === 'teachers' ? 'TEACHER' : 'PARENT'),
    recordLabel: ref(initialMode === 'students' ? '学生' : '教师'),
    resolveSchoolId: async fallback => fallback || 3,
    reloadRows: async () => { calls.push(['reload']) },
    api,
    confirm: async (...args) => { calls.push(['confirm', args[0]]) },
    alert: async (...args) => { calls.push(['alert', args[0]]) },
    notify: {
      success(message) { successes.push(message) },
      error(message) { errors.push(message) }
    }
  })
  return { calls, errors, mode, model, successes }
}

test('roster record management loads sorted school-scoped classes', async () => {
  const { calls, model } = createRecordModel()

  await model.loadClassOptions()

  assert.deepEqual(calls, [
    ['classes', { schoolId: 3, page: 1, pageSize: 100 }]
  ])
  assert.deepEqual(model.classOptions.value.map(item => item.id), [11, 12])
})

test('roster record management updates a student and assigns a changed class', async () => {
  const { calls, model, successes } = createRecordModel()

  await model.openEditStudent({ id: 7, schoolId: 3 })
  model.studentForm.classId = 12
  await model.saveRecord()

  assert.equal(calls[0][0], 'student-detail')
  assert.equal(calls[1][0], 'classes')
  assert.equal(calls[2][0], 'update-student')
  assert.deepEqual(calls[3], ['set-class', 7, 12])
  assert.deepEqual(calls[4], ['reload'])
  assert.equal(model.recordDialog.value, false)
  assert.deepEqual(successes, ['学生已保存'])
})

test('roster record management updates a teacher and class assignments', async () => {
  const { calls, model, successes } = createRecordModel('teachers')

  await model.openEditUser({ id: 8, schoolId: 3 })
  model.userForm.classIds = ['11', '12']
  await model.saveRecord()

  assert.equal(calls[0][0], 'user-detail')
  assert.equal(calls[1][0], 'classes')
  assert.equal(calls[2][0], 'update-user')
  assert.deepEqual(calls[3], ['update-user-classes', 8, [11, 12]])
  assert.deepEqual(calls[4], ['reload'])
  assert.deepEqual(successes, ['教师已保存'])
})

test('roster record management toggles student and user status after confirmation', async () => {
  const { calls, model } = createRecordModel()

  await model.toggleStudentStatus({ id: 7, name: '小明', schoolId: 3, status: 'ACTIVE' })
  await model.toggleUserStatus({ id: 8, realName: '王老师', schoolId: 3, status: 'DISABLED' })

  assert.deepEqual(calls.map(call => call[0]), [
    'confirm',
    'disable-student',
    'reload',
    'confirm',
    'enable-user',
    'reload'
  ])
})

test('roster record management rejects resources and class ids from another school', async () => {
  const { calls, errors, model } = createRecordModel()

  await model.openEditStudent({ id: 90, schoolId: 4 })
  assert.deepEqual(calls, [])
  assert.match(errors[0], /其他学校/)

  await model.openEditStudent({ id: 7, schoolId: 3 })
  model.studentForm.classId = 99
  await model.saveRecord()

  assert.match(model.formError.value, /其他学校的班级/)
  assert.equal(calls.some(call => call[0] === 'update-student'), false)
})
