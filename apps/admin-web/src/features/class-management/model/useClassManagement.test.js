import assert from 'node:assert/strict'
import test from 'node:test'

import { useClassManagement } from './useClassManagement.js'

function createClassModel() {
  const calls = []
  const messages = []
  const assignments = new Map([[7, 1]])
  const api = {
    async fetchSchools(params) {
      calls.push(['schools', params])
      return { items: [{ id: 3, name: '山前幼儿园', status: 'ACTIVE' }] }
    },
    async fetchClasses(params) {
      calls.push(['classes', params])
      return {
        items: [
          { id: 1, schoolId: 3, name: '大一班', status: 'ACTIVE' },
          { id: 2, schoolId: 3, name: '大二班', status: 'ACTIVE' }
        ],
        total: 2
      }
    },
    async fetchClass(classId) {
      calls.push(['class-detail', classId])
      return { id: classId, schoolId: 3, name: `班级 ${classId}`, status: 'ACTIVE' }
    },
    async createClass(payload) {
      calls.push(['create', payload])
      return { id: 4, status: 'ACTIVE', ...payload }
    },
    async updateClass(classId, payload) {
      calls.push(['update', classId, payload])
      return { id: classId, ...payload }
    },
    async enableClass(classId) {
      calls.push(['enable', classId])
    },
    async disableClass(classId) {
      calls.push(['disable', classId])
    },
    async deleteClass(classId) {
      calls.push(['delete', classId])
    },
    async assignClassTeachers(classId, teacherIds) {
      calls.push(['assign-teachers', classId, teacherIds])
    },
    async fetchTeachers(params) {
      calls.push(['teachers', params])
      return {
        items: [{ id: 5, schoolId: 3, phone: '13900000000' }],
        totalPages: 1
      }
    },
    async fetchTeacher(teacherId) {
      calls.push(['teacher-detail', teacherId])
      return {
        id: teacherId,
        realName: '张老师',
        roles: ['TEACHER'],
        classes: [{ classId: 1 }]
      }
    },
    async fetchStudents(params) {
      calls.push(['students', params])
      return {
        items: [{ id: 7, schoolId: 3, name: '小山', status: 'ACTIVE' }],
        totalPages: 1
      }
    },
    async fetchStudent(studentId) {
      calls.push(['student-detail', studentId])
      const classId = assignments.get(studentId)
      return {
        id: studentId,
        schoolId: 3,
        name: '小山',
        status: 'ACTIVE',
        classes: classId
          ? [{ classId, className: `班级 ${classId}`, isPrimary: true }]
          : []
      }
    },
    async setStudentClass(studentId, classId) {
      calls.push(['set-student-class', studentId, classId])
      assignments.set(studentId, classId)
    },
    async exportClasses(filter) {
      calls.push(['export', filter])
      return { blob: new Blob(['classes']), filename: 'classes.csv' }
    }
  }
  const model = useClassManagement({
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
      success(message) {
        messages.push(['success', message])
      },
      warning(message) {
        messages.push(['warning', message])
      }
    },
    saveFile(result, fallbackFilename) {
      calls.push(['save-file', result.filename, fallbackFilename])
    }
  })
  return { calls, messages, model }
}

test('class management facade loads, creates and exports classes', async () => {
  const { calls, model } = createClassModel()
  await model.loadInitialData()
  model.openCreate()
  Object.assign(model.form, {
    schoolId: 3,
    name: '新班级',
    gradeName: '大班'
  })
  assert.equal(await model.saveClass(), true)
  model.filters.status = 'ACTIVE'
  assert.equal(await model.exportClasses(), true)

  assert.equal(model.schools.value[0].name, '山前幼儿园')
  assert.ok(calls.some(call => call[0] === 'create' && call[1].name === '新班级'))
  assert.ok(calls.some(call => call[0] === 'export' && call[1].status === 'ACTIVE'))
})

test('class management facade loads and saves teacher assignments', async () => {
  const { calls, model } = createClassModel()
  assert.equal(await model.openTeachers({
    id: 1,
    schoolId: 3,
    name: '大一班'
  }), true)
  assert.deepEqual(model.selectedTeacherIds.value, [5])
  assert.equal(await model.saveTeachers(), true)
  assert.ok(calls.some(call => (
    call[0] === 'assign-teachers'
    && call[1] === 1
    && call[2][0] === 5
  )))
})

test('class management facade transfers students between active classes', async () => {
  const { calls, model } = createClassModel()
  assert.equal(await model.openStudents({
    id: 1,
    schoolId: 3,
    name: '大一班'
  }), true)
  assert.equal(model.classStudents.value[0].id, 7)
  assert.equal(model.openTransferStudent(model.classStudents.value[0]), true)
  model.targetClassId.value = 2
  assert.equal(await model.transferStudentToClass(), true)
  assert.ok(calls.some(call => (
    call[0] === 'set-student-class' && call[1] === 7 && call[2] === 2
  )))
})
