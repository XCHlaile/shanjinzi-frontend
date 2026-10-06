import assert from 'node:assert/strict'
import test from 'node:test'

import { createClassManagementApi } from './classManagementApi.js'

test('class management api adapts directory, teacher and student operations', async () => {
  const calls = []
  const managementApi = Object.fromEntries([
    'listSchools',
    'listClasses',
    'getClass',
    'createClass',
    'updateClass',
    'enableClass',
    'disableClass',
    'deleteClass',
    'assignClassTeachers',
    'listOpenUsers',
    'getOpenUser',
    'listOpenStudents',
    'getOpenStudent',
    'setOpenStudentClass'
  ].map(operation => [operation, async (...args) => {
    calls.push([operation, ...args])
    return { operation }
  }]))
  const api = createClassManagementApi({ managementApi })

  await api.fetchSchools({ status: 'ACTIVE' })
  await api.fetchClasses({ page: 1 })
  await api.fetchClass(2)
  await api.createClass({ name: '大一班' })
  await api.updateClass(2, { name: '大二班' })
  await api.enableClass(2)
  await api.disableClass(2)
  await api.deleteClass(2)
  await api.assignClassTeachers(2, [5, 6])
  await api.fetchTeachers({ schoolId: 3 })
  await api.fetchTeacher(5)
  await api.fetchStudents({ page: 1 })
  await api.fetchStudent(7)
  await api.setStudentClass(7, 2)

  assert.deepEqual(calls, [
    ['listSchools', { status: 'ACTIVE' }],
    ['listClasses', { page: 1 }],
    ['getClass', 2],
    ['createClass', { name: '大一班' }],
    ['updateClass', 2, { name: '大二班' }],
    ['enableClass', 2],
    ['disableClass', 2],
    ['deleteClass', 2],
    ['assignClassTeachers', 2, [5, 6]],
    ['listOpenUsers', { schoolId: 3 }],
    ['getOpenUser', 5],
    ['listOpenStudents', { page: 1 }],
    ['getOpenStudent', 7],
    ['setOpenStudentClass', 7, 2]
  ])
})

test('class management api waits for and downloads exports', async () => {
  const calls = []
  const api = createClassManagementApi({
    async createExport(taskType, filter) {
      calls.push(['create', taskType, filter])
      return { id: 8, status: 'PENDING' }
    },
    async waitForExport(taskId) {
      calls.push(['wait', taskId])
      return { id: taskId, status: 'COMPLETED' }
    },
    async downloadExport(taskId) {
      calls.push(['download', taskId])
      return { blob: new Blob(['classes']) }
    }
  })

  await api.exportClasses({ status: 'ACTIVE' })
  assert.deepEqual(calls, [
    ['create', 'CLASSES', { status: 'ACTIVE' }],
    ['wait', 8],
    ['download', 8]
  ])
})
