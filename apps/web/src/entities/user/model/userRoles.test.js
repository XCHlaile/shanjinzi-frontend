import assert from 'node:assert/strict'
import test from 'node:test'

import { getRoleLabel, normalizeAccessRole, normalizeRole } from './userRoles.js'

test('normalizes and labels all product roles used by the frontend', () => {
  assert.equal(normalizeRole('SCHOOL_ADMIN'), 'school')
  assert.equal(normalizeRole('TEACHER'), 'teacher')
  assert.equal(normalizeRole('PARENT'), 'parent')
  assert.equal(normalizeRole('SUPER_ADMIN'), 'admin')
  assert.equal(normalizeRole('unknown'), 'parent')
  assert.equal(normalizeAccessRole('SCHOOL_ADMIN'), 'school')
  assert.equal(normalizeAccessRole('unknown'), '')
  assert.equal(normalizeAccessRole(''), '')

  assert.equal(getRoleLabel('SUPER_ADMIN'), '超级管理员')
  assert.equal(getRoleLabel('SCHOOL_ADMIN'), '校方管理员')
  assert.equal(getRoleLabel('TEACHER'), '教师')
  assert.equal(getRoleLabel('PARENT'), '家长')
})
