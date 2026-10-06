import assert from 'node:assert/strict'
import test from 'node:test'

import { createPageManagementApi } from './pageManagementApi.js'

test('page management api adapts page operations and export filters', async () => {
  const calls = []
  const managementApi = Object.fromEntries([
    'listPages',
    'createPage',
    'updatePage',
    'publishPage',
    'offlinePage'
  ].map(operation => [operation, async (...args) => {
    calls.push([operation, ...args])
    return { operation }
  }]))
  const api = createPageManagementApi({
    managementApi,
    async createExport(...args) {
      calls.push(['createExport', ...args])
      return { id: 9 }
    }
  })

  await api.fetchPages({ page: 1 })
  await api.createPage({ pageKey: 'about' })
  await api.updatePage('about', { title: '关于' })
  await api.publishPage('about')
  await api.offlinePage('about')
  assert.deepEqual(await api.exportPages({ status: 'PUBLISHED' }), { id: 9 })

  assert.deepEqual(calls, [
    ['listPages', { page: 1 }],
    ['createPage', { pageKey: 'about' }],
    ['updatePage', 'about', { title: '关于' }],
    ['publishPage', 'about'],
    ['offlinePage', 'about'],
    ['createExport', 'PAGES', { status: 'PUBLISHED' }]
  ])
})
