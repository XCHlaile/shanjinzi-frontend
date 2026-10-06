import assert from 'node:assert/strict'
import test from 'node:test'

import {
  classStatusLabel,
  detailClassNames,
  enrollmentStatusLabel,
  genderLabel,
  pageItems,
  pageTotal,
  relationLabel,
  shortDate,
  studentStatusLabel
} from '../index.js'

test('record presentation stays framework independent', () => {
  assert.equal(typeof pageItems, 'function')
})

test('normalizes list pagination payloads', () => {
  const records = [{ id: 1 }, { id: 2 }]

  assert.deepEqual(pageItems(records), records)
  assert.deepEqual(pageItems({ records }), records)
  assert.deepEqual(pageItems({ items: records }), records)
  assert.equal(pageTotal(records), 2)
  assert.equal(pageTotal({ total: 8, items: records }), 8)
  assert.equal(pageTotal({ totalElements: 9, records }), 9)
  assert.equal(pageTotal(null), 0)
})

test('renders shared student and class labels consistently', () => {
  assert.equal(genderLabel('FEMALE'), '女')
  assert.equal(enrollmentStatusLabel('ENROLLED'), '在读')
  assert.equal(studentStatusLabel('DISABLED'), '禁用')
  assert.equal(relationLabel('GRANDFATHER_MATERNAL'), '外公')
  assert.equal(classStatusLabel('DELETED'), '已删除')
  assert.equal(genderLabel('UNKNOWN'), 'UNKNOWN')
})

test('formats class names and backend timestamps', () => {
  assert.equal(detailClassNames({ classes: [{ className: '一班' }, {}, { className: '二班' }] }), '一班、二班')
  assert.equal(detailClassNames(), '-')
  assert.equal(shortDate('2026-07-31T14:08:09.123Z'), '2026-07-31 14:08:09')
  assert.equal(shortDate(), '-')
})
