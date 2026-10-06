import assert from 'node:assert/strict'
import test from 'node:test'

import {
  competitionDatePickerValue,
  competitionDeleteErrorMessage,
  competitionExportFilter,
  competitionForm,
  competitionListParams,
  competitionSchoolOptions,
  competitionScopeLabel,
  competitionStatusLabel,
  emptyCompetitionForm,
  isCompetitionDialogCancel,
  matchesCompetition,
  normalizeCompetitionPage,
  registrationClassName,
  registrationDialogTitle,
  registrationGuardianName,
  registrationGuardianPhone,
  registrationStudentName,
  shortCompetitionDate
} from './competitionManagementViewModel.js'

test('competition view model normalizes pages, labels and filters', () => {
  const rows = normalizeCompetitionPage({
    records: [{
      id: 1,
      name: '少儿科创赛',
      registrationCount: 3,
      status: 'PUBLISHED',
      location: '南昌'
    }]
  })
  assert.equal(rows[0].title, '少儿科创赛')
  assert.equal(rows[0].registeredCount, 3)
  assert.equal(competitionScopeLabel('SCHOOL'), '学校赛事')
  assert.equal(competitionStatusLabel('OFFLINE'), '已下线')
  assert.equal(matchesCompetition(rows[0], {
    keyword: ' 南昌 ',
    status: 'PUBLISHED'
  }), true)
})

test('competition view model creates stable forms and picker dates', () => {
  assert.deepEqual(emptyCompetitionForm(), {
    title: '',
    scopeType: 'PLATFORM',
    schoolId: '',
    coverFileId: '',
    summary: '',
    content: '',
    infoUrl: '',
    location: '',
    competitionStartAt: '',
    competitionEndAt: '',
    registrationStartAt: '',
    registrationEndAt: '',
    maxParticipants: 1
  })
  assert.deepEqual(competitionForm({
    title: '科创赛',
    scopeType: 'SCHOOL',
    schoolId: 3,
    competitionStartAt: '2026-08-01 09:00:00',
    maxParticipants: 20
  }), {
    title: '科创赛',
    scopeType: 'SCHOOL',
    schoolId: 3,
    coverFileId: '',
    summary: '',
    content: '',
    infoUrl: '',
    location: '',
    competitionStartAt: '2026-08-01T09:00:00',
    competitionEndAt: '',
    registrationStartAt: '',
    registrationEndAt: '',
    maxParticipants: 20
  })
})

test('competition view model maps active school scope options', () => {
  assert.deepEqual(competitionSchoolOptions({
    items: [
      { id: 2, name: '山前幼儿园', status: 'ACTIVE' },
      { id: 3, name: '青山幼儿园', status: 'DISABLED' },
      { id: null, name: '无编号学校', status: 'ACTIVE' }
    ]
  }), [{ value: 2, label: '山前幼儿园' }])
})

test('competition view model owns registration presentation', () => {
  const row = {
    student: { name: '小山', className: '大一班' },
    guardian: { name: '山妈妈', phone: '13900000000' }
  }
  assert.equal(registrationDialogTitle({ title: '科创赛' }), '报名明细 - 科创赛')
  assert.equal(registrationStudentName(row), '小山')
  assert.equal(registrationClassName(row), '大一班')
  assert.equal(registrationGuardianName(row), '山妈妈')
  assert.equal(registrationGuardianPhone(row), '13900000000')
})

test('competition view model builds filters, dates and delete feedback', () => {
  assert.deepEqual(competitionListParams(' 科创 '), {
    page: 1,
    pageSize: 100,
    keyword: '科创'
  })
  assert.deepEqual(competitionExportFilter({
    keyword: ' 科创 ',
    status: 'PUBLISHED'
  }), {
    keyword: '科创',
    status: 'PUBLISHED'
  })
  assert.equal(shortCompetitionDate('2026-08-01T09:00:00'), '2026-08-01 09:00:00')
  assert.equal(competitionDatePickerValue('2026-08-01 09:00:00'), '2026-08-01T09:00:00')
  assert.equal(
    competitionDeleteErrorMessage(
      new Error('仅草稿状态可以删除'),
      { status: 'OFFLINE' }
    ),
    '后端当前未开放下线赛事删除，前端无法完成删除'
  )
  assert.equal(isCompetitionDialogCancel({ action: 'close' }), true)
})
