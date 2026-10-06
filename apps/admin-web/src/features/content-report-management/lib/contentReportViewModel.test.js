import assert from 'node:assert/strict'
import test from 'node:test'

import {
  contentReportActionLabel,
  contentReportHandlePayload,
  contentReportPageItems,
  contentReportPageTotal,
  contentReportQuery,
  contentReportSchoolName,
  contentReportSchoolOptions,
  contentReportStatusLabel,
  contentReportStatusTagType,
  contentReportTargetTypeLabel,
  isContentReportHandled,
  shortContentReportDate
} from './contentReportViewModel.js'

test('content report view model normalizes page payloads and filters', () => {
  const rows = [{ reportId: 1 }]

  assert.equal(contentReportPageItems({ records: rows }), rows)
  assert.equal(contentReportPageTotal({ total: '8', items: rows }), 8)
  assert.equal(contentReportPageTotal(rows), 1)
  assert.deepEqual(contentReportQuery(
    { schoolId: null, status: 'PENDING', targetType: '' },
    { page: 2, pageSize: 50 }
  ), {
    schoolId: undefined,
    status: 'PENDING',
    targetType: undefined,
    page: 2,
    pageSize: 50
  })
})

test('content report view model builds strict handle payloads', () => {
  assert.deepEqual(contentReportHandlePayload({
    action: ' IGNORE ',
    note: ' 无需处理 '
  }), {
    action: 'IGNORE',
    note: '无需处理'
  })
  assert.deepEqual(contentReportHandlePayload({
    action: 'DELETE',
    note: ' '
  }), {
    action: 'DELETE',
    note: undefined
  })
})

test('content report view model normalizes school options and names', () => {
  assert.deepEqual(contentReportSchoolOptions([
    { id: 2, name: '山前幼儿园' },
    { schoolId: '3', schoolName: '青山幼儿园' },
    { id: 'invalid', name: '无效学校' }
  ]), [
    { value: 2, label: '山前幼儿园' },
    { value: 3, label: '青山幼儿园' }
  ])
  assert.equal(contentReportSchoolName({ schoolId: 2 }, { 2: '山前幼儿园' }), '山前幼儿园')
  assert.equal(contentReportSchoolName({ schoolName: '接口学校' }, {}), '接口学校')
  assert.equal(contentReportSchoolName({}, {}), '未知学校')
})

test('content report view model centralizes statuses, actions, and dates', () => {
  assert.equal(isContentReportHandled({ handledAction: 'IGNORE' }), true)
  assert.equal(isContentReportHandled({ status: 'DELETED' }), true)
  assert.equal(isContentReportHandled({ status: 'PENDING' }), false)
  assert.equal(contentReportTargetTypeLabel('MOMENT'), '动态')
  assert.equal(contentReportStatusLabel('DELETED'), '已删除')
  assert.equal(contentReportStatusLabel('CUSTOM'), '未知状态')
  assert.equal(contentReportActionLabel('DELETE'), '删除内容')
  assert.equal(contentReportActionLabel('CUSTOM'), '其他处理')
  assert.equal(contentReportStatusTagType('PENDING'), 'warning')
  assert.equal(contentReportStatusTagType('HANDLED'), 'success')
  assert.equal(shortContentReportDate('2026-07-31T12:34:56.000Z'), '2026-07-31 12:34:56')
  assert.equal(shortContentReportDate(null), '-')
})
