import { adminApiContracts } from '../adminContracts.js'
import { cleanObject, fillAdminPath, pageQuery } from '../apiUtils.js'

function exportTaskPayload(data = {}) {
  const filterJson = data.filterJson && typeof data.filterJson === 'object'
    ? JSON.stringify(data.filterJson)
    : data.filterJson
  return cleanObject({
    taskType: data.taskType,
    scopeType: data.scopeType,
    filterJson
  })
}

export function createOpenOperationsApiClient({ request, download }) {
  return {
    listOpenAuditLogs(params) {
      return request(adminApiContracts.openAuditLogs.list.path, { query: pageQuery(params) })
    },
    getOpenAuditLog(id) {
      return request(fillAdminPath(adminApiContracts.openAuditLogs.detail.path, { id }))
    },
    listOpenExportTasks(params) {
      return request(adminApiContracts.openExports.list.path, { query: pageQuery(params) })
    },
    createOpenExportTask(data) {
      return request(adminApiContracts.openExports.create.path, {
        method: 'POST',
        body: exportTaskPayload(data)
      })
    },
    getOpenExportTask(id) {
      return request(fillAdminPath(adminApiContracts.openExports.detail.path, { id }))
    },
    downloadOpenExportTask(id) {
      return download(fillAdminPath(adminApiContracts.openExports.download.path, { id }), { method: 'GET' })
    }
  }
}
