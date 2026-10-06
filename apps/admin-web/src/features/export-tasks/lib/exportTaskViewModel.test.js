import assert from 'node:assert/strict'
import test from 'node:test'

import {
  exportTaskItems,
  exportTaskTypeLabel,
  matchesExportTask,
  shortExportTaskDate
} from './exportTaskViewModel.js'

test('export task view model normalizes list payloads and labels', () => {
  const items = [{ id: 1 }]

  assert.equal(exportTaskItems(items), items)
  assert.equal(exportTaskItems({ records: items }), items)
  assert.equal(exportTaskItems({ items }), items)
  assert.deepEqual(exportTaskItems(null), [])
  assert.equal(exportTaskTypeLabel('AUDIT_LOGS'), '审计')
  assert.equal(exportTaskTypeLabel('CUSTOM'), 'CUSTOM')
  assert.equal(exportTaskTypeLabel(''), '-')
})

test('export task filters support legacy type and taskType fields', () => {
  assert.equal(matchesExportTask(
    { taskType: 'USERS', status: 'COMPLETED' },
    { type: 'USERS', status: 'COMPLETED' }
  ), true)
  assert.equal(matchesExportTask(
    { type: 'SCHOOLS', status: 'FAILED' },
    { type: 'SCHOOLS' }
  ), true)
  assert.equal(matchesExportTask(
    { taskType: 'USERS', status: 'FAILED' },
    { type: 'SCHOOLS' }
  ), false)
})

test('export task date formatter keeps a compact local display', () => {
  assert.equal(shortExportTaskDate('2026-07-31T12:34:56.000Z'), '2026-07-31 12:34:56')
  assert.equal(shortExportTaskDate(null), '')
})
