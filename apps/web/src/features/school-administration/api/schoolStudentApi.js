import {
  cleanObject,
  fillPath,
  numericId
} from '../../../shared/api/requestUtils.js'

function studentCreatePayload(data = {}) {
  return cleanObject({
    schoolId: data.schoolId === undefined ? undefined : numericId(data.schoolId),
    name: data.name,
    gender: data.gender,
    birthday: data.birthday,
    studentNo: data.studentNo,
    classId: data.classId === undefined ? undefined : numericId(data.classId),
    phoneNumber: data.phoneNumber ?? data.phoneNum
  })
}

function studentUpdatePayload(data = {}) {
  return cleanObject({
    name: data.name,
    gender: data.gender,
    birthday: data.birthday,
    studentNo: data.studentNo,
    enrollmentStatus: data.enrollmentStatus
  })
}

function importOptions(data = {}) {
  return cleanObject({
    schoolId: data.schoolId === undefined ? undefined : numericId(data.schoolId),
    autoCreateClass: data.autoCreateClass ?? false,
    remark: data.remark
  })
}

function importForm(file) {
  if (typeof FormData === 'undefined') throw new Error('FormData is not available')
  const formData = new FormData()
  formData.append('file', file)
  return formData
}

export function createSchoolStudentApi(transport, contracts) {
  return {
    listOpenStudents(params) {
      return transport.get(contracts.publicStudents.list.path, {
        query: { page: 1, pageSize: 20, ...params }
      })
    },
    createOpenStudent(data) {
      return transport.post(
        contracts.publicStudents.create.path,
        studentCreatePayload(data)
      )
    },
    getOpenStudent(id) {
      return transport.get(fillPath(contracts.publicStudents.detail.path, { id }))
    },
    updateOpenStudent(id, data) {
      return transport.patch(
        fillPath(contracts.publicStudents.update.path, { id }),
        studentUpdatePayload(data)
      )
    },
    setOpenStudentClass(id, classId) {
      return transport.patch(
        fillPath(contracts.publicStudents.setClass.path, { id }),
        { classId: numericId(classId) }
      )
    },
    removeOpenStudentClass(id) {
      return transport.delete(
        fillPath(contracts.publicStudents.removeClass.path, { id })
      )
    },
    enableOpenStudent(id) {
      return transport.patch(fillPath(contracts.publicStudents.enable.path, { id }))
    },
    disableOpenStudent(id) {
      return transport.patch(fillPath(contracts.publicStudents.disable.path, { id }))
    },
    listOpenStudentGuardians(id) {
      return transport.get(fillPath(contracts.publicStudents.guardians.path, { id }))
    },
    unbindOpenStudentGuardian(id, guardianUserId) {
      return transport.post(
        fillPath(contracts.publicStudents.unbindGuardian.path, { id, guardianUserId })
      )
    },
    getOpenStudentProfile(id) {
      return transport.get(fillPath(contracts.publicStudents.profile.path, { id }))
    },
    downloadOpenStudentImportTemplate() {
      const path = contracts.publicStudents.importTemplate.path
      return typeof transport.download === 'function'
        ? transport.download(path)
        : transport.get(path)
    },
    importOpenStudents(fileOrData, options = {}) {
      const data = fileOrData && typeof fileOrData === 'object' && 'file' in fileOrData
        ? fileOrData
        : { ...options, file: fileOrData }
      return transport.post(
        contracts.publicStudents.import.path,
        importForm(data.file),
        { query: importOptions(data) }
      )
    },
    listOpenStudentImportBatches(params) {
      return transport.get(contracts.publicStudents.importBatches.path, {
        query: { page: 1, pageSize: 20, ...params }
      })
    },
    getOpenStudentImportBatch(id) {
      return transport.get(
        fillPath(contracts.publicStudents.importBatchDetail.path, { id })
      )
    }
  }
}
