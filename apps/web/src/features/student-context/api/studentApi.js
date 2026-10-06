import { validateApiContractMap } from '@shanjinzi/api-contracts'

import { normalizeGuardianRelationType } from '../../../entities/student/index.js'
import {
  cleanObject,
  fillPath,
  numericId,
  pageParams
} from '../../../shared/api/requestUtils.js'
import { httpClient } from '../../../shared/api/httpClient.js'

export const studentContracts = validateApiContractMap({
  guardians: {
    bindings: { method: 'GET', path: '/api/app/guardians/bindings' },
    bind: { method: 'POST', path: '/api/app/guardians/bind' },
    unbind: { method: 'DELETE', path: '/api/app/guardians/bindings/{bindingId}' }
  },
  students: {
    mine: { method: 'GET', path: '/api/app/students/my' },
    myClasses: { method: 'GET', path: '/api/app/students/my-classes' },
    detail: { method: 'GET', path: '/api/app/students/{studentId}' },
    currentContext: { method: 'GET', path: '/api/app/students/current-context' },
    switchCurrentContext: { method: 'POST', path: '/api/app/students/current-context' },
    profileEvents: { method: 'GET', path: '/api/app/students/{studentId}/profile-events' }
  }
}, 'studentContracts')

function bindPayload(data = {}) {
  return cleanObject({
    schoolId: numericId(data.schoolId),
    studentName: data.studentName || data.childName,
    studentNo: data.studentNo,
    birthday: data.birthday,
    bindCode: data.bindCode || data.bindingCode,
    relationType: normalizeGuardianRelationType(data.relationType || data.relation)
  })
}

export function createStudentApi(transport = httpClient) {
  return Object.freeze({
    fetchGuardianBindings(params) {
      return transport.get(studentContracts.guardians.bindings.path, { query: params })
    },
    bindGuardian(data) {
      return transport.post(studentContracts.guardians.bind.path, bindPayload(data))
    },
    unbindGuardian(bindingId) {
      return transport.delete(
        fillPath(studentContracts.guardians.unbind.path, { bindingId })
      )
    },
    fetchStudents() {
      return transport.get(studentContracts.students.mine.path)
    },
    fetchTeacherClasses() {
      return transport.get(studentContracts.students.myClasses.path)
    },
    fetchStudentDetail(studentId) {
      return transport.get(
        fillPath(studentContracts.students.detail.path, { studentId })
      )
    },
    fetchCurrentContext(params) {
      return transport.get(
        studentContracts.students.currentContext.path,
        params ? { query: params } : undefined
      )
    },
    switchCurrentStudent(studentOrId) {
      const studentId = typeof studentOrId === 'object'
        ? studentOrId.studentId
        : studentOrId
      return transport.post(
        studentContracts.students.switchCurrentContext.path,
        { studentId: numericId(studentId) }
      )
    },
    fetchGrowthRecords(studentId, params) {
      return transport.get(
        fillPath(studentContracts.students.profileEvents.path, { studentId }),
        { query: pageParams(params) }
      )
    }
  })
}

export const studentApi = createStudentApi()
