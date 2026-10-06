export const AUDIT_ACTION_LABELS = {
  LOGIN: '登录',
  LOGOUT: '退出登录',
  CREATE: '创建',
  UPDATE: '更新',
  UPDATE_CLASSES: '调整班级',
  UPDATE_STATUS: '更新状态',
  DELETE: '删除',
  PUBLISH: '发布',
  OFFLINE: '下线',
  ENABLE: '启用',
  DISABLE: '禁用',
  BIND: '绑定',
  UNBIND: '解除绑定',
  IMPORT: '导入',
  EXPORT: '导出',
  DOWNLOAD: '下载',
  HANDLE: '处理',
  RESET_PASSWORD: '重置用户密码',
  ROLE_UPDATE: '更新用户角色',
  SCHOOL_UPDATE: '更新用户所属学校',
  TEACHER_CLASSES_UPDATE: '更新任教班级',
  MESSAGE_BROADCAST_CREATE: '创建消息广播'
}

export const AUDIT_TARGET_TYPE_LABELS = {
  MessageBroadcast: '消息广播',
  ExportTask: '导出任务',
  NewsArticle: '资讯文章',
  NewsCategory: '资讯分类',
  PageContent: '页面内容',
  PageVersion: '页面版本',
  Competition: '赛事',
  CompetitionRegistration: '赛事报名',
  School: '学校',
  SchoolClass: '班级',
  User: '用户',
  Student: '学生',
  Class: '班级'
}

export const AUDIT_OPERATOR_ROLE_LABELS = {
  SUPER_ADMIN: '超级管理员',
  SCHOOL_ADMIN: '校方管理员',
  TEACHER: '教师',
  PARENT: '家长'
}

export const AUDIT_EXPORT_TYPE_LABELS = {
  USERS: '用户数据',
  SCHOOLS: '学校数据',
  STUDENTS: '学生数据',
  CLASSES: '班级数据',
  COMPETITIONS: '赛事数据',
  REGISTRATIONS: '报名数据',
  MESSAGES: '消息数据',
  PAGES: '页面数据',
  NEWS: '资讯数据',
  AUDIT_LOGS: '审计日志'
}

export const AUDIT_BROADCAST_SCOPE_LABELS = {
  PLATFORM: '全平台消息',
  SCHOOL: '学校消息',
  USER: '指定用户消息'
}

export const TARGET_AWARE_AUDIT_ACTIONS = new Set([
  'CREATE',
  'UPDATE',
  'DELETE',
  'PUBLISH',
  'OFFLINE',
  'ENABLE',
  'DISABLE',
  'BIND',
  'UNBIND',
  'IMPORT',
  'EXPORT',
  'DOWNLOAD',
  'HANDLE'
])

export function auditPageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function auditTargetTypeLabel(value) {
  return AUDIT_TARGET_TYPE_LABELS[value] || (value ? '其他对象' : '-')
}

export function auditReferenceKey(targetType, targetId) {
  return `${targetType || ''}:${targetId ?? ''}`
}

export function auditTargetDetail(row, objectDetails = new Map()) {
  return objectDetails.get(auditReferenceKey(row.targetType, row.targetId)) || ''
}

export function auditTargetDescription(row, objectDetails = new Map()) {
  const label = auditTargetTypeLabel(row.targetType)
  const detail = auditTargetDetail(row, objectDetails)
  return detail ? `${label}：${detail}` : label
}

export function auditActionDescription(row, objectDetails = new Map()) {
  const label = AUDIT_ACTION_LABELS[row.action]
  const targetLabel = auditTargetTypeLabel(row.targetType)
  const detail = auditTargetDetail(row, objectDetails)
  const targetDescription = auditTargetDescription(row, objectDetails)
  if (row.action === 'UPDATE_STATUS') {
    return detail ? `更新${targetDescription}的状态` : `更新${targetLabel}状态`
  }
  if (row.action === 'RESET_PASSWORD') {
    return detail ? `重置${detail}的密码` : '重置用户密码'
  }
  if (row.action === 'MESSAGE_BROADCAST_CREATE') {
    return detail ? `创建${targetDescription}` : '创建消息广播'
  }
  if (
    detail
    && ['ROLE_UPDATE', 'SCHOOL_UPDATE', 'TEACHER_CLASSES_UPDATE'].includes(row.action)
  ) {
    return `${label}：${detail}`
  }
  if (label && TARGET_AWARE_AUDIT_ACTIONS.has(row.action)) {
    return `${label}${targetDescription}`
  }
  return label || (row.action ? '其他操作' : '-')
}

export function auditOperatorLabel(row, operatorNames = new Map()) {
  const roleLabel = AUDIT_OPERATOR_ROLE_LABELS[row.operatorRoleCode]
    || row.operatorRoleCode
    || ''
  const resolvedName = operatorNames.get(String(row.operatorUserId ?? '')) || ''
  const identity = row.actorName
    || row.operatorName
    || resolvedName
    || roleLabel
    || '系统'
  return roleLabel && identity !== roleLabel ? `${identity}（${roleLabel}）` : identity
}

export function matchesAuditLog(row, {
  keyword = '',
  range = [],
  objectDetails = new Map(),
  operatorNames = new Map()
} = {}) {
  const query = keyword.trim()
  const start = range?.[0] ? new Date(range[0]).getTime() : null
  const end = range?.[1] ? new Date(range[1]).getTime() + 24 * 60 * 60 * 1000 : null
  const matchesKeyword = !query || [
    row.actorName,
    row.operatorUserId,
    row.operatorRoleCode,
    auditOperatorLabel(row, operatorNames),
    row.action,
    auditActionDescription(row, objectDetails),
    row.targetType,
    auditTargetTypeLabel(row.targetType),
    row.targetId,
    auditTargetDescription(row, objectDetails),
    row.entryHash
  ].some(value => String(value || '').includes(query))
  const time = row.createdAt ? new Date(row.createdAt).getTime() : null
  const matchesRange = (!start || (time && time >= start))
    && (!end || (time && time < end))
  return matchesKeyword && matchesRange
}

export function auditTextPreview(value, maxLength = 28) {
  const text = String(value || '').trim().replace(/\s+/g, ' ')
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}

export function auditUserName(user) {
  return user.realName || user.nickname || user.phone || ''
}

export function auditUserDetail(user) {
  const name = auditUserName(user)
  if (!name) return ''
  return user.phone && user.phone !== name ? `${name}（${user.phone}）` : name
}

export function auditMessageBroadcastDetail(item) {
  const scope = AUDIT_BROADCAST_SCOPE_LABELS[item.scope] || item.scope || '消息'
  const content = auditTextPreview(item.content)
  return content ? `${scope}：“${content}”` : scope
}

export function auditExportTaskDetail(item) {
  const type = item.taskType || item.type
  const typeLabel = AUDIT_EXPORT_TYPE_LABELS[type] || type || '数据'
  return `${typeLabel}导出`
}

export function auditTitledDetail(item) {
  const title = item.title || item.name || item.pageTitle
  return title ? `《${title}》` : ''
}

export function auditExportDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString().slice(0, 10)
}

export function auditExportFilter({ keyword = '', range = [] } = {}) {
  return {
    keyword: keyword.trim(),
    startDate: auditExportDate(range?.[0]),
    endDate: auditExportDate(range?.[1])
  }
}

export function shortAuditDate(value) {
  return value ? String(value).replace('T', ' ').slice(0, 19) : ''
}
