import { adminApiClient } from '../../../api/adminApi.js'
import { downloadExportTask } from '../../../api/exportTasks.js'

export function createExportTaskApi({
  managementApi = adminApiClient,
  downloadTask = downloadExportTask
} = {}) {
  return {
    fetchTasks(params) {
      return managementApi.listExportTasks(params)
    },
    createTask(data) {
      return managementApi.createExportTask(data)
    },
    downloadTask(taskId) {
      return downloadTask(taskId)
    }
  }
}

export const exportTaskApi = createExportTaskApi()
