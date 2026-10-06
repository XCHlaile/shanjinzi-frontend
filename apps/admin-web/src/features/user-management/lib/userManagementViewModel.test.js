import assert from 'node:assert/strict'
import test from 'node:test'

import {
  activeSchoolItems,
  emptyUserForm,
  matchesUser,
  shortUserDate,
  userDirectoryQuery,
  userExportFilter,
  userForm,
  userPageItems,
  userRoleLabel,
  userStatusLabel
} from './userManagementViewModel.js'

test('user management view model labels roles and statuses', () => {
  assert.equal(userRoleLabel('SCHOOL_ADMIN'), '校方管理员')
  assert.equal(userRoleLabel('UNKNOWN'), 'UNKNOWN')
  assert.equal(userStatusLabel('DISABLED'), '禁用')
  assert.equal(userStatusLabel(''), '-')
})

test('user management view model unwraps pages and keeps selectable schools', () => {
  const schools = [
    { id: 1, name: '山前幼儿园', status: 'ACTIVE' },
    { id: 2, name: '青山幼儿园', status: 'DISABLED' }
  ]

  assert.deepEqual(userPageItems({ records: schools }), schools)
  assert.deepEqual(activeSchoolItems({ items: schools }), [schools[0]])
  assert.deepEqual(userPageItems(null), [])
})

test('user management view model creates stable create and edit forms', () => {
  assert.deepEqual(emptyUserForm(), {
    phone: '',
    realName: '',
    roleCode: 'PARENT',
    schoolId: null,
    nickname: '',
    gender: ''
  })
  assert.deepEqual(userForm({
    phone: '13900000000',
    realName: '张老师',
    roleCode: 'TEACHER',
    schoolId: 3,
    nickname: '老张',
    gender: 'MALE'
  }), {
    phone: '13900000000',
    realName: '张老师',
    roleCode: 'TEACHER',
    schoolId: 3,
    nickname: '老张',
    gender: 'MALE'
  })
})

test('user management view model filters rows and builds export filters', () => {
  const row = {
    phone: '13900000000',
    displayName: '张老师',
    role: 'TEACHER',
    schoolName: '山前幼儿园',
    status: 'ACTIVE'
  }

  assert.equal(matchesUser(row, {
    keyword: ' 山前 ',
    role: 'TEACHER',
    status: 'ACTIVE'
  }), true)
  assert.equal(matchesUser(row, { role: 'PARENT' }), false)
  assert.deepEqual(userExportFilter({
    keyword: ' 张老师 ',
    role: 'TEACHER',
    status: 'ACTIVE'
  }), {
    keyword: '张老师',
    role: 'TEACHER',
    status: 'ACTIVE'
  })
  assert.equal(shortUserDate('2026-07-31T09:10:11.000Z'), '2026-07-31 09:10:11')
})

test('user management view model builds backend directory queries', () => {
  assert.deepEqual(userDirectoryQuery({
    keyword: ' 13900000000 ',
    role: 'TEACHER',
    status: 'ACTIVE'
  }, { page: 3, pageSize: 50 }), {
    phone: '13900000000',
    roleCode: 'TEACHER',
    status: 'ACTIVE',
    page: 3,
    pageSize: 50
  })
  assert.deepEqual(userDirectoryQuery({ keyword: ' 张老师 ' }), {
    realName: '张老师',
    page: 1,
    pageSize: 20
  })
})
