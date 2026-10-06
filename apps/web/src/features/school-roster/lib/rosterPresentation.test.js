import assert from 'node:assert/strict'
import test from 'node:test'

import {
  classOptionLabel,
  guardianRelationLabels,
  numericList,
  relationLabel,
  schoolIdOf,
  statusLabel
} from '../index.js'

test('roster presentation helpers are exported from the feature', () => {
  assert.equal(typeof classOptionLabel, 'function')
})

test('normalizes roster labels and identifiers', () => {
  assert.equal(statusLabel('ACTIVE'), '启用')
  assert.equal(relationLabel('GRANDFATHER_MATERNAL'), '外公')
  assert.equal(guardianRelationLabels.MOTHER, '母亲')
  assert.deepEqual(numericList('1，2, 3'), [1, 2, 3])
  assert.equal(schoolIdOf({ school: { id: 42 } }), 42)
  assert.equal(classOptionLabel({ id: 3, name: '小一班', status: 'DISABLED' }), '小一班（已停用）')
})
