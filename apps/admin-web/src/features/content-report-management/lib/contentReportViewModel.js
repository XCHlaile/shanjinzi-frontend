export const CONTENT_REPORT_TARGET_TYPE_LABELS = {
  FORUM_TOPIC: '论坛主题',
  FORUM_REPLY: '论坛回复',
  MOMENT: '动态',
  MOMENT_COMMENT: '动态评论'
}

export const CONTENT_REPORT_STATUS_LABELS = {
  PENDING: '待处理',
  HANDLED: '已处理',
  RESOLVED: '已处理',
  IGNORED: '已忽略',
  HIDDEN: '已隐藏',
  DELETED: '已删除'
}

export const CONTENT_REPORT_ACTION_LABELS = {
  IGNORE: '忽略举报',
  HIDE: '隐藏内容',
  DELETE: '删除内容'
}

export function contentReportPageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function contentReportPageTotal(payload) {
  if (Array.isArray(payload)) return payload.length
  return Number(payload?.total ?? contentReportPageItems(payload).length)
}

export function contentReportQueryValue(value) {
  return value === '' || value === null || value === undefined ? undefined : value
}

export function contentReportQuery(filters, pagination) {
  return {
    schoolId: contentReportQueryValue(filters.schoolId),
    status: contentReportQueryValue(filters.status),
    targetType: contentReportQueryValue(filters.targetType),
    page: pagination.page,
    pageSize: pagination.pageSize
  }
}

export function contentReportHandlePayload(form) {
  return {
    action: form.action.trim(),
    note: contentReportQueryValue(form.note.trim())
  }
}

export function reportSchoolId(school = {}) {
  return Number(school.id ?? school.schoolId)
}

export function reportSchoolLabel(school = {}) {
  return school.name || school.schoolName || ''
}

export function contentReportSchoolOptions(schools = []) {
  return schools
    .map(school => ({
      value: reportSchoolId(school),
      label: reportSchoolLabel(school)
    }))
    .filter(school => Number.isFinite(school.value) && school.label)
}

export function contentReportSchoolName(report = {}, schoolNames = {}) {
  return report.schoolName || schoolNames[String(report.schoolId)] || '未知学校'
}

export function isContentReportHandled(report) {
  if (report?.handledAction || report?.handledAt) return true
  return ['HANDLED', 'RESOLVED', 'IGNORED', 'HIDDEN', 'DELETED']
    .includes(String(report?.status || '').toUpperCase())
}

export function contentReportTargetTypeLabel(value) {
  return CONTENT_REPORT_TARGET_TYPE_LABELS[value] || value || '-'
}

export function contentReportStatusLabel(value) {
  return CONTENT_REPORT_STATUS_LABELS[String(value || '').toUpperCase()] || '未知状态'
}

export function contentReportActionLabel(value) {
  if (!value) return '-'
  return CONTENT_REPORT_ACTION_LABELS[String(value).toUpperCase()] || '其他处理'
}

export function contentReportStatusTagType(value) {
  return String(value || '').toUpperCase() === 'PENDING' ? 'warning' : 'success'
}

export function shortContentReportDate(value) {
  return value ? String(value).replace('T', ' ').slice(0, 19) : '-'
}
