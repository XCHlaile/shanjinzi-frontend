import {
  normalizeNewsArticle,
  normalizeNewsCategory
} from '../../../api/payloads/newsPayloads.js'

export const NEWS_STATUS_LABELS = {
  DRAFT: '草稿',
  SCHEDULED: '定时发布',
  PUBLISHED: '已发布',
  OFFLINE: '已下线'
}

export function newsStatusLabel(value) {
  return NEWS_STATUS_LABELS[value] || value || '-'
}

export function newsPageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function normalizeArticlePage(payload) {
  return newsPageItems(payload).map(normalizeNewsArticle)
}

export function normalizeCategoryPage(payload) {
  return newsPageItems(payload).map(normalizeNewsCategory)
}

export function emptyArticleForm(categoryId = null) {
  return {
    categoryId,
    title: '',
    summary: '',
    coverFileId: null,
    contentMarkdown: '',
    contentHtml: '',
    isPinned: false,
    sortOrder: 0,
    publishAt: ''
  }
}

export function articleForm(article = {}, fallbackCategoryId = null) {
  return {
    categoryId: article.categoryId || fallbackCategoryId,
    title: article.title || '',
    summary: article.summary || '',
    coverFileId: article.coverFileId || null,
    contentMarkdown: article.contentMarkdown || '',
    contentHtml: article.contentHtml || '',
    isPinned: Boolean(article.isPinned),
    sortOrder: article.sortOrder || 0,
    publishAt: article.publishAt || ''
  }
}

export function emptyCategoryForm() {
  return {
    name: '',
    sortOrder: 0
  }
}

export function categoryForm(category = {}) {
  return {
    name: category.name || '',
    sortOrder: category.sortOrder || 0
  }
}

export function emptyArticleActionForm() {
  return {
    categoryId: null,
    sortOrder: 0,
    publishAt: ''
  }
}

export function articleCategoryActionForm(article = {}, fallbackCategoryId = null) {
  return {
    ...emptyArticleActionForm(),
    categoryId: article.categoryId || fallbackCategoryId
  }
}

export function articleSortActionForm(article = {}) {
  return {
    ...emptyArticleActionForm(),
    sortOrder: article.sortOrder || 0
  }
}

export function articleScheduleActionForm(article = {}) {
  return {
    ...emptyArticleActionForm(),
    publishAt: article.publishAt || ''
  }
}

export function newsListParams({
  keyword = '',
  categoryId = '',
  status = ''
} = {}) {
  return {
    page: 1,
    pageSize: 100,
    keyword,
    categoryId,
    status
  }
}

export function newsExportFilter({
  keyword = '',
  categoryId = '',
  status = ''
} = {}) {
  return {
    keyword: keyword.trim(),
    categoryId,
    status
  }
}

export function upsertArticleRows(rows = [], article) {
  if (!article?.id) return rows
  const normalized = normalizeNewsArticle(article)
  const index = rows.findIndex(row => row.id === normalized.id)
  if (index === -1) return [normalized, ...rows]
  return rows.map((row, rowIndex) => (
    rowIndex === index ? { ...row, ...normalized } : row
  ))
}

export function upsertCategoryRows(rows = [], category) {
  if (!category?.id) return rows
  const normalized = normalizeNewsCategory(category)
  const index = rows.findIndex(row => row.id === normalized.id)
  if (index === -1) return [normalized, ...rows]
  return rows.map((row, rowIndex) => (
    rowIndex === index ? { ...row, ...normalized } : row
  ))
}

export function shortNewsDate(value) {
  return value ? String(value).replace('T', ' ').slice(0, 19) : ''
}
