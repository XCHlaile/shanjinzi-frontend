export const MESSAGE_BROADCAST_STATUS_LABELS = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  SENDING: '发送中',
  COMPLETED: '已完成',
  PARTIAL_FAILED: '部分失败',
  FAILED: '失败',
  CANCELLED: '已取消'
}

export const MESSAGE_RECIPIENT_STATUS_LABELS = {
  PENDING: '待发送',
  SENT: '已发送',
  DELIVERED: '已送达',
  READ: '已读',
  FAILED: '失败',
  SKIPPED: '已跳过'
}

export function messageBroadcastPageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function messageBroadcastTotal(payload, rows = messageBroadcastPageItems(payload)) {
  return Number(payload?.total ?? rows.length)
}

export function messageBroadcastStatusLabel(value) {
  return MESSAGE_BROADCAST_STATUS_LABELS[value] || value || '-'
}

export function messageRecipientStatusLabel(value) {
  return MESSAGE_RECIPIENT_STATUS_LABELS[value] || value || '-'
}

export function messageBroadcastStatusOptions(rows = []) {
  return Array.from(new Set(rows.map(row => row.status).filter(Boolean)))
}

export function matchesMessageBroadcast(row, {
  keyword = '',
  scope = '',
  status = ''
} = {}) {
  const query = keyword.trim()
  const matchesKeyword = !query || [row.id, row.schoolId]
    .some(value => String(value || '').includes(query))
  const matchesScope = !scope || row.scope === scope
  const matchesStatus = !status || row.status === status
  return matchesKeyword && matchesScope && matchesStatus
}

export function messageRecipientStatusRows(detail) {
  return Object.entries(detail?.recipientStatusCounts || {})
    .map(([status, count]) => ({ status, count }))
}

export function emptyMessageBroadcastForm() {
  return {
    scope: 'PLATFORM',
    schoolId: null,
    recipientUserIds: [],
    content: '',
    attachmentFileIds: []
  }
}

export function positiveNumericIds(values) {
  return (values || [])
    .map(Number)
    .filter(value => Number.isInteger(value) && value > 0)
}

export function messageBroadcastValidation(form) {
  if (!form.content.trim()) return '请输入消息内容'
  if (form.scope === 'SCHOOL' && !form.schoolId) return '请选择学校'
  if (form.scope === 'USER' && !form.recipientUserIds.length) return '请选择接收用户'
  return ''
}

export function messageBroadcastPayload(form) {
  const payload = {
    scope: form.scope,
    content: form.content.trim()
  }
  if (form.scope === 'SCHOOL') payload.schoolId = Number(form.schoolId)
  if (form.scope === 'USER') {
    payload.recipientUserIds = positiveNumericIds(form.recipientUserIds)
  }
  const attachmentFileIds = positiveNumericIds(form.attachmentFileIds)
  if (attachmentFileIds.length) payload.attachmentFileIds = attachmentFileIds
  return payload
}

export function activeMessageSchools(schools = []) {
  return schools.filter(item => item.status !== 'DISABLED')
}

export function availableMessageUsers(users = []) {
  return users.filter(item => item.status !== 'DELETED')
}

export function messageBroadcastExportFilter({ keyword = '', scope = '', status = '' } = {}) {
  return {
    keyword: keyword.trim(),
    scope,
    status
  }
}

export function canRetryMessageBroadcast(row) {
  return Number(row.failureCount || 0) > 0
    || ['FAILED', 'PARTIAL_FAILED'].includes(row.status)
}

export function messageBroadcastScopeLabel(value) {
  return {
    PLATFORM: '全平台',
    SCHOOL: '指定学校',
    USER: '指定用户'
  }[value] || value || '-'
}

export function messageBroadcastUserLabel(user) {
  return [
    user.realName || user.displayName || user.nickname || user.phone,
    user.phone
  ]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(' · ')
}

export function joinedMessageIds(values) {
  return Array.isArray(values) && values.length ? values.join(', ') : '-'
}

export function shortMessageBroadcastDate(value) {
  return value ? String(value).replace('T', ' ').slice(0, 19) : '-'
}
