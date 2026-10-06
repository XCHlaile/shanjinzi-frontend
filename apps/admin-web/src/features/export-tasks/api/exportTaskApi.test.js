import assert from 'node:assert/strict'
import test from 'node:test'

import { createExportTaskApi } from './exportTaskApi.js'

test('export task api adapts management and download operations', async () => {
  const calls = []
  const api = createExportTaskApi({
    managementApi: {
      async listExportTasks(params) {
        calls.push(['list', params])
        return { items: [{ id: 1 }] }
      },
      async createExportTask(payload) {
        calls.push(['create', payload])
        return { id: 2 }
      }
    },
    async downloadTask(taskId) {
      calls.push(['download', taskId])
      return { blob: new Blob(['export']) }
    }
  })

  assert.deepEqual(await api.fetchTasks({ page: 1 }), { items: [{ id: 1 }] })
  assert.deepEqual(await api.createTask({ taskType: 'USERS' }), { id: 2 })
  assert.ok((await api.downloadTask(2)).blob instanceof Blob)
  assert.deepEqual(calls, [
    ['list', { page: 1 }],
    ['create', { taskType: 'USERS' }],
    ['download', 2]
  ])
})
