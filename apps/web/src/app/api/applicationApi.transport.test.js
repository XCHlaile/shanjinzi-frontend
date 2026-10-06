import assert from 'node:assert/strict'
import test from 'node:test'

import { createApiClient } from './applicationApi.js'

test('maps web user actions to OpenAPI transport calls', async () => {
  const calls = []
  const transport = {
    get(path, options) {
      calls.push({ method: 'GET', path, options })
      return Promise.resolve({ ok: true })
    },
    post(path, data, options) {
      calls.push({ method: 'POST', path, data, options })
      return Promise.resolve({ ok: true })
    },
    put(path, data, options) {
      calls.push({ method: 'PUT', path, data, options })
      return Promise.resolve({ ok: true })
    },
    patch(path, data, options) {
      calls.push({ method: 'PATCH', path, data, options })
      return Promise.resolve({ ok: true })
    },
    delete(path, options) {
      calls.push({ method: 'DELETE', path, options })
      return Promise.resolve({ ok: true })
    }
  }
  const api = createApiClient(transport)

  await api.sendSMSCode({ phone: '13900000000' })
  await api.passwordLogin({ phone: '13900000000', password: 'secret' })
  await api.smsLogin({ phone: '13900000000', code: '123456' })
  await api.registerUser({
    phone: '13900000001',
    code: '123456',
    password: 'secret',
    realName: '家长',
    schoolId: '1',
    studentName: '学生',
    relation: '妈妈'
  })
  await api.refreshLogin('refresh-token-1')
  await api.logoutUser('refresh-token-1')
  await api.resetPassword({ phone: '13900000000', code: '654321', newPassword: 'new-secret' })
  await api.fetchActivities()
  await api.commentActivity(5, { text: '收到', mediaFileIds: ['21', 22] })
  await api.fetchCompetitions()
  await api.registerCompetition(9, { remark: '参加' })
  await api.fetchRegistrations({ status: 'SUBMITTED', pageSize: 20 })
  await api.fetchRegistrationDetail('registration-1')
  await api.fetchGrowthRecords(12, { eventType: 'MOMENT', pageSize: 5 })
  await api.switchCurrentStudent(12)
  await api.fetchMessageContacts('teacher')
  await api.fetchUnreadCount()
  await api.fetchConversations({ page: 2 })
  await api.fetchMessageHistory(11, { pageSize: 20 })
  await api.markMessageRead(101)
  await api.markConversationRead(11)
  await api.sendMessage({ clientMessageId: '00000000-0000-4000-8000-000000000001', body: 'received', receiverId: '12', attachmentFileIds: ['7'] })
  await api.recallMessage(101)
  await api.hideMessage(101)
  await api.updateConversationSettings(11, { pinned: true, muted: false })
  await api.fetchPublicPage('home')
  await api.fetchPublicNews({ pageSize: 4 })
  await api.fetchPublicSchools({ name: 'school' })
  await api.fetchPublicCompetitions({ keyword: 'steam' })
  await api.fetchPublicCompetitionRegistrationCount(9)
  await api.fetchCompetitionRegistrations(9)
  await api.fetchForumTopics({ tag: 'parenting' })
  await api.createForumTopic({ title: 'topic', body: 'body', tag: 'parenting' })
  await api.replyForumTopic(7, { text: 'reply' })

  assert.deepEqual(calls, [
    {
      method: 'POST',
      path: '/api/public/auth/sms-codes',
      data: { phone: '13900000000', scene: 'LOGIN' },
      options: undefined
    },
    {
      method: 'POST',
      path: '/api/public/auth/login',
      data: { phone: '13900000000', password: 'secret' },
      options: undefined
    },
    {
      method: 'POST',
      path: '/api/public/auth/sms-login',
      data: { phone: '13900000000', smsCode: '123456' },
      options: undefined
    },
    {
      method: 'POST',
      path: '/api/public/auth/register',
      data: {
        phone: '13900000001',
        smsCode: '123456',
        password: 'secret',
        realName: '家长',
        schoolId: 1,
        studentName: '学生',
        relationType: 'MOTHER'
      },
      options: undefined
    },
    {
      method: 'POST',
      path: '/api/public/auth/refresh',
      data: { refreshToken: 'refresh-token-1' },
      options: undefined
    },
    {
      method: 'POST',
      path: '/api/public/auth/logout',
      data: { refreshToken: 'refresh-token-1' },
      options: undefined
    },
    {
      method: 'POST',
      path: '/api/public/auth/password/reset',
      data: { phone: '13900000000', smsCode: '654321', newPassword: 'new-secret' },
      options: undefined
    },
    { method: 'GET', path: '/api/app/moments', options: { query: { page: 1, pageSize: 10 } } },
    {
      method: 'POST',
      path: '/api/app/moments/5/comments',
      data: { content: '收到', mediaFileIds: [21, 22] },
      options: undefined
    },
    { method: 'GET', path: '/api/app/competitions', options: { query: { page: 1, pageSize: 10 } } },
    {
      method: 'POST',
      path: '/api/app/competitions/9/registrations',
      data: { remark: '参加' },
      options: undefined
    },
    {
      method: 'GET',
      path: '/api/app/registrations',
      options: { query: { page: 1, pageSize: 20, status: 'SUBMITTED' } }
    },
    { method: 'GET', path: '/api/app/registrations/registration-1', options: undefined },
    {
      method: 'GET',
      path: '/api/app/students/12/profile-events',
      options: { query: { page: 1, pageSize: 5, eventType: 'MOMENT' } }
    },
    {
      method: 'POST',
      path: '/api/app/students/current-context',
      data: { studentId: 12 },
      options: undefined
    },
    { method: 'GET', path: '/api/app/messages/contacts', options: { query: { keyword: 'teacher' } } },
    { method: 'GET', path: '/api/app/messages/unread-count', options: undefined },
    { method: 'GET', path: '/api/app/messages/conversations', options: { query: { page: 2, pageSize: 20 } } },
    { method: 'GET', path: '/api/app/messages/conversations/11/messages', options: { query: { page: 1, pageSize: 20 } } },
    { method: 'PATCH', path: '/api/app/messages/101/read', data: undefined, options: undefined },
    { method: 'PATCH', path: '/api/app/messages/conversations/11/read', data: undefined, options: undefined },
    {
      method: 'POST',
      path: '/api/app/messages',
      data: {
        clientMessageId: '00000000-0000-4000-8000-000000000001',
        receiverId: 12,
        content: 'received',
        attachmentFileIds: [7]
      },
      options: undefined
    },
    { method: 'PATCH', path: '/api/app/messages/101/recall', data: undefined, options: undefined },
    { method: 'DELETE', path: '/api/app/messages/101', options: undefined },
    {
      method: 'PATCH',
      path: '/api/app/messages/conversations/11/settings',
      data: { pinned: true, muted: false },
      options: undefined
    },
    { method: 'GET', path: '/api/public/page-contents/home', options: undefined },
    { method: 'GET', path: '/api/public/news-articles', options: { query: { page: 1, pageSize: 4 } } },
    { method: 'GET', path: '/api/public/schools', options: { query: { page: 1, pageSize: 10, name: 'school' } } },
    { method: 'GET', path: '/api/public/competitions', options: { query: { page: 1, pageSize: 10, keyword: 'steam' } } },
    { method: 'GET', path: '/api/public/competitions/9/registration-count', options: undefined },
    { method: 'GET', path: '/api/open/competitions/9/registrations', options: undefined },
    { method: 'GET', path: '/api/app/forum-topics', options: { query: { page: 1, pageSize: 10, tag: 'parenting' } } },
    { method: 'POST', path: '/api/app/forum-topics', data: { title: 'topic', content: 'body', tag: 'parenting' }, options: undefined },
    { method: 'POST', path: '/api/app/forum-topics/7/replies', data: { content: 'reply' }, options: undefined }
  ])
})
