import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { apiContracts, createApiClient, fillPath } from './applicationApi.js'

const openapi5 = JSON.parse(readFileSync(new URL('../../../../../../docs/api/5openapi.json', import.meta.url), 'utf8'))
const openapi6 = JSON.parse(readFileSync(new URL('../../../../../../docs/api/6openapi.json', import.meta.url), 'utf8'))
const openapi7 = JSON.parse(readFileSync(new URL('../../../../../../docs/api/7openapi.json', import.meta.url), 'utf8'))
const openapi8 = JSON.parse(readFileSync(new URL('../../../../../../docs/api/8openapi.json', import.meta.url), 'utf8'))
const openapi9 = JSON.parse(readFileSync(new URL('../../../../../../docs/api/9openapi.json', import.meta.url), 'utf8'))
const openapi12 = JSON.parse(readFileSync(new URL('../../../../../../docs/api/12openapi.json', import.meta.url), 'utf8'))
const currentOpenapi = JSON.parse(readFileSync(new URL('../../../../../docs/api/openapi.json', import.meta.url), 'utf8'))

function collectContracts(group, prefix = []) {
  return Object.entries(group).flatMap(([key, value]) => {
    if (value?.method && value?.path) return [{ key: [...prefix, key].join('.'), ...value }]
    if (value && typeof value === 'object') return collectContracts(value, [...prefix, key])
    return []
  })
}

function hasOpenApiOperation(contract) {
  const operation = currentOpenapi.paths?.[contract.path]?.[contract.method.toLowerCase()]
  return Boolean(operation)
}

function operationSet(doc) {
  return new Set(Object.entries(doc.paths || {}).flatMap(([path, item]) =>
    Object.keys(item)
      .filter(method => ['get', 'post', 'put', 'patch', 'delete'].includes(method))
      .map(method => `${method.toUpperCase()} ${path}`)
  ))
}

test('declares OpenAPI contracts for the web user client', () => {
  assert.equal(apiContracts.auth.sendSmsCode.path, '/api/public/auth/sms-codes')
  assert.equal(apiContracts.auth.passwordLogin.path, '/api/public/auth/login')
  assert.equal(apiContracts.auth.smsLogin.path, '/api/public/auth/sms-login')
  assert.equal(apiContracts.auth.register.path, '/api/public/auth/register')
  assert.equal(apiContracts.auth.refresh.path, '/api/public/auth/refresh')
  assert.equal(apiContracts.auth.logout.path, '/api/public/auth/logout')
  assert.equal(apiContracts.auth.resetPassword.path, '/api/public/auth/password/reset')
  assert.equal(apiContracts.students.currentContext.path, '/api/app/students/current-context')
  assert.equal(apiContracts.students.myClasses.path, '/api/app/students/my-classes')
  assert.equal(apiContracts.teacherWorkbench.summary.path, '/api/app/teacher-workbench/summary')
  assert.equal(apiContracts.students.profileEvents.path, '/api/app/students/{studentId}/profile-events')
  assert.equal(apiContracts.registrations.list.path, '/api/app/registrations')
  assert.equal(apiContracts.registrations.detail.path, '/api/app/registrations/{registrationId}')
  assert.equal(apiContracts.moments.comments.path, '/api/app/moments/{momentId}/comments')
  assert.equal(apiContracts.moments.update.path, '/api/app/moments/{momentId}')
  assert.equal(apiContracts.moments.report.path, '/api/app/moments/{momentId}/reports')
  assert.equal(apiContracts.moments.reportComment.path, '/api/app/moments/{momentId}/comments/{commentId}/reports')
  assert.equal(apiContracts.files.upload.path, '/api/app/files')
  assert.equal(apiContracts.publicPages.detail.path, '/api/public/page-contents/{pageKey}')
  assert.equal(apiContracts.publicNews.list.path, '/api/public/news-articles')
  assert.equal(apiContracts.publicSchools.list.path, '/api/public/schools')
  assert.equal(apiContracts.publicClasses.list.path, '/api/public/classes')
  assert.equal(apiContracts.publicClasses.assignTeachers.path, '/api/public/classes/{id}/teachers')
  assert.equal(apiContracts.publicCompetitions.list.path, '/api/public/competitions')
  assert.equal(apiContracts.competitionAdministration.registrations.path, '/api/open/competitions/{id}/registrations')
  assert.equal(apiContracts.competitionAdministration.parentRegistrations.path, '/api/open/competitions/registrations')
  assert.equal(apiContracts.competitionAdministration.leadTeacher.path, '/api/open/competitions/{id}/lead-teacher')
  assert.deepEqual(apiContracts.openUsers.bindStudents, { method: 'POST', path: '/api/open/users/{id}/bind-students' })
  assert.equal(apiContracts.publicStudents.importTemplate.path, '/api/public/students/import/template')
  assert.equal(apiContracts.publicStudents.import.path, '/api/public/students/import')
  assert.equal(apiContracts.publicStudents.setClass.path, '/api/public/students/{id}/class')
  assert.equal(apiContracts.publicStudents.removeClass.method, 'DELETE')
  assert.equal(apiContracts.forum.topics.path, '/api/app/forum-topics')
  assert.equal(apiContracts.forum.updateTopic.path, '/api/app/forum-topics/{topicId}')
  assert.equal(apiContracts.forum.reportTopic.path, '/api/app/forum-topics/{topicId}/reports')
  assert.equal(apiContracts.forum.updateReply.path, '/api/app/forum-topics/{topicId}/replies/{replyId}')
  assert.equal(apiContracts.forum.reportReply.path, '/api/app/forum-topics/{topicId}/replies/{replyId}/reports')
  assert.equal(apiContracts.messages.contacts.path, '/api/app/messages/contacts')
  assert.equal(apiContracts.messages.send.path, '/api/app/messages')
  assert.equal(apiContracts.messages.unreadCount.path, '/api/app/messages/unread-count')
})

