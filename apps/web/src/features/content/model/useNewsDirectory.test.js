import assert from 'node:assert/strict'
import test from 'node:test'

import { useNewsDirectory } from './useNewsDirectory.js'

test('news directory loads sorted categories and the first page', async () => {
  const calls = []
  const directory = useNewsDirectory({
    api: {
      async fetchPublicNewsCategories() {
        calls.push('categories')
        return {
          items: [
            { id: 2, name: '园所动态', sortOrder: 20 },
            { id: 1, name: '行业政策', sortOrder: 10 }
          ]
        }
      },
      async fetchPublicNews(query) {
        calls.push(['news', query])
        return {
          items: [{ id: 8, title: '新规发布', isPinned: true }],
          total: 21,
          totalPages: 2
        }
      }
    }
  })

  await directory.initialize()

  assert.deepEqual(calls, [
    'categories',
    ['news', { page: 1, pageSize: 20 }]
  ])
  assert.deepEqual(directory.categoryOptions.value.map(item => item.name), [
    '全部',
    '行业政策',
    '园所动态'
  ])
  assert.equal(directory.newsItems.value[0].title, '新规发布')
  assert.equal(directory.total.value, 21)
  assert.equal(directory.totalPages.value, 2)
})

test('news directory filters categories and changes pages', async () => {
  const calls = []
  const directory = useNewsDirectory({
    api: {
      async fetchPublicNews(query) {
        calls.push(query)
        return { items: [], total: 0, totalPages: 3 }
      }
    }
  })

  await directory.selectCategory(4)
  await directory.changePage(2)

  assert.deepEqual(calls, [
    { page: 1, pageSize: 20, categoryId: 4 },
    { page: 2, pageSize: 20, categoryId: 4 }
  ])
  assert.equal(directory.activeCategoryId.value, 4)
  assert.equal(directory.page.value, 2)
})

test('news directory loads, caches, and collapses article details', async () => {
  let requestCount = 0
  const directory = useNewsDirectory({
    api: {
      async fetchPublicNewsDetail(id) {
        requestCount += 1
        return { id, contentHtml: '<p>新闻&nbsp;正文</p>' }
      }
    }
  })
  const item = { id: 6 }

  await directory.toggleArticle(item)
  assert.equal(directory.detailsById.value[6].contentText, '新闻 正文')

  await directory.toggleArticle(item)
  await directory.toggleArticle(item)

  assert.equal(requestCount, 1)
  assert.equal(directory.expandedId.value, 6)
  assert.equal(directory.detailLoadingId.value, null)
})

test('news directory exposes category, list, and detail errors', async () => {
  const directory = useNewsDirectory({
    api: {
      async fetchPublicNewsCategories() {
        throw new Error('分类不可用')
      },
      async fetchPublicNews() {
        throw new Error('列表不可用')
      },
      async fetchPublicNewsDetail() {
        throw new Error('正文不可用')
      }
    }
  })

  await directory.initialize()
  await directory.toggleArticle({ id: 3 })

  assert.equal(directory.categoryError.value, '新闻分类加载失败：分类不可用')
  assert.equal(directory.loadError.value, '列表不可用')
  assert.equal(directory.detailErrors.value[3], '正文不可用')
  assert.equal(directory.loading.value, false)
})
