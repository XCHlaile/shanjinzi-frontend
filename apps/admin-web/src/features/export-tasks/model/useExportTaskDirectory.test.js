import assert from 'node:assert/strict'
import test from 'node:test'

import { useExportTaskDirectory } from './useExportTaskDirectory.js'

function createDirectory(apiOverrides = {}) {
  const calls = []
  const messages = []
  const directory = useExportTaskDirectory({
    api: {
      async fetchTasks(params) {
        calls.push(['list', params])
        return {
          items: [
            { id: 1, taskType: 'USERS', status: 'COMPLETED', fileId: 11 },
            { id: 2, type: 'SCHOOLS', status: 'FAILED' }
          ]
        }
      },
      async createTask(payload) {
        calls.push(['create', payload])
        return { id: 3 }
      },
      async downloadTask(taskId) {
        calls.push(['download', taskId])
        return { blob: new Blob(['export']), filename: 'users.csv' }
      },
      ...apiOverrides
    },
    feedback: {
      error(message) {
        messages.push(['error', message])
      },
      success(message) {
        messages.push(['success', message])
      }
    },
    saveFile(result, fallbackFilename) {
      calls.push(['save', result.filename, fallbackFilename])
    }
  })

  return { calls, directory, messages }
}

test('export task directory loads and filters tasks', async () => {
  const { calls, directory } = createDirectory()

  assert.equal(await directory.loadData(), true)
  directory.type.value = 'USERS'
  directory.status.value = 'COMPLETED'

  assert.deepEqual(calls, [['list', { page: 1, pageSize: 100 }]])
  assert.deepEqual(directory.filteredRows.value.map(row => row.id), [1])
  assert.equal(directory.loading.value, false)
})

test('export task directory validates and creates the selected task type', async () => {
  const { calls, directory, messages } = createDirectory()

  assert.equal(await directory.createExport(), false)
  directory.type.value = 'AUDIT_LOGS'
  assert.equal(await directory.createExport(), true)

  assert.deepEqual(calls, [
    ['create', {
      taskType: 'AUDIT_LOGS',
      scopeType: 'PLATFORM',
      filterJson: '{}'
    }],
    ['list', { page: 1, pageSize: 100 }]
  ])
  assert.deepEqual(messages, [
    ['error', '请选择导出类型'],
    ['success', '导出任务已创建']
  ])
  assert.equal(directory.creating.value, false)
})

test('export task directory downloads through the injected browser saver', async () => {
  const { calls, directory } = createDirectory()

  assert.equal(await directory.download({ id: 8 }), true)

  assert.deepEqual(calls, [
    ['download', 8],
    ['save', 'users.csv', 'export-8.csv']
  ])
  assert.equal(directory.downloadingId.value, null)
})

test('export task directory reports loading and download failures', async () => {
  const { directory, messages } = createDirectory({
    async fetchTasks() {
      throw new Error('列表不可用')
    },
    async downloadTask() {
      throw new Error('文件不可用')
    }
  })

  assert.equal(await directory.loadData(), false)
  assert.equal(directory.loadError.value, '列表不可用')
  assert.deepEqual(directory.rows.value, [])
  assert.equal(await directory.download({ id: 9 }), false)
  assert.deepEqual(messages, [
    ['error', '列表不可用'],
    ['error', '文件不可用']
  ])
  assert.equal(directory.downloadingId.value, null)
})