test('keeps web API contracts aligned with the latest OpenAPI document', () => {
  assert.deepEqual(
    collectContracts(apiContracts).filter(contract => !hasOpenApiOperation(contract)).map(contract => `${contract.method} ${contract.path}`),
    []
  )
  assert.equal(apiContracts.publicPages.detail.path, '/api/public/page-contents/{pageKey}')
  assert.equal(apiContracts.publicNews.list.path, '/api/public/news-articles')
  assert.equal(apiContracts.publicSchools.list.path, '/api/public/schools')
  assert.equal(apiContracts.publicCompetitions.list.path, '/api/public/competitions')
  assert.equal(apiContracts.forum.topics.path, '/api/app/forum-topics')
})

test('declares every web app endpoint introduced by 8openapi.json', () => {
  const oldOperations = new Set(Object.entries(openapi7.paths).flatMap(([path, item]) =>
    Object.keys(item).map(method => `${method.toUpperCase()} ${path}`)
  ))
  const addedOperations = Object.entries(openapi8.paths).flatMap(([path, item]) =>
    Object.keys(item)
      .filter(method => ['get', 'post', 'put', 'patch', 'delete'].includes(method))
      .map(method => `${method.toUpperCase()} ${path}`)
  ).filter(operation => operation.includes(' /api/app/') && !oldOperations.has(operation)).sort()
  const declaredOperations = collectContracts(apiContracts)
    .map(contract => `${contract.method} ${contract.path}`)
    .filter(operation => addedOperations.includes(operation))
    .sort()

  assert.deepEqual(addedOperations, ['PUT /api/app/moments/{momentId}'])
  assert.deepEqual(declaredOperations, addedOperations)
  assert.deepEqual(openapi8.components.schemas.UpdateAppMomentRequest.required, ['content', 'mediaFileIds'])
})

