import assert from 'node:assert/strict'
import test from 'node:test'

import {
  growthArchiveEventLabel,
  growthArchiveItems,
  growthArchiveSourceLabel,
  growthArchiveSourceRoute,
  normalizeGrowthArchiveRecord,
  normalizeGrowthArchiveStudent
} from './growthArchiveViewModel.js'

test('growth archive presentation maps event and source labels', () => {
  assert.equal(growthArchiveEventLabel({ eventType: 'MOMENT' }), '动态')
  assert.equal(growthArchiveEventLabel({ sourceType: 'TEACHER_EVALUATION' }), '教师评价')
  assert.equal(growthArchiveSourceLabel({ sourceType: 'MOMENT' }), '幼儿动态')
  assert.equal(growthArchiveSourceLabel({ eventType: 'COMPETITION' }), '赛事')
  assert.equal(growthArchiveEventLabel({ eventType: 'UNKNOWN' }), '其他记录')
})

test('growth archive presentation routes supported source records', () => {
  assert.deepEqual(
    growthArchiveSourceRoute({ sourceType: 'IMAGE', sourceId: 12 }),
    { path: '/activities', query: { momentId: 12 } }
  )
  assert.deepEqual(
    growthArchiveSourceRoute({ eventType: 'COMPETITION_REGISTRATION', sourceId: 7 }),
    { path: '/competitions', query: { competitionId: 7 } }
  )
  assert.equal(growthArchiveSourceRoute({ sourceType: 'MANUAL', sourceId: 3 }), null)
  assert.equal(growthArchiveSourceRoute({ sourceType: 'MOMENT' }), null)
})

test('growth archive presentation normalizes records and students', () => {
  const record = normalizeGrowthArchiveRecord({
    profileEventId: 5,
    occurredAt: '2026-07-31T10:00:00.000Z',
    eventType: 'VIDEO',
    sourceType: 'VIDEO',
    sourceId: 8,
    title: '户外活动',
    summary: '完成平衡木练习'
  })
  const student = normalizeGrowthArchiveStudent({
    studentId: 9,
    name: '小山',
    studentNo: 'S009',
    classes: [{ className: '向日葵班', primary: true }]
  })

  assert.equal(record.id, 5)
  assert.equal(record.type, '视频')
  assert.equal(record.source, '幼儿动态视频')
  assert.deepEqual(record.sourceTo, { path: '/activities', query: { momentId: 8 } })
  assert.deepEqual(student, {
    id: '9',
    name: '小山',
    label: '小山（学号 S009 · 向日葵班）'
  })
  assert.deepEqual(growthArchiveItems({ students: [{ id: 1 }] }), [{ id: 1 }])
})
