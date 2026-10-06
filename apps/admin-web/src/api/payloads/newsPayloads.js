import { cleanObject, numericId, text } from './payloadUtils.js'

export function normalizeNewsCategory(category = {}) {
  return {
    ...category,
    label: category.name || category.code || '',
    value: category.id
  }
}

export function normalizeNewsArticle(article = {}) {
  const isPinned = article.isPinned ?? article.pinned ?? false
  return {
    ...article,
    category: article.categoryName || article.category || article.categoryId || '',
    author: article.createdByName || article.author || '',
    pinned: isPinned,
    isPinned,
    content: article.contentMarkdown || article.content || ''
  }
}

export function newsArticlePayload(form = {}) {
  return cleanObject({
    categoryId: numericId(form.categoryId),
    title: text(form.title),
    summary: text(form.summary),
    coverFileId: numericId(form.coverFileId),
    contentMarkdown: text(form.contentMarkdown ?? form.content),
    contentHtml: text(form.contentHtml),
    isPinned: Boolean(form.pinned ?? form.isPinned),
    sortOrder: numericId(form.sortOrder),
    publishAt: text(form.publishAt)
  })
}

function comparableDateTime(value) {
  return String(value ?? '').replace('T', ' ').slice(0, 19)
}

function comparableNewsValue(key, value) {
  if (key === 'publishAt') return comparableDateTime(value)
  if (key === 'isPinned') return Boolean(value)
  return String(value ?? '')
}

export function newsArticleMatchesPayload(article = {}, payload = {}) {
  const normalized = normalizeNewsArticle(article)
  if (payload.title && String(normalized.title ?? '') !== String(payload.title)) return false
  return Object.entries(payload).every(([key, value]) => (
    comparableNewsValue(key, normalized[key]) === comparableNewsValue(key, value)
  ))
}

export function newsPinPayload(form = {}) {
  return { isPinned: Boolean(form.isPinned) }
}

export function newsSortOrderPayload(form = {}) {
  return cleanObject({ sortOrder: numericId(form.sortOrder) })
}

export function newsArticleCategoryPayload(form = {}) {
  return cleanObject({ categoryId: numericId(form.categoryId) })
}

export function newsSchedulePayload(form = {}) {
  return cleanObject({ publishAt: text(form.publishAt) })
}

export function newsCategoryPayload(form = {}) {
  return cleanObject({
    name: text(form.name),
    sortOrder: numericId(form.sortOrder)
  })
}

export function newsCategoryUpdatePayload(form = {}) {
  return cleanObject({
    name: text(form.name),
    sortOrder: numericId(form.sortOrder)
  })
}

export function newsCategoryMatchesPayload(category = {}, payload = {}) {
  return Object.entries(payload).every(([key, value]) => String(category[key] ?? '') === String(value))
}
