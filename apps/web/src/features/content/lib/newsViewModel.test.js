import assert from 'node:assert/strict'
import test from 'node:test'

import {
  normalizePublicNewsArticle,
  normalizePublicNewsCategory,
  publicNewsContentText,
  publicNewsItems
} from './newsViewModel.js'

test('public news presentation normalizes categories and articles', () => {
  assert.deepEqual(normalizePublicNewsCategory({
    id: 2,
    code: 'POLICY',
    sortOrder: '5'
  }), {
    id: 2,
    code: 'POLICY',
    name: 'POLICY',
    sortOrder: 5
  })
  assert.deepEqual(normalizePublicNewsArticle({
    id: 8,
    categoryId: 2,
    title: '新规发布',
    isPinned: 1
  }), {
    id: 8,
    categoryId: 2,
    categoryName: '',
    title: '新规发布',
    summary: '',
    isPinned: true,
    publishAt: '',
    createdAt: ''
  })
  assert.deepEqual(publicNewsItems({ records: [{ id: 1 }] }), [{ id: 1 }])
})

test('public news presentation converts supported html to readable text', () => {
  assert.equal(
    publicNewsContentText('<p>第一段&nbsp;&amp;</p><p>第二段<br>继续</p>'),
    '第一段 &\n第二段\n继续'
  )
  assert.equal(publicNewsContentText('&lt;安全&gt;'), '<安全>')
})
