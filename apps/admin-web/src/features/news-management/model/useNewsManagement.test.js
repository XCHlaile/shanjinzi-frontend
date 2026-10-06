import assert from 'node:assert/strict'
import test from 'node:test'

import { useNewsManagement } from './useNewsManagement.js'

function createNewsModel(apiOverrides = {}) {
  const calls = []
  const messages = []
  const navigations = []
  const api = {
    async fetchArticles(params) {
      calls.push(['list-articles', params])
      return {
        items: [{
          id: 1,
          categoryId: 2,
          categoryName: '公告',
          title: '开学通知',
          contentMarkdown: '正文',
          status: 'DRAFT'
        }]
      }
    },
    async fetchArticle(articleId) {
      calls.push(['article-detail', articleId])
      return {
        id: articleId,
        categoryId: 2,
        title: '开学通知',
        contentMarkdown: '正文'
      }
    },
    async createArticle(payload) {
      calls.push(['create-article', payload])
      return { id: 3, status: 'DRAFT', ...payload }
    },
    async updateArticle(articleId, payload) {
      calls.push(['update-article', articleId, payload])
      return { id: articleId, ...payload }
    },
    async publishArticle(articleId) {
      calls.push(['publish', articleId])
    },
    async offlineArticle(articleId) {
      calls.push(['offline', articleId])
    },
    async pinArticle(articleId, payload) {
      calls.push(['pin', articleId, payload])
    },
    async changeArticleCategory(articleId, payload) {
      calls.push(['article-category', articleId, payload])
    },
    async changeArticleSortOrder(articleId, payload) {
      calls.push(['article-sort', articleId, payload])
    },
    async scheduleArticle(articleId, payload) {
      calls.push(['schedule', articleId, payload])
    },
    async deleteArticle(articleId) {
      calls.push(['delete-article', articleId])
    },
    async fetchCategories(params) {
      calls.push(['list-categories', params])
      return { items: [{ id: 2, code: 'notice', name: '公告', sortOrder: 1 }] }
    },
    async fetchCategory(categoryId) {
      calls.push(['category-detail', categoryId])
      return { id: categoryId, name: '公告', sortOrder: 1 }
    },
    async createCategory(payload) {
      calls.push(['create-category', payload])
      return { id: 4, code: 'new', ...payload }
    },
    async updateCategory(categoryId, payload) {
      calls.push(['update-category', categoryId, payload])
      return { id: categoryId, code: 'notice', ...payload }
    },
    async deleteCategory(categoryId) {
      calls.push(['delete-category', categoryId])
    },
    async exportArticles(filter) {
      calls.push(['export', filter])
      return { blob: new Blob(['news']), filename: 'news.csv' }
    },
    ...apiOverrides
  }
  const model = useNewsManagement({
    api,
    dialogs: {
      async confirm(...args) {
        calls.push(['confirm', ...args])
      }
    },
    feedback: {
      error(message) {
        messages.push(['error', message])
      },
      success(message) {
        messages.push(['success', message])
      }
    },
    onUnauthorized() {
      navigations.push('/login')
    },
    saveFile(result, fallbackFilename) {
      calls.push(['save-file', result.filename, fallbackFilename])
    }
  })

  return { calls, messages, model, navigations }
}

test('news management loads categories before filtered articles', async () => {
  const { calls, model } = createNewsModel()
  Object.assign(model.filters, {
    keyword: '通知',
    categoryId: 2,
    status: 'DRAFT'
  })

  assert.equal(await model.loadData(), true)
  assert.deepEqual(calls, [
    ['list-categories', { page: 1, pageSize: 100 }],
    ['list-articles', {
      page: 1,
      pageSize: 100,
      keyword: '通知',
      categoryId: 2,
      status: 'DRAFT'
    }]
  ])
  assert.equal(model.rows.value[0].content, '正文')
  assert.equal(model.categories.value[0].label, '公告')
})

test('news management exports current filters', async () => {
  const { calls, messages, model } = createNewsModel()
  Object.assign(model.filters, {
    keyword: ' 通知 ',
    categoryId: 2,
    status: 'PUBLISHED'
  })

  assert.equal(await model.exportNews(), true)
  assert.deepEqual(calls, [
    ['export', {
      keyword: '通知',
      categoryId: 2,
      status: 'PUBLISHED'
    }],
    ['save-file', 'news.csv', '资讯列表.csv']
  ])
  assert.deepEqual(messages, [['success', '资讯数据已导出']])
})

