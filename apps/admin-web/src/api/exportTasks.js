import { request, requestBlob } from './client.js'

function compactFilter(filter = {}) {
  return Object.fromEntries(Object.entries(filter).filter(([, value]) => {
    if (value === undefined || value === null || value === '') return false
    return !Array.isArray(value) || value.length > 0
  }))
}

export function createExportTask(taskType, filter = {}, scopeType = 'PLATFORM') {
  return request('/api/admin/export-tasks', {
    method: 'POST',
    body: {
      taskType,
      scopeType,
      filterJson: JSON.stringify(compactFilter(filter))
    }
  })
}

export async function waitForExportTask(taskId, {
  requestImpl = request,
  delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
  intervalMs = 300,
  maxAttempts = 50
} = {}) {
  if (!taskId) throw new Error('导出任务 ID 缺失')

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const task = await requestImpl(`/api/admin/export-tasks/${encodeURIComponent(taskId)}`)
    if (task?.status === 'COMPLETED') return task
    if (task?.status === 'FAILED') throw new Error(task.errorMessage || '导出任务执行失败')
    if (attempt < maxAttempts - 1) await delay(intervalMs)
  }

  throw new Error('导出任务仍在处理中，请稍后重试')
}

export function downloadExportTask(taskId, { downloadImpl = requestBlob } = {}) {
  if (!taskId) throw new Error('导出任务 ID 缺失')
  return downloadImpl(`/api/admin/export-tasks/${encodeURIComponent(taskId)}/download`, { method: 'GET' })
}
