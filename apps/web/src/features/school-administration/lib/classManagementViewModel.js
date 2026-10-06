import { primaryStudentClass } from '../../../entities/student/index.js'

export function classPageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function schoolIdOf(account = {}) {
  return account.schoolId || account.school?.id || account.school?.schoolId || null
}

export function schoolNameOf(account = {}) {
  return account.schoolName || account.school?.name || account.organizationName || ''
}

export function teacherDisplayName(teacher = {}) {
  return teacher.realName
    || teacher.nickname
    || teacher.name
    || teacher.phone
    || `教师 #${teacher.id}`
}

export function teacherClassIds(teacher = {}) {
  const classes = Array.isArray(teacher.classes) ? teacher.classes : []
  return classes
    .map(item => item?.classId ?? item?.id ?? item)
    .filter(Boolean)
}

export function teacherBelongsToClass(teacher, classId) {
  return teacherClassIds(teacher).some(id => String(id) === String(classId))
}

export function teacherMatchesKeyword(teacher = {}, keyword = '') {
  const normalizedKeyword = String(keyword).trim().toLowerCase()
  if (!normalizedKeyword) return true
  return `${teacherDisplayName(teacher)} ${teacher.phone || ''}`
    .toLowerCase()
    .includes(normalizedKeyword)
}

export function studentDisplayName(student = {}) {
  return student.name || student.studentName || `学生 #${student.id}`
}

export function studentIdentity(student = {}) {
  return student.studentNo ? `学号：${student.studentNo}` : ''
}

export function studentClassId(student = {}) {
  return primaryStudentClass(student)?.classId ?? student.classId ?? null
}

export function studentMatchesKeyword(student = {}, keyword = '') {
  const normalizedKeyword = String(keyword).trim().toLowerCase()
  if (!normalizedKeyword) return true
  return `${studentDisplayName(student)} ${student.studentNo || ''} ${student.id || ''}`
    .toLowerCase()
    .includes(normalizedKeyword)
}

export function studentOptionLabel(student = {}, classes = []) {
  const currentClassId = studentClassId(student)
  const currentClass = classes.find(item => String(item.id) === String(currentClassId))
  const currentClassName = currentClass?.name
    || (currentClassId ? `班级 #${currentClassId}` : '未分班')
  return [
    studentDisplayName(student),
    studentIdentity(student),
    currentClassName
  ].filter(Boolean).join(' · ')
}

export function schoolClassStatusLabel(status) {
  return ({
    ACTIVE: '启用',
    ENABLED: '启用',
    DISABLED: '停用',
    INACTIVE: '停用'
  })[status] || status || '-'
}

export function formatSchoolClassTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export async function collectAllPages(loadPage) {
  const first = await loadPage(1)
  const items = [...classPageItems(first)]
  const size = Number(first?.pageSize) || 100
  const pages = Number(first?.totalPages)
    || Math.ceil((Number(first?.total) || items.length) / size)
  for (let nextPage = 2; nextPage <= pages; nextPage += 1) {
    items.push(...classPageItems(await loadPage(nextPage)))
  }
  return items
}

export function sameIdSet(left = [], right = []) {
  const first = [...new Set(left.map(String))].sort()
  const second = [...new Set(right.map(String))].sort()
  return (
    first.length === second.length
    && first.every((id, index) => id === second[index])
  )
}
