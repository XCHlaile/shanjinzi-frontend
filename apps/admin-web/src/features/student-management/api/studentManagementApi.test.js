import assert from 'node:assert/strict'
import test from 'node:test'

import { createStudentManagementApi } from './studentManagementApi.js'

test('student management api adapts directory, relationship and import operations', async () => {
  const calls = []
  const operations = [
    'listPublicSchools',
    'listClasses',
    'listOpenStudents',
    'getOpenStudent',
    'createOpenStudent',
    'updateOpenStudent',
    'setOpenStudentClass',
    'enableOpenStudent',
    'disableOpenStudent',
    'listOpenStudentGuardians',
    'getOpenUser',
    'listOpenUsers',
    'bindOpenUserStudents',
    'unbindOpenStudentGuardian',
    'getOpenStudentProfile',
    'listOpenStudentImportBatches',
    'getOpenStudentImportBatch',
    'importOpenStudents',
    'downloadOpenStudentImportTemplate'
  ]
  const managementApi = Object.fromEntries(operations.map(operation => [
    operation,
    async (...args) => {
      calls.push([operation, ...args])
      return { operation }
    }
  ]))
  const api = createStudentManagementApi({ managementApi })
  const file = new Blob(['students'])

  await api.fetchSchools({ page: 1 })
  await api.fetchClasses({ schoolId: 2 })
  await api.fetchStudents({ name: '小山' })
  await api.fetchStudent(7)
  await api.createStudent({ name: '小山' })
  await api.updateStudent(7, { name: '小金' })
  await api.setStudentClass(7, 3)
  await api.enableStudent(7)
  await api.disableStudent(7)
  await api.fetchGuardians(7)
  await api.fetchUser(8)
  await api.fetchParents({ roleCode: 'PARENT' })
  await api.bindParentStudents(8, [7], 'MOTHER')
  await api.unbindGuardian(7, 8)
  await api.fetchProfile(7)
  await api.fetchImportBatches({ page: 1 })
  await api.fetchImportBatch(9)
  await api.importStudents(file, { schoolId: 2 })
  await api.downloadImportTemplate()

  assert.deepEqual(calls, [
    ['listPublicSchools', { page: 1 }],
    ['listClasses', { schoolId: 2 }],
    ['listOpenStudents', { name: '小山' }],
    ['getOpenStudent', 7],
    ['createOpenStudent', { name: '小山' }],
    ['updateOpenStudent', 7, { name: '小金' }],
    ['setOpenStudentClass', 7, 3],
    ['enableOpenStudent', 7],
    ['disableOpenStudent', 7],
    ['listOpenStudentGuardians', 7],
    ['getOpenUser', 8],
    ['listOpenUsers', { roleCode: 'PARENT' }],
    ['bindOpenUserStudents', 8, [7], 'MOTHER'],
    ['unbindOpenStudentGuardian', 7, 8],
    ['getOpenStudentProfile', 7],
    ['listOpenStudentImportBatches', { page: 1 }],
    ['getOpenStudentImportBatch', 9],
    ['importOpenStudents', file, { schoolId: 2 }],
    ['downloadOpenStudentImportTemplate']
  ])
})

test('student management api waits for a pending export before downloading it', async () => {
  const calls = []
  const api = createStudentManagementApi({
    async createExport(taskType, filter) {
      calls.push(['create', taskType, filter])
      return { id: 12, status: 'PENDING' }
    },
    async waitForExport(taskId) {
      calls.push(['wait', taskId])
      return { id: taskId, status: 'COMPLETED' }
    },
    async downloadExport(taskId) {
      calls.push(['download', taskId])
      return { blob: new Blob(['students']) }
    }
  })

  await api.exportStudents({ status: 'ACTIVE' })
  assert.deepEqual(calls, [
    ['create', 'STUDENTS', { status: 'ACTIVE' }],
    ['wait', 12],
    ['download', 12]
  ])
})
