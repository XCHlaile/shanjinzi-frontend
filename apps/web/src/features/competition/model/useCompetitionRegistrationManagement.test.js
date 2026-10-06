import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useCompetitionRegistrationManagement } from './useCompetitionRegistrationManagement.js'

function createManagement() {
  const calls = []
  const actionMessage = ref('')
  const management = useCompetitionRegistrationManagement({
    role: 'school',
    actionMessage,
    api: {
      async fetchCompetitionRegistrations(id, filters) {
        calls.push(['registrations', id, filters])
        return { items: [{ registrationId: 3, studentName: '小山' }] }
      },
      async setCompetitionLeadTeacher(id, teacherId) {
        calls.push(['lead-teacher', id, teacherId])
      }
    },
    schoolApi: {
      async listOpenUsers(options) {
        calls.push(['teachers', options])
        return {
          records: [
            { id: 7, realName: '山老师', status: 'ENABLED' },
            { id: 8, realName: '林老师', status: 'DISABLED' }
          ]
        }
      }
    }
  })
  return { actionMessage, calls, management }
}

test('competition registration management opens lists with active teachers', async () => {
  const { calls, management } = createManagement()

  await management.openRegistrations({
    id: 11,
    name: '春季运动会',
    leadTeacherId: 7
  })

  assert.deepEqual(calls, [
    ['teachers', { roleCode: 'TEACHER', page: 1, pageSize: 100 }],
    ['registrations', 11, {
      classId: undefined,
      startTime: undefined,
      endTime: undefined
    }]
  ])
  assert.deepEqual(management.teacherOptions.value.map(item => item.id), [7])
  assert.equal(management.registrationRows.value[0].studentName, '小山')
  assert.equal(management.leadTeacherId.value, '7')
})

test('competition registration management validates and applies filters', async () => {
  const { calls, management } = createManagement()
  management.registrationCompetition.value = { id: 11 }
  management.registrationFilters.classId = '-1'

  await management.loadCompetitionRegistrations()
  assert.equal(management.registrationsError.value, '班级 ID 必须是正整数')
  assert.deepEqual(calls, [])

  management.registrationFilters.classId = '3'
  management.registrationFilters.startTime = '2026-08-01T08:00'
  await management.loadCompetitionRegistrations()
  assert.deepEqual(calls, [
    ['registrations', 11, {
      classId: '3',
      startTime: '2026-08-01T08:00',
      endTime: undefined
    }]
  ])
})

test('competition registration management saves and clears a lead teacher', async () => {
  const { actionMessage, calls, management } = createManagement()
  management.registrationCompetition.value = { id: 11, name: '春季运动会' }

  await management.saveLeadTeacher()
  assert.equal(management.registrationsError.value, '请选择带队教师')

  management.leadTeacherId.value = '7'
  await management.saveLeadTeacher()
  assert.deepEqual(calls, [['lead-teacher', 11, '7']])
  assert.equal(management.registrationCompetition.value.leadTeacherId, 7)
  assert.equal(actionMessage.value, '赛事“春季运动会”的带队教师已更新')

  management.closeRegistrations()
  assert.equal(management.registrationCompetition.value, null)
  assert.equal(management.leadTeacherId.value, '')
})
