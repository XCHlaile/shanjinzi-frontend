import { primaryStudentClass } from '../../../entities/student/index.js'

export function createStudentForm(detail = {}) {
  const primaryClass = primaryStudentClass(detail || {})
  return {
    name: detail.name || '',
    studentNo: detail.studentNo || '',
    gender: detail.gender || '',
    birthday: detail.birthday || '',
    classId: primaryClass?.classId || '',
    phoneNum: '',
    enrollmentStatus: detail.enrollmentStatus || ''
  }
}

export function createUserForm(detail = {}) {
  return {
    realName: detail.realName || '',
    phone: detail.phone || '',
    nickname: detail.nickname || '',
    gender: detail.gender || '',
    classIds: (Array.isArray(detail.classes) ? detail.classes : [])
      .map(item => item.classId || item.id)
      .filter(Boolean)
  }
}

export function createGuardianBindingForm() {
  return { parentId: null, relationType: '' }
}

export function createStudentImportForm() {
  return { autoCreateClass: false, remark: '' }
}

export function normalizeStudentRosterRow(
  student = {},
  detail
) {
  const primaryClass = primaryStudentClass(detail || {})
  return {
    ...student,
    studentNo: detail?.studentNo || student.studentNo || '',
    classId: primaryClass?.classId ?? student.classId ?? null,
    className: primaryClass?.className ?? student.className ?? '',
    guardianCount: Number(
      student.guardianCount
      ?? student.guardiansCount
      ?? detail?.guardianCount
      ?? detail?.guardiansCount
    ) || 0
  }
}

export function studentListNeedsDetail(student = {}) {
  return !Object.prototype.hasOwnProperty.call(student, 'studentNo')
}

export function studentSearchFields(keyword = '') {
  return /\d/.test(String(keyword)) ? ['studentNo', 'name'] : ['name', 'studentNo']
}

export function sortSchoolClassOptions(classes = [], schoolId) {
  return classes
    .filter(classItem => String(classItem.schoolId) === String(schoolId))
    .sort((left, right) => (
      (Number(left.sortOrder) || 0) - (Number(right.sortOrder) || 0)
    ))
}

export function isFullPhone(value) {
  return /^\d{11}$/.test(String(value || ''))
}

export function parentOptionLabel(parent = {}) {
  const name = parent.realName || parent.nickname || `家长 #${parent.id}`
  const phone = parent.phone || parent.phoneNum
  return phone ? `${name} · ${phone}` : name
}

export function parentSearchQuery(keyword = '') {
  const normalizedKeyword = String(keyword).trim()
  if (!normalizedKeyword) return {}
  return /^\d+$/.test(normalizedKeyword)
    ? { phone: normalizedKeyword }
    : { realName: normalizedKeyword }
}
