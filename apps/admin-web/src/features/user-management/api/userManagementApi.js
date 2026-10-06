import { adminApiClient } from '../../../api/adminApi.js'
import {
  createExportTask,
  downloadExportTask,
  waitForExportTask
} from '../../../api/exportTasks.js'

export function createUserManagementApi({
  managementApi = adminApiClient,
  createExport = createExportTask,
  waitForExport = waitForExportTask,
  downloadExport = downloadExportTask
} = {}) {
  return {
    fetchUsers(params) {
      return managementApi.listUsers(params)
    },
    fetchSchools(params) {
      return managementApi.listPublicSchools(params)
    },
    fetchUser(userId) {
      return managementApi.getUser(userId)
    },
    createUser(payload) {
      return managementApi.createUser(payload)
    },
    updateUser(userId, payload) {
      return managementApi.updateUser(userId, payload)
    },
    updateUserRole(userId, payload) {
      return managementApi.updateUserRole(userId, payload)
    },
    updateUserSchool(userId, payload) {
      return managementApi.updateUserSchool(userId, payload)
    },
    enableUser(userId) {
      return managementApi.enableUser(userId)
    },
    disableUser(userId) {
      return managementApi.disableUser(userId)
    },
    resetUserPassword(userId) {
      return managementApi.resetUserPassword(userId)
    },
    deleteUser(userId) {
      return managementApi.deleteUser(userId)
    },
    async exportUsers(filter) {
      const createdTask = await createExport('USERS', filter)
      const completedTask = createdTask?.status === 'COMPLETED'
        ? createdTask
        : await waitForExport(createdTask?.id)
      return downloadExport(completedTask.id)
    }
  }
}

export const userManagementApi = createUserManagementApi()
