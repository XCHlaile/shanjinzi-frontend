import { validateApiContractMap } from '@shanjinzi/api-contracts'

import {
  cleanObject,
  fillPath
} from '../../../shared/api/requestUtils.js'
import { httpClient } from '../../../shared/api/httpClient.js'

export const operationsContracts = validateApiContractMap({
  openAuditLogs: {
    list: { method: 'GET', path: '/api/open/audit-logs' },
    detail: { method: 'GET', path: '/api/open/audit-logs/{id}' }
  },
  openExports: {
    list: { method: 'GET', path: '/api/open/export-tasks' },
    create: { method: 'POST', path: '/api/open/export-tasks' },
    detail: { method: 'GET', path: '/api/open/export-tasks/{id}' },
    download: { method: 'GET', path: '/api/open/export-tasks/{id}/download' }
  }
}, 'operationsContracts')

function exportTaskPayload(data = {}) {
  return cleanObject({
    taskType: data.taskType,
    scopeType: data.scopeType,
    filterJson: data.filterJson && typeof data.filterJson === 'object'
      ? JSON.stringify(data.filterJson)
      : data.filterJson
  })
}

export function createOperationsApi(transport = httpClient) {
  return Object.freeze({
    listOpenAuditLogs(params) {
      return transport.get(
        operationsContracts.openAuditLogs.list.path,
        { query: { page: 1, pageSize: 20, ...params } }
      )
    },
    getOpenAuditLog(id) {
      return transport.get(
        fillPath(operationsContracts.openAuditLogs.detail.path, { id })
      )
    },
    listOpenExportTasks(params) {
      return transport.get(
        operationsContracts.openExports.list.path,
        { query: { page: 1, pageSize: 20, ...params } }
      )
    },
    createOpenExportTask(data) {
      return transport.post(
        operationsContracts.openExports.create.path,
        exportTaskPayload(data)
      )
    },
    getOpenExportTask(id) {
      return transport.get(
        fillPath(operationsContracts.openExports.detail.path, { id })
      )
    },
    downloadOpenExportTask(id) {
      const path = fillPath(operationsContracts.openExports.download.path, { id })
      return typeof transport.download === 'function'
        ? transport.download(path)
        : transport.get(path)
    }
  })
}

export const operationsApi = createOperationsApi()
