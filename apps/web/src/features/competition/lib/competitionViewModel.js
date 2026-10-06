export function competitionPageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items
    || payload?.records
    || payload?.competitions
    || payload?.registrations
    || []
}

export function competitionHeroDescription(role) {
  if (role === 'teacher') return '查看赛事及报名人数，不展示报名人员身份信息。'
  if (role === 'school') return '查看赛事报名人数，并按需查看报名学生姓名。'
  return '查看当前学生可报名的赛事并提交报名。'
}

export function competitionScopeLabel(value) {
  const labels = {
    PLATFORM: '平台赛事',
    SCHOOL: '校级赛事',
    CLASS: '班级赛事'
  }
  return labels[String(value || '').toUpperCase()] || value || '赛事'
}

export function competitionStatusLabel(value, registrationOpen) {
  const labels = {
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    OFFLINE: '已下线',
    DELETED: '已删除'
  }
  return labels[String(value || '').toUpperCase()]
    || value
    || (registrationOpen ? '报名中' : '未开放')
}

export function normalizeCompetition(item = {}) {
  const limit = Number(item.maxParticipants ?? item.limit ?? 0)
  const registered = Number(item.registeredCount ?? item.registered ?? 0)
  const registrationStatus = item.registrationStatus || ''
  return {
    ...item,
    id: item.id || item.competitionId,
    scope: competitionScopeLabel(item.scope || item.scopeType),
    status: competitionStatusLabel(item.status, item.registrationOpen),
    name: item.name || item.title || '未命名赛事',
    summary: item.summary || '',
    deadline: item.deadline || item.registrationEndAt || '-',
    registrationStatus,
    registrationOpen: item.registrationOpen !== false,
    registered: Number.isFinite(registered) ? registered : 0,
    limit: Number.isFinite(limit) ? limit : 0,
    registrationStats: null,
    countError: ''
  }
}

export function normalizeRegistrationStats(payload = {}) {
  return {
    total: Number(payload.total ?? 0),
    submitted: Number(payload.submitted ?? 0),
    approved: Number(payload.approved ?? 0),
    rejected: Number(payload.rejected ?? 0),
    canceled: Number(payload.canceled ?? 0)
  }
}

export function competitionProgressWidth(item = {}) {
  if (!item.limit) return '0%'
  return `${Math.min(100, item.registered / item.limit * 100)}%`
}

export function formatCompetitionDateTime(value) {
  return value ? String(value).replace('T', ' ') : '-'
}

export function competitionRegistrationStatusLabel(status) {
  const labels = {
    SUBMITTED: '已提交',
    APPROVED: '已通过',
    REJECTED: '未通过',
    CANCELED: '已取消'
  }
  return labels[status] || status || '已报名'
}

export function competitionRegistrationStatusColor(status) {
  const colors = {
    SUBMITTED: '#2563eb',
    APPROVED: '#16a34a',
    REJECTED: '#ef4444',
    CANCELED: '#64748b'
  }
  return colors[status] || '#2563eb'
}

export function normalizeMyCompetitionRegistration(item = {}) {
  return {
    registrationId: item.registrationId || item.id,
    competitionId: item.competitionId || '-',
    competitionTitle: item.competitionTitle
      || item.compName
      || item.title
      || '未命名赛事',
    studentId: item.studentId || '-',
    studentName: item.studentName || '-',
    className: item.className || item.studentClass || '-',
    status: item.status || '',
    competitionStartAt: item.competitionStartAt || '',
    registrationEndAt: item.registrationEndAt || '',
    createdAt: item.createdAt || ''
  }
}

export function hasCompetitionRegistration(item = {}) {
  return ['SUBMITTED', 'APPROVED'].includes(
    String(item.registrationStatus || '').toUpperCase()
  )
}

export function canSignupCompetition(item = {}, currentStudent) {
  return Boolean(
    currentStudent
    && item.registrationOpen
    && !hasCompetitionRegistration(item)
  )
}

export function competitionSignupButtonText(item = {}, currentStudent, studentName = '') {
  if (!currentStudent) return '请先选择学生'
  if (hasCompetitionRegistration(item)) return '当前学生已报名'
  if (!item.registrationOpen) return '报名未开放'
  return `为 ${studentName} 报名`
}

export function competitionTeacherId(teacher = {}) {
  return teacher.id || teacher.userId
}

export function competitionTeacherOptionLabel(teacher = {}) {
  const name = teacher.realName
    || teacher.nickname
    || teacher.name
    || teacher.phone
    || `教师 #${competitionTeacherId(teacher)}`
  return teacher.phone && teacher.phone !== name
    ? `${name}（${teacher.phone}）`
    : name
}

export function isAvailableCompetitionTeacher(teacher = {}) {
  const inactiveStatuses = ['DISABLED', 'INACTIVE']
  return Boolean(
    competitionTeacherId(teacher)
    && !inactiveStatuses.includes(String(teacher.status || '').toUpperCase())
  )
}

export function isPositiveCompetitionId(value) {
  const number = Number(value)
  return Number.isInteger(number) && number > 0
}

export function competitionRegistrationName(registration = {}) {
  return registration.studentName
    || registration.student?.name
    || registration.name
    || registration.realName
    || registration.userName
    || registration.childName
    || '后端未返回姓名'
}

export function competitionRegistrationClassName(registration = {}) {
  return registration.className
    || registration.studentClassName
    || registration.class?.name
    || ''
}

export function competitionRegistrationKey(registration = {}, index) {
  return registration.registrationId
    || registration.id
    || registration.studentId
    || `registration-${index}`
}
