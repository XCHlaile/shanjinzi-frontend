import assert from 'node:assert/strict'
import test from 'node:test'

import { usePageManagement } from './usePageManagement.js'

function createPageModel({ apiOverrides = {}, confirm } = {}) {
  const calls = []
  const messages = []
  const api = {
    async fetchPages(params) {
      calls.push(['list', params])
      return {
        records: [
          { id: 1, pageKey: 'about', title: '关于', status: 'PUBLISHED' },
          { id: 2, pageKey: 'help', title: '帮助', status: 'DRAFT' }
        ]
      }
    },
    async createPage(payload) {
      calls.push(['create', payload])
    },
    async updatePage(pageKey, payload) {
      calls.push(['update', pageKey, payload])
    },
    async publishPage(pageKey) {
      calls.push(['publish', pageKey])
    },
    async offlinePage(pageKey) {
      calls.push(['offline', pageKey])
    },
    async exportPages(filter) {
      calls.push(['export', filter])
    },
    ...apiOverrides
  }
  const model = usePageManagement({
    api,
    confirmation: {
      async confirm(...args) {
        calls.push(['confirm', ...args])
        if (confirm) return confirm(...args)
      }
    },
    feedback: {
      error(message) {
        messages.push(['error', message])
      },
      success(message) {
        messages.push(['success', message])
      }
    }
  })

  return { calls, messages, model }
}

test('page management loads, normalizes, and filters page records', async () => {
  const { calls, model } = createPageModel()

  assert.equal(await model.loadData(), true)
  model.keyword.value = '关于'
  model.status.value = 'PUBLISHED'

  assert.deepEqual(calls, [['list', { page: 1, pageSize: 100 }]])
  assert.equal(model.rows.value[0].route, 'about')
  assert.deepEqual(model.filteredRows.value.map(row => row.id), [1])
  assert.equal(model.loading.value, false)
})

test('page management opens and saves create and edit forms', async () => {
  const { calls, messages, model } = createPageModel()

  model.openCreate()
  Object.assign(model.form, {
    route: 'rules',
    title: '平台规则',
    markdown: '# 规则'
  })
  assert.equal(await model.savePage(), true)

  model.openEdit({
    id: 7,
    pageKey: 'rules',
    title: '规则',
    contentMarkdown: '# 旧规则',
    contentHtml: '<h1>规则</h1>',
    status: 'DRAFT'
  })
  model.form.title = '新规则'
  assert.equal(await model.savePage(), true)

  assert.deepEqual(calls, [
    ['create', {
      pageKey: 'rules',
      title: '平台规则',
      contentMarkdown: '# 规则',
      contentHtml: ''
    }],
    ['list', { page: 1, pageSize: 100 }],
    ['update', 'rules', {
      title: '新规则',
      contentMarkdown: '# 旧规则',
      contentHtml: '<h1>规则</h1>'
    }],
    ['list', { page: 1, pageSize: 100 }]
  ])
  assert.deepEqual(messages, [
    ['success', '页面已保存'],
    ['success', '页面已保存']
  ])
  assert.equal(model.dialogVisible.value, false)
  assert.equal(model.saving.value, false)
})

test('page management exports current filters and publishes a page', async () => {
  const { calls, messages, model } = createPageModel()
  model.keyword.value = ' about '
  model.status.value = 'PUBLISHED'

  assert.equal(await model.exportPages(), true)
  assert.equal(await model.publishPage({ pageKey: 'about' }), true)

  assert.deepEqual(calls, [
    ['export', { keyword: 'about', status: 'PUBLISHED' }],
    ['publish', 'about'],
    ['list', { page: 1, pageSize: 100 }]
  ])
  assert.deepEqual(messages, [
    ['success', '页面导出任务已创建'],
    ['success', '页面已发布']
  ])
})

test('page management confirms before taking a page offline', async () => {
  const { calls, model } = createPageModel()

  assert.equal(await model.removePage({ route: 'about', title: '关于' }), true)
  assert.deepEqual(calls, [
    ['confirm', '确认删除页面 关于？', '删除页面', { type: 'warning' }],
    ['offline', 'about'],
    ['list', { page: 1, pageSize: 100 }]
  ])
})

test('page management treats a rejected confirmation as cancellation', async () => {
  const { calls, messages, model } = createPageModel({
    confirm() {
      throw new Error('cancel')
    }
  })

  assert.equal(await model.removePage({ route: 'about', title: '关于' }), false)
  assert.equal(calls.some(([operation]) => operation === 'offline'), false)
  assert.deepEqual(messages, [])
})

test('page management exposes load and validation failures', async () => {
  const { messages, model } = createPageModel({
    apiOverrides: {
      async fetchPages() {
        throw new Error('页面服务不可用')
      }
    }
  })

  assert.equal(await model.loadData(), false)
  assert.equal(model.loadError.value, '页面服务不可用')
  assert.deepEqual(model.rows.value, [])
  assert.equal(await model.savePage(), false)
  assert.deepEqual(messages, [
    ['error', '页面服务不可用'],
    ['error', '请填写路由和标题']
  ])
})
