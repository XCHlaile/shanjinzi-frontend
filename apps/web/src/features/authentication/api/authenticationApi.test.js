import assert from 'node:assert/strict'
import test from 'node:test'

import { createAuthenticationApi } from './authenticationApi.js'

function recordingTransport(calls) {
  return Object.fromEntries(['get', 'post', 'put'].map(method => [
    method,
    (path, data) => {
      calls.push({ method: method.toUpperCase(), path, data })
      return Promise.resolve({ ok: true })
    }
  ]))
}

test('authentication API owns login, registration, session, and profile requests', async () => {
  const calls = []
  const api = createAuthenticationApi(recordingTransport(calls))

  await api.sendSmsCode({ phone: '13900000000' })
  await api.smsLogin({ phone: '13900000000', code: '123456' })
  await api.registerUser({
    phone: '13900000001',
    code: '654321',
    password: 'secret',
    realName: '家长',
    schoolId: '8',
    studentName: '学生',
    relation: '妈妈'
  })
  await api.refreshLogin('refresh-token')
  await api.fetchProfile()
  await api.updateProfile({ nickname: '新昵称' })
  await api.fetchTeacherWorkbenchSummary()

  assert.deepEqual(calls, [
    {
      method: 'POST',
      path: '/api/public/auth/sms-codes',
      data: { phone: '13900000000', scene: 'LOGIN' }
    },
    {
      method: 'POST',
      path: '/api/public/auth/sms-login',
      data: { phone: '13900000000', smsCode: '123456' }
    },
    {
      method: 'POST',
      path: '/api/public/auth/register',
      data: {
        phone: '13900000001',
        smsCode: '654321',
        password: 'secret',
        realName: '家长',
        schoolId: 8,
        studentName: '学生',
        relationType: 'MOTHER'
      }
    },
    {
      method: 'POST',
      path: '/api/public/auth/refresh',
      data: { refreshToken: 'refresh-token' }
    },
    { method: 'GET', path: '/api/app/me', data: undefined },
    { method: 'PUT', path: '/api/app/me/profile', data: { nickname: '新昵称' } },
    { method: 'GET', path: '/api/app/teacher-workbench/summary', data: undefined }
  ])
  assert.ok(Object.isFrozen(api))
})
