export function activityPageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.moments || payload?.records || []
}

export function normalizeActivityMoment(item = {}) {
  const media = Array.isArray(item.media) ? item.media : []
  return {
    ...item,
    id: item.id || item.momentId,
    content: item.content || item.contentPreview || '',
    className: item.className || (item.visibility === 'SCHOOL' ? '全校' : '-'),
    author: item.author || item.authorName || '-',
    media,
    mediaType: media.length
      ? media.map(entry => entry.mediaType || '媒体').join('、')
      : '文字',
    publishedAt: item.publishedAt || item.createdAt || '-',
    likes: item.likes ?? item.likesCount ?? 0,
    likedByMe: Boolean(item.likedByMe),
    comments: item.comments ?? item.commentsCount ?? 0
  }
}

export function activitySchoolId(account = {}) {
  return account.schoolId || account.school?.id || account.school?.schoolId || null
}

export function normalizeActivityClass(classItem = {}) {
  const id = classItem.classId ?? classItem.id
  const name = classItem.className || classItem.name || '未命名班级'
  const gradeName = classItem.gradeName || ''
  const studentCount = Number(classItem.studentCount)
  const details = [
    gradeName,
    Number.isFinite(studentCount) ? `${studentCount} 名学生` : ''
  ].filter(Boolean)
  return {
    id,
    label: details.length ? `${name}（${details.join(' · ')}）` : name
  }
}

export function normalizeActivityStudent(student = {}, { schoolScope = false } = {}) {
  const classes = Array.isArray(student.classes) ? student.classes : []
  const markedPrimaryClass = student.primaryClass
    || classes.find(item => item.primary || item.isPrimary)
  const primaryClass = markedPrimaryClass
    || (schoolScope ? {} : classes[0])
    || {}
  const id = student.studentId ?? student.id
  const name = student.name || '未命名学生'
  const studentNo = student.studentNo || ''
  const className = primaryClass.className || student.className || ''
  const details = [studentNo, className].filter(Boolean)
  const primaryClassId = primaryClass.classId ?? primaryClass.id ?? student.classId
  const classIds = schoolScope
    ? [primaryClassId]
    : [
        primaryClassId,
        ...classes.map(item => item.classId ?? item.id)
      ]
  return {
    id,
    classIds: Array.from(new Set(classIds.filter(
      classId => classId !== null && classId !== undefined && classId !== ''
    ))),
    label: details.length ? `${name}（${details.join(' · ')}）` : name
  }
}

export function activityBoundaryText(role) {
  const labels = {
    parent: '家长只能查看当前学生可见的班级动态，并可管理自己的评论。',
    teacher: '教师可查看可见动态、发布到任教班级并管理本人发布的动态。',
    school: '校方管理员可查看本校全部幼儿动态、发布全校可见动态并管理本人发布的动态。'
  }
  return labels[role] || '按当前账号的角色和学校权限返回动态。'
}

export function activityVisibilityDetails(visibility) {
  if (visibility === 'SCHOOL') {
    return {
      title: '全校可见',
      description: '发布后，本校用户均可查看此动态'
    }
  }
  return {
    title: '班级可见',
    description: '发布后，仅所选班级用户可查看此动态'
  }
}

export function activityListTitle(role, listMode) {
  if (listMode === 'mine') return '我的发布'
  return role === 'school' ? '本校全部幼儿动态' : '可见动态'
}

export function availableActivityStudents(students = [], visibility, classId) {
  if (visibility !== 'CLASS' || !classId) return []
  return students.filter(student => student.classIds.some(
    studentClassId => String(studentClassId) === String(classId)
  ))
}

export function retainAvailableStudentIds(selectedIds = [], availableStudents = []) {
  const availableIds = new Set(availableStudents.map(item => item.id))
  return selectedIds.filter(id => availableIds.has(id))
}

export function activityFileIds(files = []) {
  return (Array.isArray(files) ? files : [])
    .map(item => Number(item.fileId))
    .filter(Number.isFinite)
}

export function formatActivityTime(value) {
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
