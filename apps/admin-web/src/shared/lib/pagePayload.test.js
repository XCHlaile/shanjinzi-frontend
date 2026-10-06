import assert from 'node:assert/strict'
import test from 'node:test'

import { pageCount, pageItems, pageTotal } from './pagePayload.js'

test('page payload helpers normalize array, items, and records responses', () => {
  const rows = [{ id: 1 }, { id: 2 }]

  assert.equal(pageItems(rows), rows)
  assert.equal(pageItems({ items: rows }), rows)
  assert.equal(pageItems({ records: rows }), rows)
  assert.deepEqual(pageItems(null), [])
})

test('page payload helpers prefer backend totals and derive page counts safely', () => {
  assert.equal(pageTotal({ total: 42, items: [] }), 42)
  assert.equal(pageTotal({ totalElements: 33, records: [] }), 33)
  assert.equal(pageTotal([{ id: 1 }]), 1)
  assert.equal(pageCount({ totalPages: 5 }, { pageSize: 20, total: 90 }), 5)
  assert.equal(pageCount({}, { pageSize: 20, total: 41 }), 3)
})
