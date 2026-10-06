// School-roster labels and response normalization stay independent of Vue components.
export function pageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || payload?.students || []
}

export function statusLabel(status) {
  return ({ ENABLED: '启用', ACTIVE: '启用', DISABLED: '停用', INACTIVE: '停用' })[status] || status || '-'
}

export function isEnabled(status) {
  return status === 'ENABLED' || status === 'ACTIVE'
}

export function enrollmentLabel(status) {
  return ({ ENROLLED: '在读', ACTIVE: '在读', GRADUATED: '毕业', TRANSFERRED: '转出' })[status] || status || '-'
}

export function roleLabel(role) {
  return ({ TEACHER: '教师', PARENT: '家长', SCHOOL_ADMIN: '校方管理员' })[role] || role
}

export const guardianRelationLabels = {
  FATHER: '父亲',
  MOTHER: '母亲',
  GRANDFATHER_PATERNAL: '爷爷',
  GRANDMOTHER_PATERNAL: '奶奶',
  GRANDFATHER_MATERNAL: '外公',
  GRANDMOTHER_MATERNAL: '外婆'
}

export function relationLabel(relation) {
  return guardianRelationLabels[relation] || relation || '家长'
}

export function formatTime(value) {
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

export function numericList(value) {
  if (Array.isArray(value)) return value.map(Number).filter(Number.isFinite)
  return String(value || '').split(/[,，\s]+/).map(Number).filter(Number.isFinite)
}

export function schoolIdOf(user = {}) {
  return user.schoolId || user.school?.id || user.school?.schoolId || null
}

export function isInactiveClass(classItem = {}) {
  return ['DISABLED', 'INACTIVE'].includes(classItem.status)
}

export function classOptionLabel(classItem = {}) {
  const grade = classItem.gradeName ? `${classItem.gradeName} · ` : ''
  const disabled = isInactiveClass(classItem) ? '（已停用）' : ''
  return `${grade}${classItem.name || `班级 #${classItem.id}`}${disabled}`
}