test('declares every app endpoint introduced by 6openapi.json', () => {
  const oldOperations = new Set(Object.entries(openapi5.paths).flatMap(([path, item]) =>
    Object.keys(item).map(method => `${method.toUpperCase()} ${path}`)
  ))
  const newAppOperations = Object.entries(openapi6.paths).flatMap(([path, item]) =>
    Object.keys(item)
      .filter(method => ['get', 'post', 'put', 'patch', 'delete'].includes(method))
      .map(method => `${method.toUpperCase()} ${path}`)
  ).filter(operation => operation.includes(' /api/app/') && !oldOperations.has(operation)).sort()
  const declaredAppOperations = collectContracts(apiContracts)
    .map(contract => `${contract.method} ${contract.path}`)
    .filter(operation => newAppOperations.includes(operation))
    .sort()

  assert.equal(newAppOperations.length, 12)
  assert.deepEqual(declaredAppOperations, newAppOperations)
})

test('declares every shared open endpoint introduced by 6openapi.json', () => {
  const oldOperations = new Set(Object.entries(openapi5.paths).flatMap(([path, item]) =>
    Object.keys(item).map(method => `${method.toUpperCase()} ${path}`)
  ))
  const newOpenOperations = Object.entries(openapi6.paths).flatMap(([path, item]) =>
    Object.keys(item)
      .filter(method => ['get', 'post', 'put', 'patch', 'delete'].includes(method))
      .map(method => `${method.toUpperCase()} ${path}`)
  ).filter(operation => operation.includes(' /api/open/') && !oldOperations.has(operation)).sort()
  const supportedOpenOperations = newOpenOperations.filter(operation => operationSet(openapi12).has(operation))
  const declaredOpenOperations = collectContracts(apiContracts)
    .map(contract => `${contract.method} ${contract.path}`)
    .filter(operation => supportedOpenOperations.includes(operation))
    .sort()

  assert.equal(newOpenOperations.length, 25)
  assert.deepEqual(declaredOpenOperations, supportedOpenOperations)
})

test('declares every web app and shared open endpoint introduced by 7openapi.json', () => {
  const oldOperations = new Set(Object.entries(openapi6.paths).flatMap(([path, item]) =>
    Object.keys(item).map(method => `${method.toUpperCase()} ${path}`)
  ))
  const newWebOperations = Object.entries(openapi7.paths).flatMap(([path, item]) =>
    Object.keys(item)
      .filter(method => ['get', 'post', 'put', 'patch', 'delete'].includes(method))
      .map(method => `${method.toUpperCase()} ${path}`)
  ).filter(operation => (
    (operation.includes(' /api/app/') || operation.includes(' /api/open/')) && !oldOperations.has(operation)
  )).sort()
  const supportedWebOperations = newWebOperations.filter(operation => operationSet(openapi12).has(operation))
  const declaredOperations = collectContracts(apiContracts)
    .map(contract => `${contract.method} ${contract.path}`)
    .filter(operation => supportedWebOperations.includes(operation))
    .sort()

  assert.equal(newWebOperations.length, 10)
  assert.deepEqual(declaredOperations, supportedWebOperations)
})

test('maps all web app requests introduced by 7openapi.json with strict request bodies', async () => {
  const calls = []
  const transport = Object.fromEntries(['get', 'post', 'put', 'patch', 'delete'].map(method => [
    method,
    (path, dataOrOptions, options) => {
      calls.push(method === 'get' || method === 'delete'
        ? { method: method.toUpperCase(), path, options: dataOrOptions }
        : { method: method.toUpperCase(), path, data: dataOrOptions, options })
      return Promise.resolve({ ok: true })
    }
  ]))
  const api = createApiClient(transport)

  await api.reportActivity(10, { reason: '  不当内容  ', ignored: true })
  await api.reportActivityComment(10, 11, { reason: '辱骂', ignored: true })
  await api.updateForumTopic(12, { title: '新标题', content: '新内容', tag: '育儿交流', ignored: true })
  await api.reportForumTopic(12, { reason: '广告', ignored: true })
  await api.updateForumReply(12, 13, { content: '修改后的回复', text: '不能覆盖 content', ignored: true })
  await api.reportForumReply(12, 13, { reason: '引战', ignored: true })

  assert.deepEqual(calls, [
    { method: 'POST', path: '/api/app/moments/10/reports', data: { reason: '不当内容' }, options: undefined },
    { method: 'POST', path: '/api/app/moments/10/comments/11/reports', data: { reason: '辱骂' }, options: undefined },
    {
      method: 'PUT',
      path: '/api/app/forum-topics/12',
      data: { title: '新标题', content: '新内容', tag: '育儿交流' },
      options: undefined
    },
    { method: 'POST', path: '/api/app/forum-topics/12/reports', data: { reason: '广告' }, options: undefined },
    {
      method: 'PUT',
      path: '/api/app/forum-topics/12/replies/13',
      data: { content: '修改后的回复' },
      options: undefined
    },
    {
      method: 'POST',
      path: '/api/app/forum-topics/12/replies/13/reports',
      data: { reason: '引战' },
      options: undefined
    }
  ])
})

