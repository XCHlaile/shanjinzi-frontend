export const userRoleLabels = Object.freeze({
  admin: '超级管理员',
  school: '校方管理员',
  teacher: '教师',
  parent: '家长'
})

export function normalizeAccessRole(role) {
  const normalized = String(role || '').toLowerCase()
  if (normalized === 'school_admin' || normalized === 'school') return 'school'
  if (normalized === 'teacher') return 'teacher'
  if (normalized === 'parent') return 'parent'
  if (normalized === 'super_admin' || normalized === 'admin') return 'admin'
  return ''
}

export function normalizeRole(role) {
  const normalized = normalizeAccessRole(role)
  if (normalized) return normalized
  return 'parent'
}

export function getRoleLabel(role) {
  return userRoleLabels[normalizeRole(role)] || ''
}
