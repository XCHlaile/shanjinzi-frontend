import { adminApiClient } from '../../../api/adminApi.js'
import {
  createExportTask,
  downloadExportTask,
  waitForExportTask
} from '../../../api/exportTasks.js'

export function createMessageBroadcastApi({
  managementApi = adminApiClient,
  createExport = createExportTask,
  waitForExport = waitForExportTask,
  downloadExport = downloadExportTask
} = {}) {
  return {
    fetchBroadcasts(params) {
      return managementApi.listMessageBroadcasts(params)
    },
    fetchSchools(params) {
      return managementApi.listPublicSchools(params)
    },
    fetchUsers(params) {
      return managementApi.listUsers(params)
    },
    createBroadcast(payload) {
      return managementApi.createMessageBroadcast(payload)
    },
    fetchBroadcast(broadcastId) {
      return managementApi.getMessageBroadcast(broadcastId)
    },
    retryBroadcast(broadcastId) {
      return managementApi.retryMessageBroadcast(broadcastId)
    },
    async exportBroadcasts(filter) {
      const createdTask = await createExport('MESSAGES', filter)
      const completedTask = createdTask?.status === 'COMPLETED'
        ? createdTask
        : await waitForExport(createdTask?.id)
      return downloadExport(completedTask.id)
    }
  }
}

export const messageBroadcastApi = createMessageBroadcastApi()
