const moduleLabels = {
  USER: '用户管理',
  STUDENT: '学生管理',
  GUARDIAN: '家长管理',
  CLASS: '班级管理',
  SCHOOL: '学校管理',
  COMPETITION: '赛事管理',
  MOMENT: '动态管理',
  FORUM: '家长论坛',
  MESSAGE: '消息管理',
  NEWS: '新闻资讯',
  EXPORT: '数据导出',
  AUDIT: '审计日志',
  AUTH: '登录认证',
  CONTENT_REPORT: '内容举报'
}

const actionLabels = {
  CREATE: '新增',
  UPDATE: '修改资料',
  UPDATE_CLASSES: '调整班级',
  DELETE: '删除',
  ENABLE: '启用',
  DISABLE: '禁用',
  LOGIN: '登录',
  LOGOUT: '退出登录',
  PUBLISH: '发布',
  OFFLINE: '下线',
  BIND: '绑定',
  UNBIND: '解除绑定',
  IMPORT: '批量导入',
  EXPORT: '导出',
  DOWNLOAD: '下载',
  HANDLE: '处理',
  RESET_PASSWORD: '重置密码'
}

const roleLabels = {
  SUPER_ADMIN: '超级管理员',
  SCHOOL_ADMIN: '校方管理员',
  TEACHER: '教师',
  PARENT: '家长'
}

const resultLabels = {
  SUCCESS: '成功',
  FAILED: '失败',
  FAIL: '失败',
  ERROR: '异常',
  DENIED: '已拒绝'
}

const riskLabels = {
  LOW: '低风险',
  MEDIUM: '中风险',
  HIGH: '高风险',
  CRITICAL: '严重风险'
}

const targetTypeLabels = {
  USER: '用户',
  STUDENT: '学生',
  GUARDIAN: '家长',
  CLASS: '班级',
  SCHOOL: '学校',
  COMPETITION: '赛事',
  MOMENT: '动态',
  FORUM_TOPIC: '论坛话题',
  FORUM_REPLY: '论坛回复',
  MESSAGE: '消息',
  NEWS: '新闻资讯'
}

const taskTypeLabels = {
  STUDENTS: '学生数据',
  USERS: '用户数据',
  AUDIT_LOGS: '审计日志',
  COMPETITIONS: '赛事数据'
}

const scopeLabels = {
  SCHOOL: '当前学校',
  CURRENT_USER: '当前用户',
  PLATFORM: '全平台'
}

const exportStatusLabels = {
  PENDING: '等待处理',
  PROCESSING: '处理中',
  COMPLETED: '已完成',
  SUCCESS: '已完成',
  FAILED: '失败',
  EXPIRED: '已过期'
}

export const operationModuleOptions = Object.entries(moduleLabels)
  .map(([value, label]) => ({ value, label }))

export const operationActionOptions = Object.entries(actionLabels)
  .map(([value, label]) => ({ value, label }))

export function operationPageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function formatOperationTime(value) {
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

export function displayOperationValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
}

function codeLabel(labels, value, fallback) {
  if (!value) return '-'
  return labels[String(value).toUpperCase()] || fallback
}

export function operationModuleLabel(value) {
  return codeLabel(moduleLabels, value, '其他模块')
}

export function operationActionLabel(value) {
  return codeLabel(actionLabels, value, '其他操作')
}

export function operationRoleLabel(value) {
  return codeLabel(roleLabels, value, '其他角色')
}

export function operationResultLabel(value) {
  return codeLabel(resultLabels, value, '未知结果')
}

export function operationRiskLabel(value) {
  return codeLabel(riskLabels, value, '未知风险')
}

export function operationTaskTypeLabel(value) {
  return codeLabel(taskTypeLabels, value, '其他数据')
}

export function operationScopeLabel(value) {
  return codeLabel(scopeLabels, value, '其他范围')
}

export function operationExportStatusLabel(value) {
  return codeLabel(exportStatusLabels, value, '未知状态')
}

export function operationUserName(user = {}) {
  return user.realName || user.nickname || user.name || user.phone || ''
}

export function operationTargetLabel(log = {}, userNames = {}) {
  const targetId = Number(log.targetId)
  const targetType = String(log.targetType || '').toUpperCase()
  if (targetType === 'USER' && Number.isFinite(targetId)) {
    return userNames[String(targetId)] || '未知用户'
  }
  return log.targetName
    || log.targetSummary
    || targetTypeLabels[targetType]
    || '未知目标'
}

export function operationOperatorLabel(log = {}, userNames = {}) {
  const operatorId = Number(log.operatorUserId)
  return Number.isFinite(operatorId)
    ? userNames[String(operatorId)] || '未知操作者'
    : '系统'
}

export function operationRiskClass(level) {
  return level === 'HIGH'
    ? 'risk-high'
    : level === 'MEDIUM'
      ? 'risk-medium'
      : ''
}

export function canDownloadOperationExport(task = {}) {
  return task.status === 'COMPLETED'
    || task.status === 'SUCCESS'
    || Boolean(task.fileId)
}
