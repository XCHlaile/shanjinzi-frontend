import assert from 'node:assert/strict'
import test from 'node:test'

import { downloadExportTask, waitForExportTask } from './exportTasks.js'

test('waits for a pending export task to complete', async () => {
  const statuses = ['PENDING', 'RUNNING', 'COMPLETED']
  const requestedPaths = []
  let delayCount = 0

  const task = await waitForExportTask(12, {
    requestImpl(path) {
      requestedPaths.push(path)
      return Promise.resolve({ id: 12, status: statuses.shift() })
    },
    delay() {
      delayCount += 1
      return Promise.resolve()
    },
    intervalMs: 0,
    maxAttempts: 3
  })

  assert.equal(task.status, 'COMPLETED')
  assert.deepEqual(requestedPaths, [
    '/api/admin/export-tasks/12',
    '/api/admin/export-tasks/12',
    '/api/admin/export-tasks/12'
  ])
  assert.equal(delayCount, 2)
})

test('surfaces the export task failure message', async () => {
  await assert.rejects(
    waitForExportTask(8, {
      requestImpl: async () => ({ status: 'FAILED', errorMessage: '学校导出失败' }),
      maxAttempts: 1
    }),
    /学校导出失败/
  )
})

test('downloads an export through the authenticated download endpoint', async () => {
  const calls = []
  const result = await downloadExportTask('9/10', {
    downloadImpl(path, options) {
      calls.push({ path, options })
      return Promise.resolve({ blob: new Blob(['csv']), filename: 'schools.csv' })
    }
  })

  assert.equal(result.filename, 'schools.csv')
  assert.deepEqual(calls, [{
    path: '/api/admin/export-tasks/9%2F10/download',
    options: { method: 'GET' }
  }])
})
