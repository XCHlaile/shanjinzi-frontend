import assert from 'node:assert/strict'
import test from 'node:test'

import {
  dashboardCardsFromSummary,
  dashboardContext,
  dashboardDescription,
  dashboardPrimaryTask,
  dashboardTitle,
  normalizeDashboardStudent,
  teacherDashboardCardsFromSummary
} from './dashboardViewModel.js'

test('dashboard presentation builds parent summary cards', () => {
  assert.deepEqual(dashboardCardsFromSummary({
    stats: {
      boundStudentCount: 2,
      latestMomentCount: 4,
      availableCompetitionCount: 1
    },
    currentStudent: {
      name: '小山',
      schoolName: '示范幼儿园'
    }
  }).map(card => card.value), ['2', '4', '1', '小山'])
  assert.equal(dashboardCardsFromSummary({}), null)
})

test('dashboard presentation builds teacher workbench cards', () => {
  assert.deepEqual(teacherDashboardCardsFromSummary({
    stats: {
      classCount: 2,
      studentCount: 48,
      todayMomentCount: 3,
      unreadMessageCount: 4,
      unreadNotificationCount: 5,
      availableCompetitionCount: 6
    }
  }).map(card => card.value), ['2', '48', '3', '4', '5', '6'])
  assert.equal(teacherDashboardCardsFromSummary({}), null)
})

test('dashboard presentation normalizes student and role context', () => {
  const student = normalizeDashboardStudent({
    studentId: 8,
    studentName: '小金',
    schoolName: '示范幼儿园',
    classes: [{ className: '向日葵班', primary: true }]
  })

  assert.equal(student.id, 8)
  assert.equal(student.name, '小金')
  assert.equal(student.className, '向日葵班')
  assert.equal(dashboardTitle('parent', student), '正在查看 小金 的成长数据')
  assert.equal(dashboardTitle('teacher'), '教师工作台')
  assert.equal(dashboardDescription('school').includes('本校'), true)
  assert.deepEqual(dashboardContext('parent', student), {
    title: '示范幼儿园 / 向日葵班',
    description: '家长仅能查看已绑定学生相关数据。'
  })
})

test('dashboard presentation prioritizes one role-specific task', () => {
  assert.equal(dashboardPrimaryTask('parent').path, '/student-switcher')
  assert.equal(
    dashboardPrimaryTask('parent', { id: 8, name: '小金' }).title,
    '继续关注 小金 的成长'
  )
  assert.deepEqual(
    dashboardPrimaryTask('teacher').quickPaths,
    ['/activities', '/messages']
  )
  assert.equal(dashboardPrimaryTask('school').path, '/school/students')
})
