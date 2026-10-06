import { adminApiContracts } from '../adminContracts.js'
import { cleanObject, fillAdminPath, numericId, pageQuery } from '../apiUtils.js'

function studentCreatePayload(data = {}) {
  return cleanObject({
    schoolId: numericId(data.schoolId),
    name: data.name,
    gender: data.gender,
    birthday: data.birthday,
    studentNo: data.studentNo,
    classId: numericId(data.classId),
    phoneNumber: data.phoneNumber ?? data.phoneNum
  })
}

export function buildStudentUpdatePayload(data = {}, original = null) {
  const payload = cleanObject({
    name: data.name,
    gender: data.gender,
    birthday: data.birthday,
    studentNo: data.studentNo,
    enrollmentStatus: data.enrollmentStatus
  })

  if (!original) return payload
  const originalPayload = buildStudentUpdatePayload(original)
  return Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => originalPayload[key] !== value)
  )
}

function openStudentImportQuery(params = {}) {
  return cleanObject({
    schoolId: numericId(params.schoolId),
    autoCreateClass: params.autoCreateClass ?? false,
    remark: params.remark
  })
}

export function normalizeStudentImportFile(file) {
  if (!(file instanceof Blob)) throw new TypeError('学生导入文件不能为空')

  const filename = file.name || 'student-import.xlsx'
  const extension = filename.toLowerCase().match(/\.[^.]+$/)?.[0] || ''
  const contentType = {
    '.csv': 'text/csv',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }[extension] || file.type
  const blob = contentType && file.type !== contentType
    ? file.slice(0, file.size, contentType)
    : file

  return { blob, filename }
}

export function createOpenStudentApiClient({ request, download }) {
  return {
    listOpenStudents(params) {
      return request(adminApiContracts.students.list.path, { query: pageQuery(params) })
    },
    createOpenStudent(data) {
      return request(adminApiContracts.students.create.path, { method: 'POST', body: studentCreatePayload(data) })
    },
    getOpenStudent(id) {
      return request(fillAdminPath(adminApiContracts.students.detail.path, { id }))
    },
    updateOpenStudent(id, data, original = null) {
      return request(fillAdminPath(adminApiContracts.students.update.path, { id }), {
        method: 'PATCH',
        body: buildStudentUpdatePayload(data, original)
      })
    },
    setOpenStudentClass(id, classId) {
      return request(fillAdminPath(adminApiContracts.students.setClass.path, { id }), {
        method: 'PATCH',
        body: { classId: numericId(classId) }
      })
    },
    enableOpenStudent(id) {
      return request(fillAdminPath(adminApiContracts.students.enable.path, { id }), { method: 'PATCH' })
    },
    disableOpenStudent(id) {
      return request(fillAdminPath(adminApiContracts.students.disable.path, { id }), { method: 'PATCH' })
    },
    listOpenStudentGuardians(id) {
      return request(fillAdminPath(adminApiContracts.students.guardians.path, { id }))
    },
    unbindOpenStudentGuardian(id, guardianUserId) {
      return request(fillAdminPath(adminApiContracts.students.unbindGuardian.path, { id, guardianUserId }), {
        method: 'POST'
      })
    },
    getOpenStudentProfile(id) {
      return request(fillAdminPath(adminApiContracts.students.profile.path, { id }))
    },
    listOpenStudentImportBatches(params) {
      return request(adminApiContracts.students.importBatches.path, { query: pageQuery(params) })
    },
    getOpenStudentImportBatch(id) {
      return request(fillAdminPath(adminApiContracts.students.importBatchDetail.path, { id }))
    },
    importOpenStudents(file, params = {}) {
      const formData = new FormData()
      const normalizedFile = normalizeStudentImportFile(file)
      formData.append('file', normalizedFile.blob, normalizedFile.filename)
      return request(adminApiContracts.students.importStudents.path, {
        method: 'POST',
        query: openStudentImportQuery(params),
        body: formData
      })
    },
    downloadOpenStudentImportTemplate() {
      return download(adminApiContracts.students.importTemplate.path, { method: 'GET' })
    }
  }
}
