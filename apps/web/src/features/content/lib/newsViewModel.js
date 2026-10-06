export function publicNewsItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function normalizePublicNewsCategory(item = {}) {
  return {
    id: item.id,
    code: item.code || '',
    name: item.name || item.code || '未分类',
    sortOrder: Number(item.sortOrder ?? 0)
  }
}

export function normalizePublicNewsArticle(item = {}) {
  return {
    id: item.id,
    categoryId: item.categoryId,
    categoryName: item.categoryName || '',
    title: item.title || '',
    summary: item.summary || '',
    isPinned: Boolean(item.isPinned),
    publishAt: item.publishAt || '',
    createdAt: item.createdAt || ''
  }
}

export function publicNewsContentText(value = '') {
  return String(value)
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

export function formatPublicNewsTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}
