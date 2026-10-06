import assert from 'node:assert/strict'
import test from 'node:test'

import { useOperationsDirectory } from './useOperationsDirectory.js'

function createDirectory() {
  const calls = []
  const api = {
    async listOpenAuditLogs(options) {
      calls.push(['audit', options])
      return {
        items: [{
          id: 1,
          operatorUserId: 7,
          targetType: 'USER',
          targetId: 8
        }],
        total: 21,
        totalPages: 2
      }
    },
    async listOpenExportTasks(options) {
      calls.push(['exports', options])
      return {
        records: [{ id: options.page, status: 'COMPLETED' }],
        total: 2,
        totalPages: 2
      }
    }
  }
  const userApi = {
    async getOpenUser(id) {
      calls.push(['user', id])
      return id === 7 ? { realName: '山老师' } : { nickname: '林家长' }
    }
  }
  return {
    calls,
    directory: useOperationsDirectory({ api, userApi })
  }
}

test('operations directory loads filters and resolves audit user names', async () => {
  const { calls, directory } = createDirectory()
  directory.auditFilters.module = 'USER'
  directory.auditFilters.action = 'UPDATE'

  await directory.loadAuditLogs()

  assert.deepEqual(calls, [
    ['audit', {
      page: 1,
      pageSize: 20,
      module: 'USER',
      action: 'UPDATE',
      riskLevel: undefined
    }],
    ['user', 7],
    ['user', 8]
  ])
  assert.equal(directory.total.value, 21)
  assert.equal(directory.totalPages.value, 2)
  assert.equal(directory.operatorLabel(directory.auditLogs.value[0]), '山老师')
  assert.equal(directory.targetLabel(directory.auditLogs.value[0]), '林家长')
})

test('operations directory switches and paginates export tasks', async () => {
  const { calls, directory } = createDirectory()

  await directory.switchTab('exports')
  await directory.changePage(2)

  assert.deepEqual(calls, [
    ['exports', { page: 1, pageSize: 20 }],
    ['exports', { page: 2, pageSize: 20 }]
  ])
  assert.equal(directory.activeTab.value, 'exports')
  assert.equal(directory.page.value, 2)
  assert.equal(directory.exportTasks.value[0].id, 2)
})

test('operations directory clears stale pagination after a load failure', async () => {
  const directory = useOperationsDirectory({
    api: {
      async listOpenAuditLogs() {
        throw new Error('服务暂不可用')
      }
    },
    userApi: {}
  })
  directory.auditLogs.value = [{ id: 1 }]
  directory.total.value = 9
  directory.totalPages.value = 3

  await directory.loadAuditLogs()

  assert.deepEqual(directory.auditLogs.value, [])
  assert.equal(directory.total.value, 0)
  assert.equal(directory.totalPages.value, 0)
  assert.equal(directory.error.value, '服务暂不可用')
  assert.equal(directory.loading.value, false)
})
