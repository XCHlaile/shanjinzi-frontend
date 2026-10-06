import assert from 'node:assert/strict'
import test from 'node:test'

import {
  canSignupCompetition,
  competitionHeroDescription,
  competitionPageItems,
  competitionProgressWidth,
  competitionRegistrationClassName,
  competitionRegistrationKey,
  competitionRegistrationName,
  competitionScopeLabel,
  competitionSignupButtonText,
  competitionStatusLabel,
  competitionTeacherId,
  competitionTeacherOptionLabel,
  formatCompetitionDateTime,
  hasCompetitionRegistration,
  isAvailableCompetitionTeacher,
  isPositiveCompetitionId,
  normalizeCompetition,
  normalizeRegistrationStats
} from '../index.js'

test('competition view model normalizes list records and registration stats', () => {
  assert.deepEqual(competitionPageItems({ competitions: [{ competitionId: 3 }] }), [
    { competitionId: 3 }
  ])
  assert.deepEqual(
    normalizeCompetition({
      competitionId: 3,
      title: '春季运动会',
      scopeType: 'SCHOOL',
      registrationEndAt: '2026-08-01T12:00:00',
      registeredCount: '12',
      maxParticipants: '20'
    }),
    {
      competitionId: 3,
      title: '春季运动会',
      scopeType: 'SCHOOL',
      registrationEndAt: '2026-08-01T12:00:00',
      registeredCount: '12',
      maxParticipants: '20',
      id: 3,
      scope: '校级赛事',
      status: '未开放',
      name: '春季运动会',
      summary: '',
      deadline: '2026-08-01T12:00:00',
      registrationStatus: '',
      registrationOpen: true,
      registered: 12,
      limit: 20,
      registrationStats: null,
      countError: ''
    }
  )
  assert.deepEqual(normalizeRegistrationStats({ total: '5', approved: 2 }), {
    total: 5,
    submitted: 0,
    approved: 2,
    rejected: 0,
    canceled: 0
  })
  assert.equal(competitionProgressWidth({ registered: 12, limit: 20 }), '60%')
  assert.equal(competitionProgressWidth({ registered: 20, limit: 10 }), '100%')
})

test('competition view model centralizes role and signup rules', () => {
  const student = { id: 8 }

  assert.match(competitionHeroDescription('teacher'), /不展示报名人员身份信息/)
  assert.equal(competitionScopeLabel('platform'), '平台赛事')
  assert.equal(competitionStatusLabel('published'), '已发布')
  assert.equal(hasCompetitionRegistration({ registrationStatus: 'approved' }), true)
  assert.equal(canSignupCompetition({ registrationOpen: true }, student), true)
  assert.equal(canSignupCompetition({ registrationOpen: false }, student), false)
  assert.equal(
    competitionSignupButtonText({ registrationOpen: true }, student, '小山'),
    '为 小山 报名'
  )
  assert.equal(
    competitionSignupButtonText({ registrationStatus: 'SUBMITTED' }, student, '小山'),
    '当前学生已报名'
  )
  assert.equal(formatCompetitionDateTime('2026-08-01T12:00:00'), '2026-08-01 12:00:00')
})

test('competition view model describes teachers and registration rows', () => {
  const teacher = { userId: 7, realName: '山老师', phone: '13800000000' }

  assert.equal(competitionTeacherId(teacher), 7)
  assert.equal(competitionTeacherOptionLabel(teacher), '山老师（13800000000）')
  assert.equal(isAvailableCompetitionTeacher(teacher), true)
  assert.equal(isAvailableCompetitionTeacher({ id: 8, status: 'DISABLED' }), false)
  assert.equal(isPositiveCompetitionId('3'), true)
  assert.equal(isPositiveCompetitionId('0'), false)
  assert.equal(competitionRegistrationName({ student: { name: '小林' } }), '小林')
  assert.equal(competitionRegistrationClassName({ class: { name: '一班' } }), '一班')
  assert.equal(competitionRegistrationKey({ studentId: 8 }, 2), 8)
  assert.equal(competitionRegistrationKey({}, 2), 'registration-2')
})
