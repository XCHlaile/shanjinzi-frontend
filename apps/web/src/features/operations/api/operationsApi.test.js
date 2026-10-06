import assert from 'node:assert/strict'
import test from 'node:test'

import { createOperationsApi } from './operationsApi.js'

function recordingTransport(calls, includeDownload = true) {
  const transport = Object.fromEntries(['get', 'post'].map(method => [
    method,
    (path, data) => {
      calls.push({ method: method.toUpperCase(), path, data })
      return Promise.resolve({ ok: true })
    }
  ]))
  if (includeDownload) {
    transport.download = path => {
      calls.push({ method: 'DOWNLOAD', path, data: undefined })
      return Promise.resolve({ ok: true })
    }
  }
  return transport
}

test('operations API owns audit and export requests', async () => {
  const calls = []
  const api = createOperationsApi(recordingTransport(calls))

  await api.listOpenAuditLogs({ page: 3, action: 'LOGIN' })
  await api.createOpenExportTask({
    taskType: 'AUDIT_LOG',
    scopeType: 'SCHOOL',
    filterJson: { schoolId: 8 },
    ignored: true
  })
  await api.downloadOpenExportTask('task/9')

  assert.deepEqual(calls, [
    {
      method: 'GET',
      path: '/api/open/audit-logs',
      data: { query: { page: 3, pageSize: 20, action: 'LOGIN' } }
    },
    {
      method: 'POST',
      path: '/api/open/export-tasks',
      data: {
        taskType: 'AUDIT_LOG',
        scopeType: 'SCHOOL',
        filterJson: '{"schoolId":8}'
      }
    },
    {
      method: 'DOWNLOAD',
      path: '/api/open/export-tasks/task%2F9/download',
      data: undefined
    }
  ])
  assert.ok(Object.isFrozen(api))
})

test('operations API falls back to GET when download is unavailable', async () => {
  const calls = []
  const api = createOperationsApi(recordingTransport(calls, false))

  await api.downloadOpenExportTask(4)

  assert.deepEqual(calls, [{
    method: 'GET',
    path: '/api/open/export-tasks/4/download',
    data: undefined
  }])
})
