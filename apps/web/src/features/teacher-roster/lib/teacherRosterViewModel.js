export function teacherRosterItems(payload, fallbackKey) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.[fallbackKey] || []
}

export function teacherRosterEnrollmentLabel(status) {
  const labels = {
    ACTIVE: '在读',
    ENROLLED: '在读',
    GRADUATED: '已毕业',
    TRANSFERRED: '已转出',
    INACTIVE: '停用'
  }
  return labels[status] || status || '-'
}

export function normalizeTeacherRosterStudent(student = {}) {
  const primaryClass = student.primaryClass
    || student.classes?.find(item => item.primary)
    || student.classes?.[0]
    || {}
  return {
    id: student.id || student.studentId,
    name: student.name || '-',
    code: student.studentNo || '-',
    schoolName: student.schoolName || '-',
    className: student.className || primaryClass.className || '未分班',
    classIds: Array.from(new Set([primaryClass, ...(student.classes || [])]
      .map(item => item?.classId ?? item?.id)
      .filter(id => id !== null && id !== undefined && id !== ''))),
    guardianCount: student.guardianCount ?? '-',
    status: teacherRosterEnrollmentLabel(student.enrollmentStatus)
  }
}

export function normalizeTeacherRosterClass(classItem = {}) {
  return {
    id: classItem.classId ?? classItem.id,
    name: classItem.className || classItem.name || '未命名班级',
    gradeName: classItem.gradeName || '未设置年级',
    isHeadTeacher: Boolean(classItem.isHeadTeacher),
    studentCount: Number(classItem.studentCount || 0)
  }
}

export function studentBelongsToTeacherClasses(student = {}, classIds = []) {
  const allowedClassIds = new Set(classIds.map(String))
  if (!allowedClassIds.size) return false
  return (student.classIds || []).some(classId => allowedClassIds.has(String(classId)))
}

export function matchesTeacherRosterStudent(student, {
  activeClassId = '',
  keyword = ''
} = {}) {
  const query = keyword.trim().toLowerCase()
  const matchesClass = activeClassId === '' || student.classIds.includes(activeClassId)
  const matchesKeyword = !query || [
    student.name,
    student.code,
    student.schoolName,
    student.className
  ].some(value => String(value || '').toLowerCase().includes(query))
  return matchesClass && matchesKeyword
}
