import assert from 'node:assert/strict'
import test from 'node:test'

import { useDashboard } from './useDashboard.js'

test('dashboard refreshes the user and synchronizes the parent home summary', async () => {
  const calls = []
  const dashboard = useDashboard({
    initialUser: { id: 1, role: 'parent' },
    initialStudent: null,
    async refreshUser() {
      calls.push('user')
      return { id: 1, role: 'PARENT' }
    },
    api: {
      async fetchHomeSummary() {
        calls.push('summary')
        return {
          stats: {
            boundStudentCount: 1,
            latestMomentCount: 2,
            availableCompetitionCount: 3
          },
          currentStudent: {
            studentId: 8,
            studentName: '小山',
            schoolName: '示范幼儿园',
            className: '向日葵班'
          }
        }
      }
    },
    persistCurrentStudent(student) {
      calls.push(['student', student.id])
    },
    navigationForRole(role) {
      return [{ path: `/${role}` }]
    },
    navigationGroupsForRole(role) {
      return [{ label: role, items: [{ path: `/${role}` }] }]
    }
  })

  await dashboard.initialize()

  assert.deepEqual(calls, ['user', 'summary', ['student', 8]])
  assert.equal(dashboard.role.value, 'parent')
  assert.equal(dashboard.cards.value.length, 4)
  assert.equal(dashboard.title.value, '正在查看 小山 的成长数据')
  assert.deepEqual(dashboard.navItems.value, [{ path: '/parent' }])
  assert.equal(dashboard.navGroups.value[0].label, 'parent')
  assert.equal(dashboard.primaryTask.value.path, '/growth-archive')
})

test('dashboard loads the dedicated workbench summary for teachers', async () => {
  const summaryCalls = []
  const dashboard = useDashboard({
    initialUser: { id: 2, role: 'teacher' },
    initialStudent: null,
    async refreshUser() {
      return { id: 2, role: 'teacher' }
    },
    api: {
      async fetchHomeSummary() {
        summaryCalls.push('parent')
      },
      async fetchTeacherWorkbenchSummary() {
        summaryCalls.push('teacher')
        return {
          stats: {
            classCount: 2,
            studentCount: 48,
            todayMomentCount: 3,
            unreadMessageCount: 4,
            unreadNotificationCount: 5,
            availableCompetitionCount: 6
          }
        }
      }
    }
  })

  await dashboard.initialize()

  assert.deepEqual(summaryCalls, ['teacher'])
  assert.equal(dashboard.cards.value.length, 6)
  assert.equal(dashboard.title.value, '教师工作台')
  assert.equal(dashboard.contextTitle.value, '本校数据边界')
})

test('dashboard keeps cached context when optional refreshes fail', async () => {
  const dashboard = useDashboard({
    initialUser: { id: 1, role: 'parent' },
    initialStudent: { id: 5, name: '小知' },
    async refreshUser() {
      throw new Error('用户不可用')
    },
    api: {
      async fetchHomeSummary() {
        throw new Error('汇总不可用')
      }
    }
  })

  await dashboard.initialize()

  assert.equal(dashboard.role.value, 'parent')
  assert.equal(dashboard.title.value, '正在查看 小知 的成长数据')
  assert.deepEqual(dashboard.cards.value, [])
})
