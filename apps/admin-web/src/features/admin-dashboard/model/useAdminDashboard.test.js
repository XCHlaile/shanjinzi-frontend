import assert from 'node:assert/strict'
import test from 'node:test'

import { useAdminDashboard } from './useAdminDashboard.js'

function createDashboard(apiOverrides = {}) {
  const calls = []
  const dashboard = useAdminDashboard({
    api: {
      async fetchStats() {
        calls.push(['stats'])
        return { totalUsers: 12, totalSchools: 3 }
      },
      async fetchUsers(params) {
        calls.push(['users', params])
        return { total: 4, items: [] }
      },
      async fetchTrends(params) {
        calls.push(['trends', params])
        return { trends: [{ day: '周一', active: 6 }] }
      },
      async fetchRankings() {
        calls.push(['rankings'])
        return { rankings: [{ id: 1, schoolName: '山前幼儿园' }] }
      },
      async fetchOperations() {
        calls.push(['operations'])
        return { operations: [{ id: 2, action: '更新' }] }
      },
      ...apiOverrides
    }
  })

  return { calls, dashboard }
}

test('admin dashboard loads all sections in parallel and builds metrics', async () => {
  const { calls, dashboard } = createDashboard()

  assert.equal(await dashboard.loadDashboard(), true)
  assert.deepEqual(calls, [
    ['stats'],
    ['users', { roleCode: 'SCHOOL_ADMIN', page: 1, pageSize: 1 }],
    ['trends', { days: 7 }],
    ['rankings'],
    ['operations']
  ])
  assert.equal(dashboard.metrics.value[0].value, 12)
  assert.equal(dashboard.metrics.value[4].value, 4)
  assert.equal(dashboard.trends.value.length, 1)
  assert.equal(dashboard.rankings.value.length, 1)
  assert.equal(dashboard.operations.value.length, 1)
  assert.equal(dashboard.loading.value, false)
})

test('admin dashboard keeps successful sections and reports partial failures', async () => {
  const { dashboard } = createDashboard({
    async fetchStats() {
      throw new Error('统计不可用')
    },
    async fetchRankings() {
      throw new Error('排行不可用')
    }
  })
  dashboard.stats.value = { totalUsers: 9 }

  assert.equal(await dashboard.loadDashboard(), false)
  assert.equal(dashboard.stats.value.totalUsers, 9)
  assert.equal(dashboard.trends.value.length, 1)
  assert.equal(dashboard.rankings.value.length, 0)
  assert.match(dashboard.loadError.value, /统计数据: 统计不可用/)
  assert.match(dashboard.loadError.value, /学校排行: 排行不可用/)
})

test('admin dashboard accepts top-level arrays and empty stats', async () => {
  const { dashboard } = createDashboard({
    async fetchStats() {
      return null
    },
    async fetchTrends() {
      return [{ day: '周二' }]
    },
    async fetchRankings() {
      return [{ id: 3 }]
    },
    async fetchOperations() {
      return [{ id: 4 }]
    }
  })

  await dashboard.loadDashboard()

  assert.equal(dashboard.stats.value, null)
  assert.equal(dashboard.metrics.value[0].value, '-')
  assert.equal(dashboard.trends.value[0].day, '周二')
  assert.equal(dashboard.rankings.value[0].id, 3)
  assert.equal(dashboard.operations.value[0].id, 4)
})
