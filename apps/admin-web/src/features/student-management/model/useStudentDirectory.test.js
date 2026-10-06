import assert from 'node:assert/strict'
import test from 'node:test'

import { useStudentDirectory } from './useStudentDirectory.js'

function createStudentDirectory(apiOverrides = {}) {
  const calls = []
  const messages = []
  const detail = {
    id: 1,
    schoolId: 2,
    name: '小山',
    gender: 'MALE',
    birthday: '2020-01-01',
    studentNo: 'S001',
    enrollmentStatus: 'ENROLLED',
    phoneNumber: '13900000000',
    classes: [{
      classId: 3,
      className: '小一班',
      isPrimary: true
    }]
  }
  const api = {
    async fetchStudents(params) {
      calls.push(['list', params])
      return {
        items: [{
          id: 1,
          schoolId: 2,
          name: '小山',
          status: 'ACTIVE',
          guardiansCount: 1
        }],
        total: 1
      }
    },
    async fetchStudent(studentId) {
      calls.push(['detail', studentId])
      return { ...detail, id: studentId }
    },
    async fetchGuardians(studentId) {
      calls.push(['guardians', studentId])
      return {
        items: [
          { guardianUserId: 10, bindStatus: 'BOUND' },
          { guardianUserId: 11, bindStatus: 'UNBOUND' }
        ]
      }
    },
    async fetchSchools(params) {
      calls.push(['schools', params])
      return {
        items: [
          { id: 2, name: '山前幼儿园', status: 'ACTIVE' },
          { id: 4, name: '停用幼儿园', status: 'DISABLED' }
        ]
      }
    },
    async fetchClasses(params) {
      calls.push(['classes', params])
      return {
        items: [
          { id: 4, schoolId: 2, name: '小二班', sortOrder: 2 },
          { id: 3, schoolId: 2, name: '小一班', sortOrder: 1 },
          { id: 9, schoolId: 99, name: '其他学校班级', sortOrder: 1 }
        ],
        total: 3
      }
    },
    async createStudent(payload) {
      calls.push(['create', payload])
    },
    async updateStudent(studentId, payload) {
      calls.push(['update', studentId, payload])
    },
    async setStudentClass(studentId, classId) {
      calls.push(['class', studentId, classId])
    },
    async enableStudent(studentId) {
      calls.push(['enable', studentId])
    },
    async disableStudent(studentId) {
      calls.push(['disable', studentId])
    },
    async exportStudents(filters) {
      calls.push(['export', filters])
      return { blob: new Blob(['students']), filename: 'students.csv' }
    },
    ...apiOverrides
  }
  const model = useStudentDirectory({
    api,
    dialogs: {
      async confirm(...args) {
        calls.push(['confirm', ...args])
      }
    },
    feedback: {
      error(message) {
        messages.push(['error', message])
      },
      info(message) {
        messages.push(['info', message])
      },
      success(message) {
        messages.push(['success', message])
      }
    },
    saveFile(result, fallbackFilename) {
      calls.push(['save-file', result.filename, fallbackFilename])
    }
  })

  return { calls, messages, model }
}

test('student directory loads schools and enriches paged rows', async () => {
  const { calls, model } = createStudentDirectory()

  await model.loadSchools()
  assert.equal(await model.loadStudents(), true)

  assert.deepEqual(model.schools.value.map(school => school.id), [2])
  assert.equal(model.rows.value[0].className, '小一班')
  assert.equal(model.rows.value[0].phoneNum, '13900000000')
  assert.equal(model.rows.value[0].guardianCount, 1)
  assert.equal(model.pagination.total, 1)
  assert.equal(calls.some(call => call[0] === 'guardians'), false)
})

test('student directory reuses detail summaries across list refreshes', async () => {
  const { calls, model } = createStudentDirectory()

  await model.loadStudents()
  await model.loadStudents()

  assert.equal(calls.filter(call => call[0] === 'detail').length, 1)
  assert.equal(calls.filter(call => call[0] === 'guardians').length, 0)
})

test('student editor loads school classes and saves profile and class changes', async () => {
  const { calls, messages, model } = createStudentDirectory()

  assert.equal(await model.openEdit({ id: 1, classId: 3 }), true)
  assert.deepEqual(model.formClassOptions.value.map(item => item.id), [3, 4])
  model.form.name = '小山新名'
  model.form.classId = 4

  assert.equal(await model.saveStudent(), true)
  assert.ok(calls.some(call => (
    call[0] === 'update'
    && call[1] === 1
    && call[2].name === '小山新名'
  )))
  assert.ok(calls.some(call => call[0] === 'class' && call[2] === 4))
  assert.ok(messages.some(message => (
    message[0] === 'success' && message[1] === '学生信息已更新'
  )))
})

test('student editor validates and creates the public student payload', async () => {
  const { calls, messages, model } = createStudentDirectory()
  model.openCreate()
  Object.assign(model.form, {
    schoolId: 2,
    name: ' 新同学 ',
    phoneNum: '13700000000',
    gender: 'FEMALE',
    classId: 3
  })

  assert.equal(await model.saveStudent(), true)
  assert.ok(calls.some(call => (
    call[0] === 'create'
    && call[1].name === '新同学'
    && call[1].phoneNum === '13700000000'
    && call[1].schoolId === 2
  )))
  assert.deepEqual(messages[0], ['success', '学生已新增'])
})

test('student detail and status actions share guardian and list refresh behavior', async () => {
  const { calls, model } = createStudentDirectory()
  const row = { id: 1, name: '小山', status: 'ACTIVE', phoneNum: '' }

  assert.equal(await model.openDetail(row), true)
  assert.equal(model.studentDetail.value.phoneNum, '13900000000')
  assert.equal(model.studentDetail.value.guardianCount, 1)
  assert.equal(await model.toggleStudentStatus(row), true)
  assert.ok(calls.some(call => call[0] === 'disable' && call[1] === 1))
  assert.ok(calls.some(call => call[0] === 'list'))
})

test('student directory exports the current filters', async () => {
  const { calls, messages, model } = createStudentDirectory()
  model.filters.name = ' 小山 '
  model.filters.status = 'ACTIVE'

  assert.equal(await model.exportStudents(), true)
  assert.deepEqual(calls, [
    ['export', {
      name: '小山',
      studentNo: undefined,
      classId: undefined,
      enrollmentStatus: undefined,
      status: 'ACTIVE'
    }],
    ['save-file', 'students.csv', '学生列表.csv']
  ])
  assert.deepEqual(messages, [['success', '学生数据已导出']])
})
