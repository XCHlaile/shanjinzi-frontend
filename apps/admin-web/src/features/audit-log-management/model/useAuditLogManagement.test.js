import assert from 'node:assert/strict'
import test from 'node:test'

import { useAuditLogManagement } from './useAuditLogManagement.js'

function createAuditModel(apiOverrides = {}) {
  const calls = []
  const messages = []
  const page = items => ({ items })
  const api = {
    async fetchAuditLogs(params) {
      calls.push(['audit', params])
      return page([
        {
          id: 1,
          operatorUserId: 2,
          operatorRoleCode: 'TEACHER',
          action: 'UPDATE',
          targetType: 'School',
          targetId: 3,
          createdAt: '2026-07-31T12:00:00'
        },
        {
          id: 2,
          action: 'MESSAGE_BROADCAST_CREATE',
          targetType: 'MessageBroadcast',
          targetId: 4,
          createdAt: '2026-07-30T12:00:00'
        }
      ])
    },
    async fetchUsers(params) {
      calls.push(['users', params])
      return page([{ id: 2, realName: '赵老师', phone: '13900000000' }])
    },
    async fetchExportTasks(params) {
      calls.push(['exports', params])
      return page([])
    },
    async fetchNews(params) {
      calls.push(['news', params])
      return page([])
    },
    async fetchNewsCategories(params) {
      calls.push(['categories', params])
      return page([])
    },
    async fetchCompetitions(params) {
      calls.push(['competitions', params])
      return page([])
    },
    async fetchSchools(params) {
      calls.push(['schools', params])
      return page([{ id: 3, name: '山前幼儿园' }])
    },
    async fetchPages(params) {
      calls.push(['pages', params])
      return page([])
    },
    async fetchMessageBroadcast(broadcastId) {
      calls.push(['broadcast', broadcastId])
      return { id: broadcastId, scope: 'PLATFORM', content: '平台通知' }
    },
    async exportAuditLogs(filter) {
      calls.push(['export-audit', filter])
      return { blob: new Blob(['audit']), filename: 'audit.csv' }
    },
    ...apiOverrides
  }
  const model = useAuditLogManagement({
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

test('audit log management loads logs and enriches their references', async () => {
  const { calls, model } = createAuditModel()

  assert.equal(await model.loadData(), true)

  assert.equal(model.rows.value.length, 2)
  assert.equal(
    model.auditOperatorLabel(model.rows.value[0]),
    '赵老师（教师）'
  )
  assert.equal(
    model.auditTargetDescription(model.rows.value[0]),
    '学校：山前幼儿园'
  )
  assert.equal(
    model.auditActionDescription(model.rows.value[1]),
    '创建消息广播：全平台消息：“平台通知”'
  )
  assert.equal(calls.some(([operation]) => operation === 'broadcast'), true)
})

test('audit log management tolerates failed optional reference sources', async () => {
  const { model } = createAuditModel({
    async fetchSchools() {
      throw new Error('学校不可用')
    },
    async fetchMessageBroadcast() {
      throw new Error('消息不可用')
    }
  })

  assert.equal(await model.loadData(), true)
  assert.equal(model.rows.value.length, 2)
  assert.equal(model.auditTargetDescription(model.rows.value[0]), '学校')
  assert.equal(model.auditActionDescription(model.rows.value[1]), '创建消息广播')
})

test('audit log management filters enriched descriptions and dates', async () => {
  const { model } = createAuditModel()
  await model.loadData()
  model.keyword.value = '山前'
  model.range.value = ['2026-07-31', '2026-07-31']

  assert.deepEqual(model.filteredRows.value.map(row => row.id), [1])
})

test('audit log management exports current filters', async () => {
  const { calls, messages, model } = createAuditModel()
  model.keyword.value = ' 更新 '
  model.range.value = ['2026-07-01', '2026-07-31']

  assert.equal(await model.exportAudit(), true)

  assert.deepEqual(calls, [
    ['export-audit', {
      keyword: '更新',
      startDate: '2026-07-01',
      endDate: '2026-07-31'
    }],
    ['save-file', 'audit.csv', '审计日志.csv']
  ])
  assert.deepEqual(messages, [['success', '审计日志已导出']])
})

test('audit log management clears stale data after a primary load failure', async () => {
  const { messages, model } = createAuditModel({
    async fetchAuditLogs() {
      throw new Error('审计服务不可用')
    }
  })
  model.rows.value = [{ id: 9 }]

  assert.equal(await model.loadData(), false)
  assert.deepEqual(model.rows.value, [])
  assert.equal(model.auditObjectDetails.value.size, 0)
  assert.equal(model.auditOperatorNames.value.size, 0)
  assert.equal(model.loadError.value, '审计服务不可用')
  assert.deepEqual(messages, [['error', '审计服务不可用']])
})
