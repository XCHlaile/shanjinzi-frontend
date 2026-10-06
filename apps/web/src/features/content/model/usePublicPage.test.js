import assert from 'node:assert/strict'
import test from 'node:test'

import { usePublicPage } from './usePublicPage.js'

test('public page model loads content for its configured key', async () => {
  const calls = []
  const page = usePublicPage('about', {
    api: {
      async fetchPublicPage(pageKey) {
        calls.push(pageKey)
        return { title: '关于我们', contentMarkdown: '正文' }
      }
    }
  })

  assert.deepEqual(await page.loadPublicPage(), {
    title: '关于我们',
    contentMarkdown: '正文'
  })
  assert.deepEqual(calls, ['about'])
  assert.equal(page.publicPage.value.title, '关于我们')
  assert.equal(page.error.value, '')
  assert.equal(page.loading.value, false)
})

test('public page model clears stale content and exposes load failures', async () => {
  const page = usePublicPage('home', {
    api: {
      async fetchPublicPage() {
        throw new Error('内容服务不可用')
      }
    }
  })
  page.publicPage.value = { title: '旧内容' }

  assert.equal(await page.loadPublicPage(), null)
  assert.equal(page.publicPage.value, null)
  assert.equal(page.error.value, '内容服务不可用')
  assert.equal(page.loading.value, false)
})
