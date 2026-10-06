import assert from 'node:assert/strict'
import test from 'node:test'

import {
  countBoundGuardians,
  normalizeGuardianRelationType,
  primaryStudentClass
} from '../index.js'

test('student relation selectors stay framework independent', () => {
  assert.equal(typeof countBoundGuardians, 'function')
  assert.equal(typeof primaryStudentClass, 'function')
})

test('counts only active guardian bindings', () => {
  assert.equal(countBoundGuardians([
    { guardianUserId: 1, bindStatus: 'BOUND' },
    { guardianUserId: 2, bindStatus: 'BOUND' },
    { guardianUserId: 3, bindStatus: 'UNBOUND' }
  ]), 2)
})

test('normalizes supported guardian relation labels for API payloads', () => {
  assert.equal(normalizeGuardianRelationType('妈妈'), 'MOTHER')
  assert.equal(normalizeGuardianRelationType('GRANDFATHER_MATERNAL'), 'GRANDFATHER_MATERNAL')
})

test('selects the primary student class', () => {
  assert.deepEqual(primaryStudentClass({
    classes: [
      { classId: 1, className: '中一班', isPrimary: false },
      { classId: 4, className: '小一班', isPrimary: true }
    ]
  }), { classId: 4, className: '小一班', isPrimary: true })
})
