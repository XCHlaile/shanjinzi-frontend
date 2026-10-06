import assert from 'node:assert/strict'
import test from 'node:test'

import {
  articleCategoryActionForm,
  articleForm,
  articleScheduleActionForm,
  articleSortActionForm,
  categoryForm,
  emptyArticleForm,
  emptyCategoryForm,
  newsExportFilter,
  newsListParams,
  newsStatusLabel,
  normalizeArticlePage,
  normalizeCategoryPage,
  shortNewsDate,
  upsertArticleRows,
  upsertCategoryRows
} from './newsManagementViewModel.js'

test('news view model normalizes article and category pages', () => {
  assert.deepEqual(normalizeArticlePage({
    records: [{
      id: 1,
      title: '通知',
      categoryName: '公告',
      contentMarkdown: '正文',
      isPinned: true
    }]
  }), [{
    id: 1,
    title: '通知',
    categoryName: '公告',
    contentMarkdown: '正文',
    isPinned: true,
    category: '公告',
    author: '',
    pinned: true,
    content: '正文'
  }])
  assert.deepEqual(normalizeCategoryPage({
    items: [{ id: 2, code: 'notice', name: '公告' }]
  }), [{
    id: 2,
    code: 'notice',
    name: '公告',
    label: '公告',
    value: 2
  }])
})

test('news view model owns article and category form defaults', () => {
  assert.deepEqual(emptyArticleForm(2), {
    categoryId: 2,
    title: '',
    summary: '',
    coverFileId: null,
    contentMarkdown: '',
    contentHtml: '',
    isPinned: false,
    sortOrder: 0,
    publishAt: ''
  })
  assert.equal(articleForm({ title: '通知' }, 3).categoryId, 3)
  assert.deepEqual(emptyCategoryForm(), { name: '', sortOrder: 0 })
  assert.deepEqual(categoryForm({ name: '公告', sortOrder: 4 }), {
    name: '公告',
    sortOrder: 4
  })
})

test('news view model builds independent article action forms', () => {
  assert.deepEqual(articleCategoryActionForm({ categoryId: 2 }, 3), {
    categoryId: 2,
    sortOrder: 0,
    publishAt: ''
  })
  assert.deepEqual(articleSortActionForm({ sortOrder: 5 }), {
    categoryId: null,
    sortOrder: 5,
    publishAt: ''
  })
  assert.deepEqual(articleScheduleActionForm({
    publishAt: '2026-08-01T10:00:00'
  }), {
    categoryId: null,
    sortOrder: 0,
    publishAt: '2026-08-01T10:00:00'
  })
})

test('news view model builds list and export filters', () => {
  const filters = {
    keyword: ' 通知 ',
    categoryId: 2,
    status: 'PUBLISHED'
  }
  assert.deepEqual(newsListParams(filters), {
    page: 1,
    pageSize: 100,
    ...filters
  })
  assert.deepEqual(newsExportFilter(filters), {
    keyword: '通知',
    categoryId: 2,
    status: 'PUBLISHED'
  })
})

test('news view model updates normalized rows and labels dates and statuses', () => {
  assert.equal(newsStatusLabel('SCHEDULED'), '定时发布')
  assert.equal(shortNewsDate('2026-07-31T09:10:11.000Z'), '2026-07-31 09:10:11')
  assert.equal(upsertArticleRows([], { id: 1, title: '通知' })[0].title, '通知')
  assert.equal(
    upsertCategoryRows([{ id: 2, name: '旧名称' }], { id: 2, name: '公告' })[0].label,
    '公告'
  )
})
