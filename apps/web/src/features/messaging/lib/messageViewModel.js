// Presentation-only helpers; transport and Vue state belong in adjacent feature layers.
export function pageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function contactName(contact = {}) {
  return contact.realName || contact.nickname || `用户 ${contact.id || ''}`.trim()
}

export function contactInitial(contact = {}) {
  return contactName(contact).slice(0, 1) || '用'
}

export function roleName(role) {
  const labels = {
    PARENT: '家长',
    parent: '家长',
    TEACHER: '教师',
    teacher: '教师',
    SCHOOL_ADMIN: '校方管理员',
    school: '校方管理员',
    SUPER_ADMIN: '超级管理员'
  }
  return labels[role] || role || '用户'
}

export function schoolNameOf(record = {}) {
  return record.schoolName || record.school?.name || record.school?.schoolName || record.organizationName || ''
}

export function contactRoleText(contact = {}, context = {}) {
  const roles = (contact.roles || []).map(roleName).join('、')
  const contextSchoolName = context.role === 'parent'
    ? schoolNameOf(context.currentStudent) || schoolNameOf(context.user)
    : schoolNameOf(context.user)
  const schoolName = schoolNameOf(contact) || contextSchoolName
  return [schoolName, roles].filter(Boolean).join('·') || '联系人'
}

export function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function formatShortTime(value, today = new Date()) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  if (date.toDateString() === today.toDateString()) {
    return new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(date)
  }
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(date)
}

export function displayUnread(value) {
  const count = Number(value || 0)
  return count > 99 ? '99+' : count
}

export function contactId(contact = {}) {
  return String(contact.id ?? '')
}

export function sortConversations(items) {
  return [...items].sort((left, right) => {
    if (Boolean(left.pinned) !== Boolean(right.pinned)) return left.pinned ? -1 : 1
    return new Date(right.lastMessageAt || 0).getTime() - new Date(left.lastMessageAt || 0).getTime()
  })
}

export function mergeById(current, incoming, key) {
  const map = new Map(current.map(item => [String(item[key]), item]))
  incoming.forEach(item => map.set(String(item[key]), item))
  return [...map.values()]
}

export function sortMessages(items) {
  return [...items].sort((left, right) => {
    const timeDifference = new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime()
    return timeDifference || Number(left.messageId || 0) - Number(right.messageId || 0)
  })
}

export function notificationTypeLabel(type) {
  const labels = {
    GUARDIAN_BINDING: '学生绑定',
    MOMENT: '幼儿动态',
    COMPETITION: '赛事活动',
    COMPETITION_PUBLISHED: '赛事发布',
    MESSAGE: '消息提醒',
    SYSTEM: '系统通知',
    ADMIN_BROADCAST: '平台通知'
  }
  return labels[type] || type || '系统通知'
}
