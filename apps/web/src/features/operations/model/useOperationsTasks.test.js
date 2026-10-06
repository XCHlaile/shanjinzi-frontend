import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useOperationsTasks } from './useOperationsTasks.js'

function createTasks() {
  const calls = []
  const notices = []
  const activeTab = ref('audit')
  const api = {
    async getOpenAuditLog(id) {
      calls.push(['audit-detail', id])
      return {
        id,
        module: 'USER',
        action: 'UPDATE',
        targetType: 'USER',
        targetId: 8,
        operatorUserId: 7,
        operatorRoleCode: 'TEACHER',
        result: 'SUCCESS',
        riskLevel: 'LOW'
      }
    },
    async getOpenExportTask(id) {
      calls.push(['export-detail', id])
      return { id, taskType: 'STUDENTS', scopeType: 'SCHOOL', status: 'COMPLETED' }
    },
    async createOpenExportTask(payload) {
      calls.push(['create', payload])
      return { id: 3 }
    },
    async downloadOpenExportTask(id) {
      calls.push(['download', id])
      return { blob: new Blob(['export']), filename: 'students.xlsx' }
    }
  }
  const tasks = useOperationsTasks({
    activeTab,
    ensureAuditUserNames: async logs => calls.push(['users', logs.map(log => log.id)]),
    targetLabel: () => '林家长',
    operatorLabel: () => '山老师',
    loadExportTasks: async () => calls.push(['reload']),
    api,
    notify: {
      success: message => notices.push(['success', message]),
      error: message => notices.push(['error', message])
    },
    saveFile: (result, id) => calls.push(['save', id, result.filename])
  })
  return { activeTab, calls, notices, tasks }
}

test('operations tasks loads audit and export details', async () => {
  const { activeTab, calls, tasks } = createTasks()

  await tasks.openAuditDetail({ id: 11 })
  assert.deepEqual(calls, [
    ['audit-detail', 11],
    ['users', [11]]
  ])
  assert.equal(tasks.detailDialog.value, true)
  assert.equal(tasks.detailLoading.value, false)
  assert.deepEqual(tasks.detailEntries.value.slice(1, 5), [
    ['模块', '用户管理'],
    ['操作', '修改资料'],
    ['目标', '林家长'],
    ['操作者', '山老师']
  ])

  activeTab.value = 'exports'
  await tasks.openExportDetail({ id: 12 })
  assert.equal(tasks.detailEntries.value[1][1], '学生数据')
  assert.equal(tasks.detailEntries.value[3][1], '已完成')
})

test('operations tasks creates exports with parsed filter JSON', async () => {
  const { calls, notices, tasks } = createTasks()
  tasks.exportForm.taskType = 'AUDIT_LOGS'
  tasks.exportForm.filterJson = '{"status":"SUCCESS"}'

  await tasks.createExportTask()

  assert.deepEqual(calls, [
    ['create', {
      taskType: 'AUDIT_LOGS',
      scopeType: 'SCHOOL',
      filterJson: { status: 'SUCCESS' }
    }],
    ['reload']
  ])
  assert.deepEqual(notices, [['success', '导出任务已创建']])
  assert.equal(tasks.creatingTask.value, false)
})

test('operations tasks rejects invalid filters and saves downloaded files', async () => {
  const { calls, notices, tasks } = createTasks()
  tasks.exportForm.filterJson = '{invalid}'

  await tasks.createExportTask()
  await tasks.downloadTask({ id: 9 })

  assert.deepEqual(calls, [
    ['download', 9],
    ['save', 9, 'students.xlsx']
  ])
  assert.deepEqual(notices, [
    ['error', '过滤条件不是合法 JSON'],
    ['success', '文件下载已开始']
  ])
  assert.equal(tasks.downloadingId.value, null)
})
