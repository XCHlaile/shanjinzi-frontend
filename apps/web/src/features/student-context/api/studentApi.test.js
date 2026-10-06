import assert from 'node:assert/strict'
import test from 'node:test'

import { createStudentApi } from './studentApi.js'

function recordingTransport(calls) {
  return Object.fromEntries(['get', 'post', 'delete'].map(method => [
    method,
    (path, data) => {
      calls.push({ method: method.toUpperCase(), path, data })
      return Promise.resolve({ ok: true })
    }
  ]))
}

test('student API owns guardian bindings and current-student context', async () => {
  const calls = []
  const api = createStudentApi(recordingTransport(calls))

  await api.fetchGuardianBindings({ status: 'BOUND' })
  await api.bindGuardian({
    schoolId: '3',
    childName: '小山',
    studentNo: 'S001',
    relation: '外婆'
  })
  await api.switchCurrentStudent({ studentId: '9' })
  await api.fetchGrowthRecords(9, { eventType: 'MOMENT', pageSize: 5 })

  assert.deepEqual(calls, [
    {
      method: 'GET',
      path: '/api/app/guardians/bindings',
      data: { query: { status: 'BOUND' } }
    },
    {
      method: 'POST',
      path: '/api/app/guardians/bind',
      data: {
        schoolId: 3,
        studentName: '小山',
        studentNo: 'S001',
        relationType: 'GRANDMOTHER_MATERNAL'
      }
    },
    {
      method: 'POST',
      path: '/api/app/students/current-context',
      data: { studentId: 9 }
    },
    {
      method: 'GET',
      path: '/api/app/students/9/profile-events',
      data: { query: { page: 1, pageSize: 5, eventType: 'MOMENT' } }
    }
  ])
  assert.ok(Object.isFrozen(api))
})
