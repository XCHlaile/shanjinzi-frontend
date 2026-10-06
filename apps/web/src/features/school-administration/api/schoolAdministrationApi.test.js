import assert from 'node:assert/strict'
import test from 'node:test'

import { createSchoolAdministrationApi } from './schoolAdministrationApi.js'

function recordingTransport(calls) {
  return Object.fromEntries(['get', 'post', 'patch', 'delete', 'download'].map(method => [
    method,
    (path, data, options) => {
      calls.push({ method: method.toUpperCase(), path, data, options })
      return Promise.resolve({ ok: true })
    }
  ]))
}

test('school administration API owns class, user, and student payloads', async () => {
  const calls = []
  const api = createSchoolAdministrationApi(recordingTransport(calls))

  await api.fetchPublicClasses({ schoolId: '2', pageSize: 5 })
  await api.createPublicClass({
    name: ' 小一班 ',
    gradeName: ' 小班 ',
    sortOrder: '3',
    schoolId: '2'
  })
  await api.assignPublicClassTeachers(6, ['8', 8, 'invalid'])
  await api.createOpenUser({
    phone: '13900000000',
    realName: '老师',
    roleCode: 'TEACHER',
    schoolId: '2',
    ignored: true
  })
  await api.createOpenStudent({
    schoolId: '2',
    name: '小山',
    classId: '6',
    phoneNum: '13800000000',
    ignored: true
  })

  assert.deepEqual(calls, [
    {
      method: 'GET',
      path: '/api/public/classes',
      data: { query: { schoolId: 2, page: 1, pageSize: 5 } },
      options: undefined
    },
    {
      method: 'POST',
      path: '/api/public/classes',
      data: { name: '小一班', gradeName: '小班', sortOrder: 3, schoolId: 2 },
      options: undefined
    },
    {
      method: 'POST',
      path: '/api/public/classes/6/teachers',
      data: { teacherIds: [8] },
      options: undefined
    },
    {
      method: 'POST',
      path: '/api/open/users',
      data: {
        phone: '13900000000',
        realName: '老师',
        roleCode: 'TEACHER',
        schoolId: 2
      },
      options: undefined
    },
    {
      method: 'POST',
      path: '/api/public/students',
      data: {
        schoolId: 2,
        name: '小山',
        classId: 6,
        phoneNumber: '13800000000'
      },
      options: undefined
    }
  ])
  assert.ok(Object.isFrozen(api))
})

test('school administration API preserves multipart student import options', async () => {
  const calls = []
  const api = createSchoolAdministrationApi(recordingTransport(calls))
  const file = new Blob(['students'], { type: 'application/vnd.ms-excel' })

  await api.importOpenStudents({
    file,
    schoolId: '2',
    autoCreateClass: false,
    remark: '新生导入'
  })

  assert.equal(calls[0].method, 'POST')
  assert.equal(calls[0].path, '/api/public/students/import')
  assert.ok(calls[0].data instanceof FormData)
  assert.deepEqual([...calls[0].data.keys()], ['file'])
  assert.deepEqual(calls[0].options, {
    query: { schoolId: 2, autoCreateClass: false, remark: '新生导入' }
  })
})

test('school administration API removes a student class with the dedicated delete operation', async () => {
  const calls = []
  const api = createSchoolAdministrationApi(recordingTransport(calls))

  await api.removeOpenStudentClass(19)

  assert.deepEqual(calls, [{
    method: 'DELETE',
    path: '/api/public/students/19/class',
    data: undefined,
    options: undefined
  }])
})
