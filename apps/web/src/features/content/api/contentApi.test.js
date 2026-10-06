import assert from 'node:assert/strict'
import test from 'node:test'

import { createContentApi } from './contentApi.js'

test('content API owns public page and news requests', async () => {
  const calls = []
  const api = createContentApi({
    get(path, options) {
      calls.push({ path, options })
      return Promise.resolve({ ok: true })
    }
  })

  await api.fetchPublicPage('about us')
  await api.fetchNews({ page: 2, pageSize: 4 })
  await api.fetchPublicNewsDetail(9)
  await api.fetchPublicNewsCategories()

  assert.deepEqual(calls, [
    { path: '/api/public/page-contents/about%20us', options: undefined },
    { path: '/api/public/news-articles', options: { query: { page: 2, pageSize: 4 } } },
    { path: '/api/public/news-articles/9', options: undefined },
    { path: '/api/public/news-articles/categories', options: undefined }
  ])
  assert.ok(Object.isFrozen(api))
})
