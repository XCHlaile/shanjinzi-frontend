export const USER_ROLE_LABELS = {
  SUPER_ADMIN: '超级管理员',
  SCHOOL_ADMIN: '校方管理员',
  TEACHER: '教师',
  PARENT: '家长'
}

export const USER_STATUS_LABELS = {
  ACTIVE: '启用',
  DISABLED: '禁用',
  DELETED: '已删除'
}

export function userRoleLabel(value) {
  return USER_ROLE_LABELS[value] || value || '-'
}

export function userStatusLabel(value) {
  return USER_STATUS_LABELS[value] || value || '-'
}

export function userPageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function activeSchoolItems(payload) {
  return userPageItems(payload).filter(school => school.status !== 'DISABLED')
}

export function emptyUserForm() {
  return {
    phone: '',
    realName: '',
    roleCode: 'PARENT',
    schoolId: null,
    nickname: '',
    gender: ''
  }
}

export function userForm(user = {}) {
  return {
    phone: user.phone || '',
    realName: user.realName || '',
    roleCode: user.roleCode || 'PARENT',
    schoolId: user.schoolId || null,
    nickname: user.nickname || '',
    gender: user.gender || ''
  }
}

export function matchesUser(row, {
  keyword = '',
  role = '',
  status = ''
} = {}) {
  const query = keyword.trim()
  const matchesKeyword = !query || [
    row.phone,
    row.displayName,
    row.nickname,
    row.realName,
    row.childName,
    row.schoolName
  ].some(value => String(value || '').includes(query))
  const matchesRole = !role || row.role === role
  const matchesStatus = !status || row.status === status
  return matchesKeyword && matchesRole && matchesStatus
}

export function userExportFilter({
  keyword = '',
  role = '',
  status = ''
} = {}) {
  return {
    keyword: keyword.trim(),
    role,
    status
  }
}

export function userDirectoryQuery({
  keyword = '',
  role = '',
  status = ''
} = {}, {
  page = 1,
  pageSize = 20
} = {}) {
  const query = keyword.trim()
  return {
    ...(query ? (/^\d+$/.test(query) ? { phone: query } : { realName: query }) : {}),
    ...(role ? { roleCode: role } : {}),
    ...(status ? { status } : {}),
    page,
    pageSize
  }
}

export function shortUserDate(value) {
  return value ? String(value).replace('T', ' ').slice(0, 19) : ''
}