test('maps requests added or extended by 8openapi.json', async () => {
  const calls = []
  const transport = Object.fromEntries(['get', 'post', 'put', 'patch', 'delete'].map(method => [
    method,
    (path, dataOrOptions, options) => {
      calls.push(method === 'get' || method === 'delete'
        ? { method: method.toUpperCase(), path, options: dataOrOptions }
        : { method: method.toUpperCase(), path, data: dataOrOptions, options })
      return Promise.resolve({ ok: true })
    }
  ]))
  const api = createApiClient(transport)
  const forumFile = new Blob(['forum image'], { type: 'image/png' })

  await api.updateActivity(10, { content: '修订动态', mediaFileIds: ['8', 9], visibility: 'SCHOOL' })
  await api.createForumTopic({ title: '主题', content: '内容', tag: '育儿交流', mediaFileIds: ['11'] })
  await api.updateForumTopic(12, { title: '主题', content: '新内容', tag: '育儿交流', mediaFileIds: ['13'] })
  await api.replyForumTopic(12, { content: '回复', mediaFileIds: ['14'] })
  await api.replyForumTopic(12, { content: '', mediaFileIds: ['17'] })
  await api.updateForumReply(12, 15, { content: '新回复', mediaFileIds: ['16'] })
  await api.uploadFile({ file: forumFile, sourceType: 'forum' })

  assert.deepEqual(calls.slice(0, 6), [
    { method: 'PUT', path: '/api/app/moments/10', data: { content: '修订动态', mediaFileIds: [8, 9] }, options: undefined },
    { method: 'POST', path: '/api/app/forum-topics', data: { title: '主题', content: '内容', tag: '育儿交流', mediaFileIds: [11] }, options: undefined },
    { method: 'PUT', path: '/api/app/forum-topics/12', data: { title: '主题', content: '新内容', tag: '育儿交流', mediaFileIds: [13] }, options: undefined },
    { method: 'POST', path: '/api/app/forum-topics/12/replies', data: { content: '回复', mediaFileIds: [14] }, options: undefined },
    { method: 'POST', path: '/api/app/forum-topics/12/replies', data: { content: '', mediaFileIds: [17] }, options: undefined },
    { method: 'PUT', path: '/api/app/forum-topics/12/replies/15', data: { content: '新回复', mediaFileIds: [16] }, options: undefined }
  ])
  assert.equal(calls[6].method, 'POST')
  assert.equal(calls[6].path, '/api/app/files?sourceType=forum')
  assert.ok(calls[6].data instanceof FormData)
  assert.deepEqual([...calls[6].data.keys()], ['file'])
  assert.equal(calls[6].data.get('file').size, forumFile.size)
})