test('news management creates strict article payloads and updates its row immediately', async () => {
  const { calls, messages, model } = createNewsModel()
  model.categories.value = [{ id: 2, name: '公告' }]
  await model.openCreate()
  Object.assign(model.form, {
    title: ' 新通知 ',
    contentMarkdown: ' 正文 ',
    summary: '',
    isPinned: true,
    sortOrder: 3
  })

  assert.equal(await model.saveNews(), true)
  assert.deepEqual(calls[0], ['create-article', {
    categoryId: 2,
    title: '新通知',
    contentMarkdown: '正文',
    isPinned: true,
    sortOrder: 3
  }])
  assert.equal(model.rows.value[0].title, '新通知')
  assert.deepEqual(messages[0], ['success', '资讯已保存'])
})

test('news management recovers an article saved before a response error', async () => {
  const savedArticle = {
    id: 7,
    categoryId: 2,
    title: '新通知',
    contentMarkdown: '正文',
    isPinned: false,
    sortOrder: 0
  }
  const { messages, model } = createNewsModel({
    async createArticle() {
      throw new Error('响应中断')
    },
    async fetchArticles() {
      return { items: [savedArticle] }
    },
    async fetchArticle() {
      return savedArticle
    }
  })
  model.categories.value = [{ id: 2, name: '公告' }]
  await model.openCreate()
  Object.assign(model.form, {
    title: savedArticle.title,
    contentMarkdown: savedArticle.contentMarkdown
  })

  assert.equal(await model.saveNews(), true)
  assert.equal(model.rows.value[0].id, 7)
  assert.deepEqual(messages[0], ['success', '资讯已保存'])
})

test('news management owns article actions and their strict payloads', async () => {
  const { calls, model } = createNewsModel()
  const article = {
    id: 1,
    title: '开学通知',
    categoryId: 2,
    sortOrder: 3,
    publishAt: '2026-08-01T10:00:00',
    isPinned: false
  }

  assert.equal(await model.publishNews(article), true)
  assert.equal(await model.togglePin(article), true)
  model.openCategoryChange(article)
  assert.equal(await model.saveArticleCategory(), true)
  model.openSort(article)
  assert.equal(await model.saveSortOrder(), true)
  model.openSchedule(article)
  assert.equal(await model.saveSchedule(), true)

  assert.ok(calls.some(call => call[0] === 'publish' && call[1] === 1))
  assert.ok(calls.some(call => (
    call[0] === 'pin' && call[2].isPinned === true
  )))
  assert.ok(calls.some(call => (
    call[0] === 'article-category' && call[2].categoryId === 2
  )))
  assert.ok(calls.some(call => (
    call[0] === 'article-sort' && call[2].sortOrder === 3
  )))
  assert.ok(calls.some(call => (
    call[0] === 'schedule' && call[2].publishAt === '2026-08-01T10:00:00'
  )))
})

test('news management creates, edits and deletes categories', async () => {
  const { calls, model } = createNewsModel()
  model.openCategoryManager()
  Object.assign(model.categoryForm, { name: ' 新分类 ', sortOrder: 2 })
  assert.equal(await model.saveCategory(), true)

  model.editCategory({ id: 2, name: '公告', sortOrder: 1 })
  model.categoryForm.name = '新公告'
  assert.equal(await model.saveCategory(), true)
  assert.equal(await model.deleteCategory({ id: 2, name: '新公告' }), true)

  assert.ok(calls.some(call => (
    call[0] === 'create-category' && call[1].name === '新分类'
  )))
  assert.ok(calls.some(call => (
    call[0] === 'update-category' && call[1] === 2 && call[2].name === '新公告'
  )))
  assert.ok(calls.some(call => call[0] === 'delete-category' && call[1] === 2))
})

test('news management redirects unauthorized loads', async () => {
  const unauthorized = Object.assign(new Error('未登录'), { status: 401 })
  const { messages, model, navigations } = createNewsModel({
    async fetchCategories() {
      throw unauthorized
    }
  })

  assert.equal(await model.loadData(), false)
  assert.deepEqual(messages, [['error', '登录已过期，请重新登录']])
  assert.deepEqual(navigations, ['/login'])
})

test('news management reports forbidden loads without discarding the session', async () => {
  const forbidden = Object.assign(new Error('无权限'), { status: 403 })
  const { messages, model, navigations } = createNewsModel({
    async fetchCategories() {
      throw forbidden
    }
  })

  assert.equal(await model.loadData(), false)
  assert.deepEqual(messages, [['error', '当前账号无权执行此操作']])
  assert.deepEqual(navigations, [])
})
