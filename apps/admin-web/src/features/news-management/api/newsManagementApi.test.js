import assert from 'node:assert/strict'
import test from 'node:test'

import { createNewsManagementApi } from './newsManagementApi.js'

test('news management api adapts article and category operations', async () => {
  const calls = []
  const managementApi = Object.fromEntries([
    'listNews',
    'getNews',
    'createNews',
    'updateNews',
    'publishNews',
    'offlineNews',
    'pinNews',
    'updateNewsCategory',
    'updateNewsSortOrder',
    'scheduleNews',
    'deleteNews',
    'listNewsCategories',
    'getNewsCategory',
    'createNewsCategory',
    'updateNewsCategoryRecord',
    'deleteNewsCategory'
  ].map(operation => [operation, async (...args) => {
    calls.push([operation, ...args])
    return { operation }
  }]))
  const api = createNewsManagementApi({ managementApi })

  await api.fetchArticles({ page: 1 })
  await api.fetchArticle(2)
  await api.createArticle({ title: '通知' })
  await api.updateArticle(2, { title: '新通知' })
  await api.publishArticle(2)
  await api.offlineArticle(2)
  await api.pinArticle(2, { isPinned: true })
  await api.changeArticleCategory(2, { categoryId: 3 })
  await api.changeArticleSortOrder(2, { sortOrder: 4 })
  await api.scheduleArticle(2, { publishAt: '2026-08-01T10:00:00' })
  await api.deleteArticle(2)
  await api.fetchCategories({ page: 1 })
  await api.fetchCategory(3)
  await api.createCategory({ name: '通知' })
  await api.updateCategory(3, { name: '公告' })
  await api.deleteCategory(3)

  assert.deepEqual(calls, [
    ['listNews', { page: 1 }],
    ['getNews', 2],
    ['createNews', { title: '通知' }],
    ['updateNews', 2, { title: '新通知' }],
    ['publishNews', 2],
    ['offlineNews', 2],
    ['pinNews', 2, { isPinned: true }],
    ['updateNewsCategory', 2, { categoryId: 3 }],
    ['updateNewsSortOrder', 2, { sortOrder: 4 }],
    ['scheduleNews', 2, { publishAt: '2026-08-01T10:00:00' }],
    ['deleteNews', 2],
    ['listNewsCategories', { page: 1 }],
    ['getNewsCategory', 3],
    ['createNewsCategory', { name: '通知' }],
    ['updateNewsCategoryRecord', 3, { name: '公告' }],
    ['deleteNewsCategory', 3]
  ])
})

test('news management api waits for and downloads asynchronous exports', async () => {
  const calls = []
  const api = createNewsManagementApi({
    async createExport(taskType, filter) {
      calls.push(['create-export', taskType, filter])
      return { id: 8, status: 'PENDING' }
    },
    async waitForExport(taskId) {
      calls.push(['wait-export', taskId])
      return { id: taskId, status: 'COMPLETED' }
    },
    async downloadExport(taskId) {
      calls.push(['download-export', taskId])
      return { blob: new Blob(['news']) }
    }
  })

  assert.ok((await api.exportArticles({ status: 'PUBLISHED' })).blob instanceof Blob)
  assert.deepEqual(calls, [
    ['create-export', 'NEWS', { status: 'PUBLISHED' }],
    ['wait-export', 8],
    ['download-export', 8]
  ])
})

test('news management api downloads completed exports immediately', async () => {
  const calls = []
  const api = createNewsManagementApi({
    async createExport() {
      return { id: 9, status: 'COMPLETED' }
    },
    async waitForExport() {
      calls.push(['wait'])
    },
    async downloadExport(taskId) {
      calls.push(['download', taskId])
      return { blob: new Blob(['news']) }
    }
  })

  await api.exportArticles({})
  assert.deepEqual(calls, [['download', 9]])
})
