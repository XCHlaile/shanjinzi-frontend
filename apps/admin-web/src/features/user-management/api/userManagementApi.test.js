import assert from 'node:assert/strict'
import test from 'node:test'

import { createUserManagementApi } from './userManagementApi.js'

test('user management api adapts user, school and account operations', async () => {
  const calls = []
  const managementApi = Object.fromEntries([
    'listUsers',
    'listPublicSchools',
    'getUser',
    'createUser',
    'updateUser',
    'updateUserRole',
    'updateUserSchool',
    'enableUser',
    'disableUser',
    'resetUserPassword',
    'deleteUser'
  ].map(operation => [operation, async (...args) => {
    calls.push([operation, ...args])
    return { operation }
  }]))
  const api = createUserManagementApi({ managementApi })

  await api.fetchUsers({ page: 1 })
  await api.fetchSchools({ status: 'ACTIVE' })
  await api.fetchUser(2)
  await api.createUser({ phone: '13900000000' })
  await api.updateUser(2, { realName: '张老师' })
  await api.updateUserRole(2, { roleCode: 'TEACHER' })
  await api.updateUserSchool(2, { schoolId: 3 })
  await api.enableUser(2)
  await api.disableUser(2)
  await api.resetUserPassword(2)
  await api.deleteUser(2)

  assert.deepEqual(calls, [
    ['listUsers', { page: 1 }],
    ['listPublicSchools', { status: 'ACTIVE' }],
    ['getUser', 2],
    ['createUser', { phone: '13900000000' }],
    ['updateUser', 2, { realName: '张老师' }],
    ['updateUserRole', 2, { roleCode: 'TEACHER' }],
    ['updateUserSchool', 2, { schoolId: 3 }],
    ['enableUser', 2],
    ['disableUser', 2],
    ['resetUserPassword', 2],
    ['deleteUser', 2]
  ])
})

test('user management api waits for and downloads asynchronous exports', async () => {
  const calls = []
  const api = createUserManagementApi({
    async createExport(taskType, filter) {
      calls.push(['create-export', taskType, filter])
      return { id: 8, status: 'PENDING' }
    },
    async waitForExport(taskId) {
      calls.push(['wait-export', taskId])
      return { id: taskId, status: 'COMPLETED' }
    },
    async downloadExport(taskId) {
      calls.push(['download-export', taskId])
      return { blob: new Blob(['users']) }
    }
  })

  assert.ok((await api.exportUsers({ role: 'PARENT' })).blob instanceof Blob)
  assert.deepEqual(calls, [
    ['create-export', 'USERS', { role: 'PARENT' }],
    ['wait-export', 8],
    ['download-export', 8]
  ])
})

test('user management api downloads completed exports immediately', async () => {
  const calls = []
  const api = createUserManagementApi({
    async createExport() {
      return { id: 9, status: 'COMPLETED' }
    },
    async waitForExport() {
      calls.push(['wait'])
    },
    async downloadExport(taskId) {
      calls.push(['download', taskId])
      return { blob: new Blob(['users']) }
    }
  })

  await api.exportUsers({})
  assert.deepEqual(calls, [['download', 9]])
})
