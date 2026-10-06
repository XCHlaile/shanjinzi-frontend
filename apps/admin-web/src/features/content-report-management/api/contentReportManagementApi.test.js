import assert from 'node:assert/strict'
import test from 'node:test'

import { createContentReportManagementApi } from './contentReportManagementApi.js'

test('content report management api adapts every report operation', async () => {
  const calls = []
  const managementApi = Object.fromEntries([
    'listSchools',
    'getSchool',
    'listContentReports',
    'getContentReport',
    'handleContentReport'
  ].map(operation => [operation, async (...args) => {
    calls.push([operation, ...args])
    return { operation }
  }]))
  const api = createContentReportManagementApi({ managementApi })

  await api.fetchSchools({ page: 1 })
  await api.fetchSchool(2)
  await api.fetchReports({ status: 'PENDING' })
  await api.fetchReport(3)
  await api.handleReport(3, { action: 'IGNORE' })

  assert.deepEqual(calls, [
    ['listSchools', { page: 1 }],
    ['getSchool', 2],
    ['listContentReports', { status: 'PENDING' }],
    ['getContentReport', 3],
    ['handleContentReport', 3, { action: 'IGNORE' }]
  ])
})
