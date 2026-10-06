export const EXPORT_TASK_TYPE_LABELS = {
  USERS: '用户',
  SCHOOLS: '学校',
  STUDENTS: '学生',
  REGISTRATIONS: '报名',
  AUDIT_LOGS: '审计',
  COMPETITIONS: '赛事',
  CLASSES: '班级',
  MESSAGES: '消息',
  NEWS: '资讯',
  PAGES: '页面'
}

export function exportTaskTypeLabel(value) {
  return EXPORT_TASK_TYPE_LABELS[value] || value || '-'
}

export function exportTaskItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function matchesExportTask(row, { type = '', status = '' } = {}) {
  const matchesType = !type || (row.taskType || row.type) === type
  const matchesStatus = !status || row.status === status
  return matchesType && matchesStatus
}

export function shortExportTaskDate(value) {
  return value ? String(value).replace('T', ' ').slice(0, 19) : ''
}
