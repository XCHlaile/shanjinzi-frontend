import assert from 'node:assert/strict'
import test from 'node:test'

import { createCompetitionApi } from './competitionApi.js'

function recordingTransport(calls) {
  return Object.fromEntries(['get', 'post', 'patch', 'delete'].map(method => [
    method,
    (path, data) => {
      calls.push({ method: method.toUpperCase(), path, data })
      return Promise.resolve({ ok: true })
    }
  ]))
}

test('competition API owns public, registration, and school-management requests', async () => {
  const calls = []
  const api = createCompetitionApi(recordingTransport(calls))

  await api.fetchCompetitions({ pageSize: 6 })
  await api.registerCompetition(3, { remark: '参加' })
  await api.fetchRegistrationDetail('registration-4')
  await api.fetchCompetitionRegistrations(3, {
    classId: '8',
    startTime: '2026-07-01T00:00:00',
    ignored: true
  })
  await api.fetchParentCompetitionRegistrations('12')
  await api.setCompetitionLeadTeacher(3, { teacherId: '15' })

  assert.deepEqual(calls, [
    {
      method: 'GET',
      path: '/api/app/competitions',
      data: { query: { page: 1, pageSize: 6 } }
    },
    {
      method: 'POST',
      path: '/api/app/competitions/3/registrations',
      data: { remark: '参加' }
    },
    {
      method: 'GET',
      path: '/api/app/registrations/registration-4',
      data: undefined
    },
    {
      method: 'GET',
      path: '/api/open/competitions/3/registrations',
      data: { query: { classId: 8, startTime: '2026-07-01T00:00:00' } }
    },
    {
      method: 'GET',
      path: '/api/open/competitions/registrations',
      data: { query: { parentId: 12 } }
    },
    {
      method: 'PATCH',
      path: '/api/open/competitions/3/lead-teacher',
      data: { key: 15 }
    }
  ])
  assert.ok(Object.isFrozen(api))
})
