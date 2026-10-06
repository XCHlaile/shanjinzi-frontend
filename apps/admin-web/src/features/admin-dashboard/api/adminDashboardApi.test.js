import assert from 'node:assert/strict'
import test from 'node:test'

import { createAdminDashboardApi } from './adminDashboardApi.js'

test('admin dashboard api adapts every dashboard data source', async () => {
  const calls = []
  const managementApi = Object.fromEntries([
    'getDashboardStats',
    'listUsers',
    'getDashboardTrends',
    'getDashboardRankings',
    'getDashboardOperations'
  ].map(operation => [operation, async (...args) => {
    calls.push([operation, ...args])
    return { operation }
  }]))
  const api = createAdminDashboardApi({ managementApi })

  await api.fetchStats()
  await api.fetchUsers({ roleCode: 'SCHOOL_ADMIN' })
  await api.fetchTrends({ days: 7 })
  await api.fetchRankings()
  await api.fetchOperations()

  assert.deepEqual(calls, [
    ['getDashboardStats'],
    ['listUsers', { roleCode: 'SCHOOL_ADMIN' }],
    ['getDashboardTrends', { days: 7 }],
    ['getDashboardRankings', undefined],
    ['getDashboardOperations', undefined]
  ])
})
