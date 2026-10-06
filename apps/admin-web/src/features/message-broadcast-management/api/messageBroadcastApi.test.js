import assert from 'node:assert/strict'
import test from 'node:test'

import { createMessageBroadcastApi } from './messageBroadcastApi.js'

test('message broadcast api adapts list, options, detail, create, and retry operations', async () => {
  const calls = []
  const managementApi = Object.fromEntries([
    'listMessageBroadcasts',
    'listPublicSchools',
    'listUsers',
    'createMessageBroadcast',
    'getMessageBroadcast',
    'retryMessageBroadcast'
  ].map(operation => [operation, async (...args) => {
    calls.push([operation, ...args])
    return { operation }
  }]))
  const api = createMessageBroadcastApi({ managementApi })

  await api.fetchBroadcasts({ page: 1 })
  await api.fetchSchools({ pageSize: 100 })
  await api.fetchUsers({ pageSize: 100 })
  await api.createBroadcast({ scope: 'PLATFORM', content: '通知' })
  await api.fetchBroadcast(3)
  await api.retryBroadcast(3)

  assert.deepEqual(calls, [
    ['listMessageBroadcasts', { page: 1 }],
    ['listPublicSchools', { pageSize: 100 }],
    ['listUsers', { pageSize: 100 }],
    ['createMessageBroadcast', { scope: 'PLATFORM', content: '通知' }],
    ['getMessageBroadcast', 3],
    ['retryMessageBroadcast', 3]
  ])
})

test('message broadcast api waits for and downloads exports', async () => {
  const calls = []
  const api = createMessageBroadcastApi({
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
      return { blob: new Blob(['messages']) }
    }
  })

  assert.ok((await api.exportBroadcasts({ scope: 'SCHOOL' })).blob instanceof Blob)
  assert.deepEqual(calls, [
    ['create-export', 'MESSAGES', { scope: 'SCHOOL' }],
    ['wait-export', 8],
    ['download-export', 8]
  ])
})
