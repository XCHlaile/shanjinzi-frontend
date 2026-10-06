import assert from 'node:assert/strict'
import test from 'node:test'

import {
  dashboardList,
  dashboardMetrics,
  dashboardPageTotal,
  isHighRisk,
  trendWidth
} from './adminDashboardViewModel.js'

test('admin dashboard view model normalizes list and total payloads', () => {
  const rows = [{ id: 1 }]

  assert.equal(dashboardList(rows), rows)
  assert.equal(dashboardList({ trends: rows }, ['trends']), rows)
  assert.equal(dashboardList({ records: rows }), rows)
  assert.deepEqual(dashboardList(null), [])
  assert.equal(dashboardPageTotal({ total: '8' }), 8)
  assert.equal(dashboardPageTotal({ items: rows }), null)
})

test('admin dashboard view model supports current and legacy metric fields', () => {
  assert.deepEqual(dashboardMetrics({
    userCount: 12,
    totalSchools: 3,
    teacherCount: 5,
    parentCount: 7,
    momentCount: 9,
    competitionCount: 2,
    registrationCount: 10,
    todayNewUsers: 1
  }, 4), [
    { label: '总用户数', value: 12 },
    { label: '总学校数', value: 3 },
    { label: '总教师数', value: 5 },
    { label: '总家长数', value: 7 },
    { label: '总校方管理员数', value: 4 },
    { label: '总动态数', value: 9 },
    { label: '总赛事数', value: 2 },
    { label: '总报名数', value: 10 },
    { label: '今日新增用户', value: 1 }
  ])
  assert.equal(dashboardMetrics(null, null)[0].value, '-')
})

test('admin dashboard view model centralizes trend width and risk rules', () => {
  assert.equal(trendWidth({ activeUsers: 300 }), '50%')
  assert.equal(trendWidth({ active: 900 }), '100%')
  assert.equal(trendWidth({}), '0%')
  assert.equal(isHighRisk({ risk: '高危' }), true)
  assert.equal(isHighRisk({ riskLevel: 'HIGH' }), true)
  assert.equal(isHighRisk({ risk: 'LOW' }), false)
})
