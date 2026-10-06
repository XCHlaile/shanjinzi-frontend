import assert from 'node:assert/strict'
import test from 'node:test'

import { createAuditLogApi } from './auditLogApi.js'

test('audit log api adapts its log and reference data sources', async () => {
  const calls = []
  const operations = [
    'listAuditLogs',
    'listUsers',
    'listExportTasks',
    'listNews',
    'listNewsCategories',
    'listCompetitions',
    'listPublicSchools',
    'listPages',
    'getMessageBroadcast'
  ]
  const managementApi = Object.fromEntries(operations.map(operation => [
    operation,
    async (...args) => {
      calls.push([operation, ...args])
      return { operation }
    }
  ]))
  const api = createAuditLogApi({ managementApi })

  await api.fetchAuditLogs({ page: 1 })
  await api.fetchUsers({ pageSize: 100 })
  await api.fetchExportTasks({ pageSize: 100 })
  await api.fetchNews({ pageSize: 100 })
  await api.fetchNewsCategories({ pageSize: 100 })
  await api.fetchCompetitions({ pageSize: 100 })
  await api.fetchSchools({ pageSize: 100 })
  await api.fetchPages({ pageSize: 100 })
  await api.fetchMessageBroadcast(9)

  assert.deepEqual(calls, [
    ['listAuditLogs', { page: 1 }],
    ['listUsers', { pageSize: 100 }],
    ['listExportTasks', { pageSize: 100 }],
    ['listNews', { pageSize: 100 }],
    ['listNewsCategories', { pageSize: 100 }],
    ['listCompetitions', { pageSize: 100 }],
    ['listPublicSchools', { pageSize: 100 }],
    ['listPages', { pageSize: 100 }],
    ['getMessageBroadcast', 9]
  ])
})

test('audit log api waits for and downloads audit exports', async () => {
  const calls = []
  const api = createAuditLogApi({
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
      return { blob: new Blob(['audit']) }
    }
  })

  assert.ok((await api.exportAuditLogs({ keyword: '更新' })).blob instanceof Blob)
  assert.deepEqual(calls, [
    ['create-export', 'AUDIT_LOGS', { keyword: '更新' }],
    ['wait-export', 8],
    ['download-export', 8]
  ])
})
