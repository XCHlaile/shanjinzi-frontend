import { primaryStudentClass } from '../../../api/payloads/studentPayloads.js'
import { normalizeAdminUser } from '../../../api/payloads/userPayloads.js'
import { pageItems } from '../../../entities/student/index.js'

export function activeSchools(payload) {
  return pageItems(payload).filter(school => school.status === 'ACTIVE')
}

export function emptyClassForm(schoolId = null) {
  return {
    schoolId,
    name: '',
    gradeName: '',
    sortOrder: null
  }
}

export function classForm(row = {}) {
  return {
    schoolId: row.schoolId ?? null,
    name: row.name || '',
    gradeName: row.gradeName || '',
    sortOrder: row.sortOrder ?? null
  }
}

export function classListParams(filters = {}, pagination = {}) {
  return {
    schoolId: filters.schoolId || undefined,
    name: filters.name || undefined,
    gradeName: filters.gradeName || undefined,
    status: filters.status || undefined,
    page: pagination.page,
    pageSize: pagination.pageSize
  }
}

export function classExportFilter(filters = {}) {
  return {
    schoolId: filters.schoolId || undefined,
    name: filters.name || undefined,
    gradeName: filters.gradeName || undefined,
    status: filters.status || undefined
  }
}

export function schoolNameMap(schools = []) {
  return new Map(schools.map(school => [String(school.id), school.name]))
}

export function resolveSchoolName(names, schoolId) {
  return names.get(String(schoolId)) || (schoolId ? `学校 ${schoolId}` : '-')
}

export function mergeTeachers(...groups) {
  const map = new Map()
  for (const teacher of groups.flat()) {
    const normalized = normalizeAdminUser(teacher)
    if (normalized.id) map.set(normalized.id, normalized)
  }
  return [...map.values()]
}

export function teacherClassIds(teacher) {
  const classes = Array.isArray(teacher?.classes) ? teacher.classes : []
  return classes
    .map(classItem => classItem?.classId ?? classItem?.id ?? classItem)
    .filter(Boolean)
}

export function teacherBelongsToClass(teacher, classId) {
  return teacherClassIds(teacher)
    .some(teacherClassId => String(teacherClassId) === String(classId))
}

export function teacherLabel(teacher) {
  const name = teacher.realName
    || teacher.nickname
    || teacher.phone
    || `教师 ${teacher.id}`
  return teacher.phone && teacher.phone !== name
    ? `${name}（${teacher.phone}）`
    : name
}

export function classTeacherNames(teachers) {
  if (teachers === undefined) return '加载中…'
  if (teachers === null) return '加载失败'
  return teachers
    .map(teacher => teacher.realName || teacher.nickname || teacher.phone)
    .filter(Boolean)
    .join('、') || '-'
}

export async function collectAllPages(loadPage) {
  const firstPage = await loadPage(1)
  const items = [...pageItems(firstPage)]
  const pageSize = Number(firstPage?.pageSize) || 100
  const totalPages = Number(firstPage?.totalPages)
    || Math.ceil((Number(firstPage?.total) || items.length) / pageSize)
  for (let page = 2; page <= totalPages; page += 1) {
    items.push(...pageItems(await loadPage(page)))
  }
  return items
}

export function studentWithClassDetail(student, detail) {
  const primaryClass = primaryStudentClass(detail)
  return {
    ...student,
    ...detail,
    classId: primaryClass?.classId ?? student.classId ?? null,
    className: primaryClass?.className ?? student.className ?? ''
  }
}

export function studentClassIds(student) {
  const ids = Array.isArray(student?.classes)
    ? student.classes.map(classItem => (
      classItem?.classId ?? classItem?.id ?? classItem
    ))
    : []
  if (student?.classId !== undefined && student?.classId !== null) {
    ids.push(student.classId)
  }
  return ids.filter(classId => (
    classId !== undefined && classId !== null && classId !== ''
  ))
}

export function classStudents(students, classId) {
  return students.filter(student => (
    String(student.classId || '') === String(classId || '')
  ))
}

export function availableStudents(students, classId) {
  return students.filter(student => (
    student.status === 'ACTIVE'
    && String(student.classId || '') !== String(classId || '')
  ))
}

export function transferClassOptions(classes, classId) {
  return classes.filter(classOption => String(classOption.id) !== String(classId))
}

export function studentOptionLabel(student) {
  const number = student.studentNo ? `（${student.studentNo}）` : ''
  const currentClass = student.className
    || (student.classId ? `班级 ${student.classId}` : '未分班')
  return `${student.name || `学生 ${student.id}`}${number} · 当前：${currentClass}`
}

export function classOptionLabel(classOption) {
  return classOption.gradeName
    ? `${classOption.name}（${classOption.gradeName}）`
    : classOption.name
}

export function isClassDialogCancel(error) {
  return error === 'cancel' || error === 'close'
}
