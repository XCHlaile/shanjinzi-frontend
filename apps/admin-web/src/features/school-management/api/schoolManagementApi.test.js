import assert from 'node:assert/strict'
import test from 'node:test'

import { createSchoolManagementApi } from './schoolManagementApi.js'

test('school management api adapts school CRUD and status operations', async () => {
  const calls = []
  const managementApi = Object.fromEntries([
    'listSchools',
    'getSchool',
    'createSchool',
    'updateSchool',
    'enableSchool',
    'disableSchool'
  ].map(operation => [operation, async (...args) => {
    calls.push([operation, ...args])
    return { operation }
  }]))
  const api = createSchoolManagementApi({ managementApi })

  await api.fetchSchools({ page: 1 })
  await api.fetchSchool(2)
  await api.createSchool({ name: '新学校' })
  await api.updateSchool(2, { name: '新名称' })
  await api.enableSchool(2)
  await api.disableSchool(2)

  assert.deepEqual(calls, [
    ['listSchools', { page: 1 }],
    ['getSchool', 2],
    ['createSchool', { name: '新学校' }],
    ['updateSchool', 2, { name: '新名称' }],
    ['enableSchool', 2],
    ['disableSchool', 2]
  ])
})

test('school management api waits for and downloads asynchronous exports', async () => {
  const calls = []
  const api = createSchoolManagementApi({
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
      return { blob: new Blob(['schools']) }
    }
  })

  assert.ok((await api.exportSchools({ status: 'ACTIVE' })).blob instanceof Blob)
  assert.deepEqual(calls, [
    ['create-export', 'SCHOOLS', { status: 'ACTIVE' }],
    ['wait-export', 8],
    ['download-export', 8]
  ])
})

test('school management api downloads already completed exports immediately', async () => {
  const calls = []
  const api = createSchoolManagementApi({
    async createExport() {
      return { id: 9, status: 'COMPLETED' }
    },
    async waitForExport() {
      calls.push(['wait'])
    },
    async downloadExport(taskId) {
      calls.push(['download', taskId])
      return { blob: new Blob(['schools']) }
    }
  })

  await api.exportSchools({})
  assert.deepEqual(calls, [['download', 9]])
})
