import { adminApiClient } from '../../../api/adminApi.js'
import {
  createExportTask,
  downloadExportTask,
  waitForExportTask
} from '../../../api/exportTasks.js'

export function createSchoolManagementApi({
  managementApi = adminApiClient,
  createExport = createExportTask,
  waitForExport = waitForExportTask,
  downloadExport = downloadExportTask
} = {}) {
  return {
    fetchSchools(params) {
      return managementApi.listSchools(params)
    },
    fetchSchool(schoolId) {
      return managementApi.getSchool(schoolId)
    },
    createSchool(payload) {
      return managementApi.createSchool(payload)
    },
    updateSchool(schoolId, payload) {
      return managementApi.updateSchool(schoolId, payload)
    },
    enableSchool(schoolId) {
      return managementApi.enableSchool(schoolId)
    },
    disableSchool(schoolId) {
      return managementApi.disableSchool(schoolId)
    },
    async exportSchools(filter) {
      const createdTask = await createExport('SCHOOLS', filter)
      const completedTask = createdTask?.status === 'COMPLETED'
        ? createdTask
        : await waitForExport(createdTask?.id)
      return downloadExport(completedTask.id)
    }
  }
}

export const schoolManagementApi = createSchoolManagementApi()
