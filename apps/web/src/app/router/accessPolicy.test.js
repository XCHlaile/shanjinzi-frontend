import assert from 'node:assert/strict'
import test from 'node:test'

import {
  allUserRoles,
  canAccessProtectedRoute,
  navigationGroupsForRole,
  navigationForRole,
  protectedRouteMeta
} from './accessPolicy.js'

test('declares the supported user application roles', () => {
  assert.deepEqual(allUserRoles, ['parent', 'teacher', 'school'])
})

test('derives role navigation from the same policies used by routes', () => {
  assert.deepEqual(navigationForRole('parent').slice(0, 3), [
    { path: '/dashboard', label: '首页' },
    { path: '/student-switcher', label: '学生切换' },
    { path: '/growth-archive', label: '成长档案' }
  ])
  assert.equal(canAccessProtectedRoute('/school/students', 'school'), true)
  assert.equal(canAccessProtectedRoute('/school/students', 'parent'), false)
  assert.deepEqual(protectedRouteMeta('/teacher/classes').roles, ['teacher'])

  for (const role of allUserRoles) {
    const [home] = navigationForRole(role)
    assert.deepEqual(home, { path: '/dashboard', label: '首页' })
    assert.ok(navigationForRole(role).some(item => (
      item.path === '/news' && item.label === '新闻资讯'
    )))
  }

  assert.deepEqual(
    navigationForRole('parent').map(item => item.path),
    [
      '/dashboard',
      '/student-switcher',
      '/growth-archive',
      '/activities',
      '/competitions',
      '/forum',
      '/news',
      '/messages',
      '/profile'
    ]
  )
  assert.ok(navigationForRole('teacher').some(item => item.path === '/teacher/classes'))
  assert.equal(canAccessProtectedRoute('/registration-summary', 'teacher'), false)
  assert.ok(!navigationForRole('school').some(item => item.path === '/school/bindings'))
  assert.ok(navigationForRole('school').some(item => (
    item.path === '/school/classes' && item.label === '班级管理'
  )))
  assert.deepEqual(navigationForRole('admin'), [])
})

test('groups dense role navigation into task-oriented entry points', () => {
  assert.deepEqual(
    navigationGroupsForRole('parent').map(group => group.label),
    ['工作台', '孩子成长', '发现与参与', '消息']
  )
  assert.deepEqual(
    navigationGroupsForRole('school').find(group => group.label === '校务管理').items.map(item => item.path),
    ['/school/students', '/school/classes', '/school/teachers', '/school/parents', '/school/operations']
  )
  assert.equal(
    navigationGroupsForRole('teacher').find(group => group.label === '班级与成长').items[0].label,
    '班级学生'
  )
  assert.deepEqual(navigationGroupsForRole('admin'), [])
})