test('maps all shared open requests introduced or updated by 7openapi.json', async () => {
  const calls = []
  const transport = Object.fromEntries(['get', 'post', 'put', 'patch', 'delete', 'download'].map(method => [
    method,
    (path, dataOrOptions, options) => {
      calls.push(method === 'get' || method === 'delete' || method === 'download'
        ? { method: method.toUpperCase(), path, options: dataOrOptions }
        : { method: method.toUpperCase(), path, data: dataOrOptions, options })
      return Promise.resolve({ ok: true })
    }
  ]))
  const api = createApiClient(transport)
  const file = new Blob(['student import'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

  await api.fetchParentCompetitionRegistrations('21')
  await api.setCompetitionLeadTeacher(8, '31')
  await api.fetchCompetitionRegistrations(8, {
    classId: '41',
    startTime: '2026-07-01T00:00:00',
    endTime: '2026-07-31T23:59:59',
    page: 9,
    pageSize: 99,
    ignored: true
  })
  await api.listOpenUsers({ classId: '41', schoolId: '2', roleCode: 'TEACHER' })
  await api.downloadOpenStudentImportTemplate()
  await api.importOpenStudents({
    file,
    schoolId: '2',
    autoCreateClass: false,
    remark: '七月导入',
    ignored: true
  })

  assert.deepEqual(calls.map(call => `${call.method} ${call.path}`), [
    'GET /api/open/competitions/registrations',
    'PATCH /api/open/competitions/8/lead-teacher',
    'GET /api/open/competitions/8/registrations',
    'GET /api/open/users',
    'DOWNLOAD /api/public/students/import/template',
    'POST /api/public/students/import'
  ])
  assert.deepEqual(calls[0].options, { query: { parentId: 21 } })
  assert.deepEqual(calls[1].data, { key: 31 })
  assert.deepEqual(calls[2].options, {
    query: { classId: 41, startTime: '2026-07-01T00:00:00', endTime: '2026-07-31T23:59:59' }
  })
  assert.deepEqual(calls[3].options, {
    query: { roleCode: 'TEACHER', schoolId: 2, classId: 41, page: 1, pageSize: 20 }
  })
  assert.deepEqual(calls[5].options, {
    query: { schoolId: 2, autoCreateClass: false, remark: '七月导入' }
  })
  assert.ok(calls[5].data instanceof FormData)
  assert.deepEqual([...calls[5].data.keys()], ['file'])
  assert.equal(calls[5].data.get('file').size, file.size)
  assert.equal(calls[5].data.get('file').type, file.type)
})

test('maps school class management to the 9openapi public class contract', async () => {
  const calls = []
  const transport = Object.fromEntries(['get', 'post', 'patch', 'delete'].map(method => [
    method,
    (path, dataOrOptions, options) => {
      calls.push(method === 'get' || method === 'delete'
        ? { method: method.toUpperCase(), path, options: dataOrOptions }
        : { method: method.toUpperCase(), path, data: dataOrOptions, options })
      return Promise.resolve({ ok: true })
    }
  ]))
  const api = createApiClient(transport)

  await api.fetchPublicClasses({ schoolId: '2', name: ' 小一班 ', gradeName: '小班', page: 2, pageSize: 50 })
  await api.fetchPublicClassDetail(7)
  await api.createPublicClass({ schoolId: '2', name: ' 小一班 ', gradeName: ' 小班 ', sortOrder: '3' })
  await api.updatePublicClass(7, { name: ' 小二班 ', gradeName: ' 小班 ', sortOrder: '4' })
  await api.assignPublicClassTeachers(7, ['11', 12, '11', 'invalid'])
  await api.enablePublicClass(7)
  await api.disablePublicClass(7)
  await api.deletePublicClass(7)

  assert.deepEqual(calls, [
    { method: 'GET', path: '/api/public/classes', options: { query: { schoolId: 2, name: ' 小一班 ', gradeName: '小班', page: 2, pageSize: 50 } } },
    { method: 'GET', path: '/api/public/classes/7', options: undefined },
    { method: 'POST', path: '/api/public/classes', data: { name: '小一班', gradeName: '小班', sortOrder: 3, schoolId: 2 }, options: undefined },
    { method: 'PATCH', path: '/api/public/classes/7', data: { name: '小二班', gradeName: '小班', sortOrder: 4 }, options: undefined },
    { method: 'POST', path: '/api/public/classes/7/teachers', data: { teacherIds: [11, 12] }, options: undefined },
    { method: 'PATCH', path: '/api/public/classes/7/enable', data: undefined, options: undefined },
    { method: 'PATCH', path: '/api/public/classes/7/disable', data: undefined, options: undefined },
    { method: 'DELETE', path: '/api/public/classes/7', options: undefined }
  ])
  assert.ok(openapi9.paths['/api/public/classes']?.get)
  assert.ok(openapi9.paths['/api/public/classes/{id}/teachers']?.post)
})

test('maps all app requests introduced by 6openapi.json', async () => {
  const calls = []
  const transport = Object.fromEntries(['get', 'post', 'put', 'patch', 'delete'].map(method => [
    method,
    (path, dataOrOptions, options) => {
      calls.push(method === 'get' || method === 'delete'
        ? { method: method.toUpperCase(), path, options: dataOrOptions }
        : { method: method.toUpperCase(), path, data: dataOrOptions, options })
      return Promise.resolve({ ok: true })
    }
  ]))
  const api = createApiClient(transport)

  await api.unbindGuardian(4)
  await api.createActivity({ content: '动态', classId: '3', visibility: 'CLASS', mediaFileIds: ['8'], studentIds: ['9'] })
  await api.fetchMyActivities({ page: 2 })
  await api.removeActivity(10)
  await api.removeActivityComment(10, 11)
  await api.fetchMyForumTopics({ pageSize: 30 })
  await api.removeForumTopic(12)
  await api.removeForumReply(12, 13)
  await api.fetchNotifications({ readStatus: 'UNREAD' })
  await api.fetchNotificationUnreadCount()
  await api.markNotificationRead(14)
  await api.markAllNotificationsRead()

  assert.deepEqual(calls, [
    { method: 'DELETE', path: '/api/app/guardians/bindings/4', options: undefined },
    {
      method: 'POST',
      path: '/api/app/moments',
      data: { content: '动态', classId: 3, visibility: 'CLASS', mediaFileIds: [8], studentIds: [9] },
      options: undefined
    },
    { method: 'GET', path: '/api/app/moments/mine', options: { query: { page: 2, pageSize: 20 } } },
    { method: 'DELETE', path: '/api/app/moments/10', options: undefined },
    { method: 'DELETE', path: '/api/app/moments/10/comments/11', options: undefined },
    { method: 'GET', path: '/api/app/forum-topics/mine', options: { query: { page: 1, pageSize: 30 } } },
    { method: 'DELETE', path: '/api/app/forum-topics/12', options: undefined },
    { method: 'DELETE', path: '/api/app/forum-topics/12/replies/13', options: undefined },
    { method: 'GET', path: '/api/app/notifications', options: { query: { page: 1, pageSize: 20, readStatus: 'UNREAD' } } },
    { method: 'GET', path: '/api/app/notifications/unread-count', options: undefined },
    { method: 'PATCH', path: '/api/app/notifications/14/read', data: undefined, options: undefined },
    { method: 'PATCH', path: '/api/app/notifications/read-all', data: undefined, options: undefined }
  ])
})

test('maps all shared open requests introduced by 6openapi.json', async () => {
  const calls = []
  const transport = Object.fromEntries(['get', 'post', 'put', 'patch', 'delete', 'download'].map(method => [
    method,
    (path, dataOrOptions, options) => {
      calls.push(method === 'get' || method === 'delete' || method === 'download'
        ? { method: method.toUpperCase(), path, options: dataOrOptions }
        : { method: method.toUpperCase(), path, data: dataOrOptions, options })
      return Promise.resolve({ ok: true })
    }
  ]))
  const api = createApiClient(transport)

  await api.listOpenUsers({ roleCode: 'TEACHER' })
  await api.createOpenUser({ phone: '13900000000', realName: '教师', roleCode: 'TEACHER', schoolId: '1' })
  await api.getOpenUser(2)
  await api.updateOpenUser(2, { realName: '新姓名', avatarFileId: '9' })
  await api.updateOpenUserClasses(2, ['3', 4])
  await api.bindOpenUserStudents(2, ['5', 6, '5'], 'MOTHER')
  await api.enableOpenUser(2)
  await api.disableOpenUser(2)
  await api.listOpenStudents({ name: '学生' })
  await api.createOpenStudent({ name: '学生', classId: '3', phoneNum: '13800138000' })
  await api.getOpenStudent(5)
  await api.updateOpenStudent(5, { name: '学生乙', classId: '4' })
  await api.setOpenStudentClass(5, '4')
  await api.enableOpenStudent(5)
  await api.disableOpenStudent(5)
  await api.listOpenStudentGuardians(5)
  await api.unbindOpenStudentGuardian(5, 6)
  await api.getOpenStudentProfile(5)
  await api.listOpenStudentImportBatches({ pageSize: 50 })
  await api.getOpenStudentImportBatch(7)
  await api.fetchCompetitionRegistrations(8)
  await api.listOpenAuditLogs({ module: 'USER' })
  await api.getOpenAuditLog(9)
  await api.listOpenExportTasks({ page: 2 })
  await api.createOpenExportTask({ taskType: 'STUDENTS', scopeType: 'SCHOOL', filterJson: { status: 'ENABLED' } })
  await api.getOpenExportTask(10)
  await api.downloadOpenExportTask(10)

  assert.deepEqual(calls.map(call => `${call.method} ${call.path}`), [
    'GET /api/open/users',
    'POST /api/open/users',
    'GET /api/open/users/2',
    'PATCH /api/open/users/2',
    'PATCH /api/open/users/2/classes',
    'POST /api/open/users/2/bind-students',
    'PATCH /api/open/users/2/enable',
    'PATCH /api/open/users/2/disable',
    'GET /api/public/students',
    'POST /api/public/students',
    'GET /api/public/students/5',
    'PATCH /api/public/students/5',
    'PATCH /api/public/students/5/class',
    'PATCH /api/public/students/5/enable',
    'PATCH /api/public/students/5/disable',
    'GET /api/public/students/5/guardians',
    'POST /api/public/students/5/guardians/6/unbind',
    'GET /api/public/students/5/profile',
    'GET /api/public/students/import/batches',
    'GET /api/public/students/import/batches/7',
    'GET /api/open/competitions/8/registrations',
    'GET /api/open/audit-logs',
    'GET /api/open/audit-logs/9',
    'GET /api/open/export-tasks',
    'POST /api/open/export-tasks',
    'GET /api/open/export-tasks/10',
    'DOWNLOAD /api/open/export-tasks/10/download'
  ])
  assert.deepEqual(calls[1].data, { phone: '13900000000', realName: '教师', roleCode: 'TEACHER', schoolId: 1 })
  assert.deepEqual(calls[4].data, { classIds: [3, 4] })
  assert.deepEqual(calls[5].data, { studentIds: [5, 6], relationType: 'MOTHER' })
  assert.deepEqual(
    calls.find(call => call.method === 'POST' && call.path === '/api/public/students').data,
    { name: '学生', classId: 3, phoneNumber: '13800138000' }
  )
  assert.deepEqual(
    calls.find(call => call.method === 'PATCH' && call.path === '/api/public/students/5').data,
    { name: '学生乙' }
  )
  assert.deepEqual(
    calls.find(call => call.path === '/api/public/students/5/class').data,
    { classId: 4 }
  )
  assert.deepEqual(
    calls.find(call => call.method === 'POST' && call.path === '/api/open/export-tasks').data,
    { taskType: 'STUDENTS', scopeType: 'SCHOOL', filterJson: '{"status":"ENABLED"}' }
  )
})

test('fills OpenAPI path parameters', () => {
  assert.equal(
    fillPath('/api/app/competitions/{competitionId}/registrations', { competitionId: 8 }),
    '/api/app/competitions/8/registrations'
  )
})
