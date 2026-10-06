import { adminApiClient } from '../../../api/adminApi.js'
import {
  createExportTask,
  downloadExportTask,
  waitForExportTask
} from '../../../api/exportTasks.js'

export function createStudentManagementApi({
  managementApi = adminApiClient,
  createExport = createExportTask,
  waitForExport = waitForExportTask,
  downloadExport = downloadExportTask
} = {}) {
  return {
    fetchSchools(params) {
      return managementApi.listPublicSchools(params)
    },
    fetchClasses(params) {
      return managementApi.listClasses(params)
    },
    fetchStudents(params) {
      return managementApi.listOpenStudents(params)
    },
    fetchStudent(studentId) {
      return managementApi.getOpenStudent(studentId)
    },
    createStudent(payload) {
      return managementApi.createOpenStudent(payload)
    },
    updateStudent(studentId, payload) {
      return managementApi.updateOpenStudent(studentId, payload)
    },
    setStudentClass(studentId, classId) {
      return managementApi.setOpenStudentClass(studentId, classId)
    },
    enableStudent(studentId) {
      return managementApi.enableOpenStudent(studentId)
    },
    disableStudent(studentId) {
      return managementApi.disableOpenStudent(studentId)
    },
    fetchGuardians(studentId) {
      return managementApi.listOpenStudentGuardians(studentId)
    },
    fetchUser(userId) {
      return managementApi.getOpenUser(userId)
    },
    fetchParents(params) {
      return managementApi.listOpenUsers(params)
    },
    bindParentStudents(parentId, studentIds, relationType) {
      return managementApi.bindOpenUserStudents(parentId, studentIds, relationType)
    },
    unbindGuardian(studentId, guardianUserId) {
      return managementApi.unbindOpenStudentGuardian(studentId, guardianUserId)
    },
    fetchProfile(studentId) {
      return managementApi.getOpenStudentProfile(studentId)
    },
    fetchImportBatches(params) {
      return managementApi.listOpenStudentImportBatches(params)
    },
    fetchImportBatch(batchId) {
      return managementApi.getOpenStudentImportBatch(batchId)
    },
    importStudents(file, options) {
      return managementApi.importOpenStudents(file, options)
    },
    downloadImportTemplate() {
      return managementApi.downloadOpenStudentImportTemplate()
    },
    async exportStudents(filter) {
      const createdTask = await createExport('STUDENTS', filter)
      const completedTask = createdTask?.status === 'COMPLETED'
        ? createdTask
        : await waitForExport(createdTask?.id)
      return downloadExport(completedTask.id)
    }
  }
}

export const studentManagementApi = createStudentManagementApi()
