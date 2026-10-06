import { adminApiClient } from '../../../api/adminApi.js'
import {
  createExportTask,
  downloadExportTask,
  waitForExportTask
} from '../../../api/exportTasks.js'

export function createAuditLogApi({
  managementApi = adminApiClient,
  createExport = createExportTask,
  waitForExport = waitForExportTask,
  downloadExport = downloadExportTask
} = {}) {
  return {
    fetchAuditLogs(params) {
      return managementApi.listAuditLogs(params)
    },
    fetchUsers(params) {
      return managementApi.listUsers(params)
    },
    fetchExportTasks(params) {
      return managementApi.listExportTasks(params)
    },
    fetchNews(params) {
      return managementApi.listNews(params)
    },
    fetchNewsCategories(params) {
      return managementApi.listNewsCategories(params)
    },
    fetchCompetitions(params) {
      return managementApi.listCompetitions(params)
    },
    fetchSchools(params) {
      return managementApi.listPublicSchools(params)
    },
    fetchPages(params) {
      return managementApi.listPages(params)
    },
    fetchMessageBroadcast(broadcastId) {
      return managementApi.getMessageBroadcast(broadcastId)
    },
    async exportAuditLogs(filter) {
      const createdTask = await createExport('AUDIT_LOGS', filter)
      const completedTask = createdTask?.status === 'COMPLETED'
        ? createdTask
        : await waitForExport(createdTask?.id)
      return downloadExport(completedTask.id)
    }
  }
}

export const auditLogApi = createAuditLogApi()
