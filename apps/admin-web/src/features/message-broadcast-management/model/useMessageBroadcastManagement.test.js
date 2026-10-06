import assert from 'node:assert/strict'
import test from 'node:test'

import { useMessageBroadcastManagement } from './useMessageBroadcastManagement.js'

function createBroadcastModel(apiOverrides = {}) {
  const calls = []
  const messages = []
  const api = {
    async fetchBroadcasts(params) {
      calls.push(['list', params])
      return {
        total: 2,
        items: [
          { id: 1, scope: 'PLATFORM', status: 'COMPLETED' },
          { id: 2, schoolId: 3, scope: 'SCHOOL', status: 'FAILED' }
        ]
      }
    },
    async fetchSchools(params) {
      calls.push(['schools', params])
      return {
        items: [
          { id: 3, name: '山前幼儿园', status: 'ACTIVE' },
          { id: 4, name: '停用学校', status: 'DISABLED' }
        ]
      }
    },
    async fetchUsers(params) {
      calls.push(['users', params])
      return {
        items: [
          { id: 5, realName: '赵老师', status: 'ACTIVE' },
          { id: 6, realName: '已删除', status: 'DELETED' }
        ]
      }
    },
    async createBroadcast(payload) {
      calls.push(['create', payload])
    },
    async fetchBroadcast(broadcastId) {
      calls.push(['detail', broadcastId])
      return {
        id: broadcastId,
        recipientStatusCounts: { SENT: 2, FAILED: 1 }
      }
    },
    async retryBroadcast(broadcastId) {
      calls.push(['retry', broadcastId])
    },
    async exportBroadcasts(filter) {
      calls.push(['export', filter])
      return { blob: new Blob(['messages']), filename: 'messages.csv' }
    },
    ...apiOverrides
  }
  const model = useMessageBroadcastManagement({
    api,
    feedback: {
      error(message) {
        messages.push(['error', message])
      },
      success(message) {
        messages.push(['success', message])
      }
    },
    saveFile(result, fallbackFilename) {
      calls.push(['save-file', result.filename, fallbackFilename])
    }
  })

  return { calls, messages, model }
}

test('message broadcast management loads and filters task rows', async () => {
  const { calls, model } = createBroadcastModel()

  assert.equal(await model.loadData(), true)
  model.scope.value = 'SCHOOL'
  model.status.value = 'FAILED'
  model.keyword.value = '3'

  assert.deepEqual(calls, [['list', { page: 1, pageSize: 20 }]])
  assert.deepEqual(model.filteredRows.value.map(row => row.id), [2])
  assert.deepEqual(model.statusOptions.value, ['COMPLETED', 'FAILED'])
  assert.equal(model.total.value, 2)
})

test('message broadcast management opens create form with active options', async () => {
  const { calls, model } = createBroadcastModel()

  assert.equal(await model.openCreate(), true)

  assert.deepEqual(calls, [
    ['schools', { page: 1, pageSize: 100 }],
    ['users', { page: 1, pageSize: 100 }]
  ])
  assert.deepEqual(model.schools.value.map(item => item.id), [3])
  assert.deepEqual(model.users.value.map(item => item.id), [5])
  assert.equal(model.createVisible.value, true)
})

test('message broadcast management validates and creates a user broadcast', async () => {
  const { calls, messages, model } = createBroadcastModel()

  assert.equal(await model.createBroadcast(), false)
  Object.assign(model.form, {
    scope: 'USER',
    recipientUserIds: ['5', 7],
    content: ' 平台通知 ',
    attachmentFileIds: ['8', 'invalid']
  })
  assert.equal(await model.createBroadcast(), true)

  assert.deepEqual(calls, [
    ['create', {
      scope: 'USER',
      content: '平台通知',
      recipientUserIds: [5, 7],
      attachmentFileIds: [8]
    }],
    ['list', { page: 1, pageSize: 20 }]
  ])
  assert.deepEqual(messages, [
    ['error', '请输入消息内容'],
    ['success', '群发任务已创建']
  ])
  assert.equal(model.createVisible.value, false)
})

test('message broadcast management loads detail and retries a task', async () => {
  const { calls, messages, model } = createBroadcastModel()

  assert.equal(await model.showDetail({ id: 2 }), true)
  assert.deepEqual(model.recipientStatusRows.value, [
    { status: 'SENT', count: 2 },
    { status: 'FAILED', count: 1 }
  ])
  assert.equal(await model.retryBroadcast({ id: 2 }), true)

  assert.deepEqual(calls, [
    ['detail', 2],
    ['retry', 2],
    ['list', { page: 1, pageSize: 20 }]
  ])
  assert.deepEqual(messages, [['success', '失败消息已重新提交']])
})

test('message broadcast management exports current filters', async () => {
  const { calls, messages, model } = createBroadcastModel()
  model.keyword.value = ' 3 '
  model.scope.value = 'SCHOOL'
  model.status.value = 'FAILED'

  assert.equal(await model.exportMessages(), true)

  assert.deepEqual(calls, [
    ['export', { keyword: '3', scope: 'SCHOOL', status: 'FAILED' }],
    ['save-file', 'messages.csv', '消息列表.csv']
  ])
  assert.deepEqual(messages, [['success', '消息数据已导出']])
})

test('message broadcast management clears stale rows after a load failure', async () => {
  const { messages, model } = createBroadcastModel({
    async fetchBroadcasts() {
      throw new Error('消息服务不可用')
    }
  })
  model.rows.value = [{ id: 9 }]
  model.total.value = 1

  assert.equal(await model.loadData(), false)
  assert.deepEqual(model.rows.value, [])
  assert.equal(model.total.value, 0)
  assert.equal(model.loadError.value, '消息服务不可用')
  assert.deepEqual(messages, [['error', '消息服务不可用']])
})
