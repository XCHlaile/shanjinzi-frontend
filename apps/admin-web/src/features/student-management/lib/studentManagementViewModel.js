import { primaryStudentClass } from '../../../api/payloads/studentPayloads.js'

export const studentRelationLabels = {
  MOTHER: '母亲',
  FATHER: '父亲',
  GRANDFATHER_PATERNAL: '爷爷',
  GRANDMOTHER_PATERNAL: '奶奶',
  GRANDFATHER_MATERNAL: '外公',
  GRANDMOTHER_MATERNAL: '外婆'
}

export function queryValue(value) {
  return value === '' || value === null || value === undefined ? undefined : value
}

export function emptyStudentFilters() {
  return {
    name: '',
    studentNo: '',
    classId: null,
    enrollmentStatus: '',
    status: ''
  }
}

export function emptyStudentForm() {
  return {
    schoolId: null,
    name: '',
    gender: '',
    birthday: '',
    studentNo: '',
    classId: null,
    phoneNum: '',
    enrollmentStatus: ''
  }
}

export function emptyStudentImportOptions() {
  return {
    schoolId: null,
    autoCreateClass: false,
    remark: ''
  }
}

export function studentFilterPayload(filters) {
  return {
    name: queryValue(filters.name.trim()),
    studentNo: queryValue(filters.studentNo.trim()),
    classId: queryValue(filters.classId),
    enrollmentStatus: queryValue(filters.enrollmentStatus.trim()),
    status: queryValue(filters.status)
  }
}

export function studentCreatePayload(form) {
  return {
    schoolId: queryValue(form.schoolId),
    name: form.name.trim(),
    gender: queryValue(form.gender),
    birthday: queryValue(form.birthday),
    studentNo: queryValue(form.studentNo.trim()),
    classId: queryValue(form.classId),
    phoneNum: form.phoneNum
  }
}

export function studentFormValues(detail, fallback = {}) {
  const primaryClass = detail.classes?.find(item => item.isPrimary) || detail.classes?.[0]
  return {
    schoolId: detail.schoolId ?? null,
    name: detail.name || '',
    gender: detail.gender || '',
    birthday: detail.birthday || '',
    studentNo: detail.studentNo || '',
    classId: primaryClass?.classId ?? fallback.classId ?? null,
    phoneNum: '',
    enrollmentStatus: detail.enrollmentStatus || ''
  }
}

export function normalizeStudentListRow(student, detail, guardianCount) {
  const primaryClass = primaryStudentClass(detail || {})
  return {
    ...student,
    classId: primaryClass?.classId ?? student.classId ?? null,
    className: primaryClass?.className ?? student.className ?? '',
    phoneNum: student.phoneNumber || student.phoneNum || detail?.phoneNumber || detail?.phoneNum || '',
    guardianCount: Number(
      guardianCount
      ?? student.guardianCount
      ?? student.guardiansCount
      ?? detail?.guardianCount
      ?? detail?.guardiansCount
    ) || 0
  }
}

export function studentListNeedsDetail(student = {}) {
  return !Object.prototype.hasOwnProperty.call(student, 'studentNo')
}

export function isFullPhone(value) {
  return /^\d{11}$/.test(String(value || ''))
}

export function isInactiveClass(classItem = {}) {
  return ['DISABLED', 'INACTIVE'].includes(classItem.status)
}

export function classOptionLabel(classItem = {}) {
  const grade = classItem.gradeName ? `${classItem.gradeName} · ` : ''
  const disabled = isInactiveClass(classItem) ? '（已停用）' : ''
  return `${grade}${classItem.name || `班级 #${classItem.id}`}${disabled}`
}

export function parentOptionLabel(parent = {}) {
  const name = parent.realName || parent.nickname || `家长 #${parent.id}`
  return parent.phone ? `${name} · ${parent.phone}` : name
}

export function acceptsStudentImportFile(file) {
  const filename = file?.name?.toLowerCase() || ''
  return !file || ['.csv', '.xls', '.xlsx'].some(extension => filename.endsWith(extension))
}
