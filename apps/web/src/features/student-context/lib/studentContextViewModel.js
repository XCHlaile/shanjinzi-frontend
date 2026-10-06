const relationLabels = {
  FATHER: '父亲',
  MOTHER: '母亲',
  GRANDFATHER_PATERNAL: '爷爷',
  GRANDMOTHER_PATERNAL: '奶奶',
  GRANDFATHER_MATERNAL: '外公',
  GRANDMOTHER_MATERNAL: '外婆'
}

const bindStatusLabels = {
  APPROVED: '已绑定',
  PENDING: '待审核',
  REJECTED: '未通过',
  ACTIVE: '已绑定',
  BOUND: '已绑定',
  UNBOUND: '已解绑'
}

export const STUDENT_RELATION_OPTIONS = Object.entries(relationLabels)
  .map(([value, label]) => ({ value, label }))

export const DEFAULT_STUDENT_RELATION_TYPE = 'MOTHER'

export const ACTIVE_STUDENT_BINDING_STATUSES = new Set([
  'APPROVED',
  'ACTIVE',
  'BOUND'
])

export function studentContextList(payload, keys = []) {
  if (Array.isArray(payload)) return payload
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }
  return []
}

export function studentAgeFromBirthday(value, now = new Date()) {
  if (!value) return '-'
  const birthday = new Date(value)
  if (Number.isNaN(birthday.getTime())) return '-'
  let age = now.getFullYear() - birthday.getFullYear()
  const monthDelta = now.getMonth() - birthday.getMonth()
  if (
    monthDelta < 0
    || (monthDelta === 0 && now.getDate() < birthday.getDate())
  ) {
    age -= 1
  }
  return age > 0 ? age : '-'
}

export function normalizeContextStudent(student = {}, now = new Date()) {
  const primaryClass = student.primaryClass
    || student.classes?.find(item => item.primary)
    || student.classes?.[0]
    || {}
  const birthday = student.birthday || ''
  return {
    ...student,
    id: student.id || student.studentId,
    name: student.name || student.studentName,
    schoolName: student.schoolName || '-',
    className: student.className
      || primaryClass.className
      || primaryClass.name
      || '-',
    age: student.age || studentAgeFromBirthday(birthday, now),
    studentNo: student.studentNo || student.code || '-',
    birthday,
    relationType: student.relationType || '',
    bindStatus: student.bindStatus || student.status || ''
  }
}

export function guardianBindingToStudent(binding = {}) {
  return normalizeContextStudent({
    id: binding.studentId,
    studentId: binding.studentId,
    bindingId: binding.bindingId || binding.id,
    schoolId: binding.schoolId,
    schoolName: binding.schoolName,
    name: binding.studentName,
    studentName: binding.studentName,
    relationType: binding.relationType || binding.relation,
    bindStatus: binding.bindStatus || binding.status,
    createdAt: binding.createdAt,
    approvedAt: binding.approvedAt
  })
}

export function studentRelationLabel(value) {
  return relationLabels[value] || value || '家长'
}

export function studentBindStatusLabel(value) {
  return bindStatusLabels[value] || value || '已绑定'
}

export function isActiveStudentBinding(student = {}) {
  return ACTIVE_STUDENT_BINDING_STATUSES.has(
    String(student.bindStatus || '').toUpperCase()
  )
}

export function mergeBoundStudents(studentList = [], bindingList = []) {
  const studentsById = new Map()
  for (const student of studentList.map(item => normalizeContextStudent(item))) {
    if (student.id) studentsById.set(String(student.id), student)
  }
  return bindingList
    .map(guardianBindingToStudent)
    .filter(isActiveStudentBinding)
    .map(binding => {
      const student = studentsById.get(String(binding.id)) || {}
      return {
        ...binding,
        ...student,
        bindingId: binding.bindingId,
        relationType: binding.relationType,
        bindStatus: binding.bindStatus
      }
    })
}
