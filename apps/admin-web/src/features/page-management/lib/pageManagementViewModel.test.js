import assert from 'node:assert/strict'
import test from 'node:test'

import {
  adminPageForm,
  adminPageItems,
  adminPagePayload,
  emptyAdminPageForm,
  matchesAdminPage,
  normalizeAdminPage,
  shortAdminPageDate
} from './pageManagementViewModel.js'

test('page management view model normalizes list records and edit forms', () => {
  const row = {
    id: 1,
    pageKey: 'about',
    title: '关于我们',
    contentMarkdown: '# 关于',
    contentHtml: '<h1>关于</h1>',
    status: 'PUBLISHED'
  }

  assert.equal(adminPageItems({ records: [row] })[0], row)
  assert.deepEqual(adminPageItems(null), [])
  assert.deepEqual(normalizeAdminPage(row), {
    ...row,
    route: 'about',
    markdown: '# 关于'
  })
  assert.deepEqual(adminPageForm(row), {
    route: 'about',
    title: '关于我们',
    markdown: '# 关于',
    contentHtml: '<h1>关于</h1>',
    status: 'PUBLISHED'
  })
  assert.deepEqual(emptyAdminPageForm(), {
    route: '',
    title: '',
    markdown: '',
    contentHtml: '',
    status: 'DRAFT'
  })
})

test('page management view model builds strict create and update payloads', () => {
  const form = {
    route: 'about',
    title: '关于我们',
    markdown: '# 关于',
    contentHtml: '<h1>关于</h1>',
    status: 'PUBLISHED'
  }

  assert.deepEqual(adminPagePayload(form, { includeKey: true }), {
    pageKey: 'about',
    title: '关于我们',
    contentMarkdown: '# 关于',
    contentHtml: '<h1>关于</h1>'
  })
  assert.deepEqual(adminPagePayload(form), {
    title: '关于我们',
    contentMarkdown: '# 关于',
    contentHtml: '<h1>关于</h1>'
  })
})

test('page management view model filters rows and formats timestamps', () => {
  const row = { route: 'about', title: '关于我们', status: 'PUBLISHED' }

  assert.equal(matchesAdminPage(row, { keyword: '关于', status: 'PUBLISHED' }), true)
  assert.equal(matchesAdminPage(row, { keyword: 'help' }), false)
  assert.equal(matchesAdminPage(row, { status: 'DRAFT' }), false)
  assert.equal(shortAdminPageDate('2026-07-31T12:34:56.000Z'), '2026-07-31 12:34:56')
  assert.equal(shortAdminPageDate(''), '')
})
