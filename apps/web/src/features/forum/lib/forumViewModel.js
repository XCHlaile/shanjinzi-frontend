export const FORUM_TOPIC_TAGS = Object.freeze([
  '科技启蒙',
  '无人机',
  'AI朋友',
  '育儿交流',
  '课程预告',
  '官方公告'
])

export function forumPageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function mergeForumRecords(current = [], incoming = [], key) {
  const records = new Map(current.map(item => [String(item[key]), item]))
  incoming.forEach(item => {
    const recordKey = String(item[key])
    records.set(recordKey, { ...(records.get(recordKey) || {}), ...item })
  })
  return [...records.values()]
}

export function sortForumReplies(items = []) {
  return [...items].sort((left, right) => {
    const timeDifference = (
      new Date(left.createdAt || 0).getTime()
      - new Date(right.createdAt || 0).getTime()
    )
    return timeDifference || Number(left.replyId || 0) - Number(right.replyId || 0)
  })
}

export function forumAuthorName(author = {}) {
  return author.displayName || '论坛用户'
}

export function forumAuthorInitial(author = {}) {
  return forumAuthorName(author).slice(0, 1)
}

export function isForumAuthor(author = {}, profile = {}) {
  const authorId = author.userId || author.id
  const userId = profile.id || profile.userId
  if (authorId && userId) return String(authorId) === String(userId)

  const profileNames = [
    profile.realName,
    profile.nickname,
    profile.name,
    profile.phone
  ].filter(Boolean).map(String)
  return profileNames.includes(String(author.displayName || ''))
}

export function forumRoleLabel(role) {
  const labels = {
    PARENT: '家长',
    parent: '家长',
    TEACHER: '教师',
    teacher: '教师',
    SCHOOL_ADMIN: '校方',
    school: '校方'
  }
  return labels[role] || '用户'
}

export function formatForumTime(value) {
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

export function forumFileIds(media = []) {
  return (Array.isArray(media) ? media : [])
    .map(item => Number(item.fileId))
    .filter(Number.isFinite)
}

export function resolveForumMedia(topic = {}, detail = {}) {
  if (Array.isArray(detail?.media)) return detail.media
  return Array.isArray(topic.media) ? topic.media : []
}
