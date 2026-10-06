import assert from 'node:assert/strict'
import test from 'node:test'

import { useMyRegistrations } from './useMyRegistrations.js'

test('my registrations loads and normalizes the complete registration directory', async () => {
  const registrations = useMyRegistrations({
    api: {
      async fetchRegistrations(query) {
        assert.deepEqual(query, { page: 1, pageSize: 100 })
        return {
          registrations: [{
            id: 8,
            competitionId: 3,
            compName: '亲子运动会',
            studentId: 6,
            studentName: '小山',
            studentClass: '向日葵班',
            status: 'SUBMITTED'
          }]
        }
      }
    }
  })

  await registrations.loadRegistrations()

  assert.deepEqual(registrations.myList.value, [{
    registrationId: 8,
    competitionId: 3,
    competitionTitle: '亲子运动会',
    studentId: 6,
    studentName: '小山',
    className: '向日葵班',
    status: 'SUBMITTED',
    competitionStartAt: '',
    registrationEndAt: '',
    createdAt: ''
  }])
  assert.equal(registrations.loading.value, false)
})

test('my registrations clears stale data after a load failure', async () => {
  const registrations = useMyRegistrations({
    api: {
      async fetchRegistrations() {
        throw new Error('报名记录不可用')
      }
    }
  })
  registrations.myList.value = [{ registrationId: 1 }]

  await registrations.loadRegistrations()

  assert.deepEqual(registrations.myList.value, [])
  assert.equal(registrations.error.value, '报名记录不可用')
  assert.equal(registrations.loading.value, false)
})
