import { adminApiClient } from '../../../api/adminApi.js'
import {
  createExportTask,
  downloadExportTask,
  waitForExportTask
} from '../../../api/exportTasks.js'

export function createClassManagementApi({
  managementApi = adminApiClient,
  createExport = createExportTask,
  waitForExport = waitForExportTask,
  downloadExport = downloadExportTask
} = {}) {
  return {
    fetchSchools(params) {
      return managementApi.listSchools(params)
    },
    fetchClasses(params) {
      return managementApi.listClasses(params)
    },
    fetchClass(classId) {
      return managementApi.getClass(classId)
    },
    createClass(payload) {
      return managementApi.createClass(payload)
    },
    updateClass(classId, payload) {
      return managementApi.updateClass(classId, payload)
    },
    enableClass(classId) {
      return managementApi.enableClass(classId)
    },
    disableClass(classId) {
      return managementApi.disableClass(classId)
    },
    deleteClass(classId) {
      return managementApi.deleteClass(classId)
    },
    assignClassTeachers(classId, teacherIds) {
      return managementApi.assignClassTeachers(classId, teacherIds)
    },
    fetchTeachers(params) {
      return managementApi.listOpenUsers(params)
    },
    fetchTeacher(userId) {
      return managementApi.getOpenUser(userId)
    },
    fetchStudents(params) {
      return managementApi.listOpenStudents(params)
    },
    fetchStudent(studentId) {
      return managementApi.getOpenStudent(studentId)
    },
    setStudentClass(studentId, classId) {
      return managementApi.setOpenStudentClass(studentId, classId)
    },
    async exportClasses(filter) {
      const createdTask = await createExport('CLASSES', filter)
      const completedTask = createdTask?.status === 'COMPLETED'
        ? createdTask
        : await waitForExport(createdTask?.id)
      return downloadExport(completedTask.id)
    }
  }
}

export const classManagementApi = createClassManagementApi()
