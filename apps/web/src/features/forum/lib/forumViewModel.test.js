import assert from 'node:assert/strict'
import test from 'node:test'

import {
  FORUM_TOPIC_TAGS,
  forumAuthorInitial,
  forumAuthorName,
  forumFileIds,
  forumPageItems,
  forumRoleLabel,
  isForumAuthor,
  mergeForumRecords,
  resolveForumMedia,
  sortForumReplies
} from '../index.js'

test('forum view model exposes stable labels and author identity rules', () => {
  assert.equal(FORUM_TOPIC_TAGS.includes('育儿交流'), true)
  assert.equal(forumAuthorName({ displayName: '林老师' }), '林老师')
  assert.equal(forumAuthorInitial({ displayName: '林老师' }), '林')
  assert.equal(forumRoleLabel('SCHOOL_ADMIN'), '校方')
  assert.equal(isForumAuthor({ userId: 7 }, { id: '7' }), true)
  assert.equal(isForumAuthor({ displayName: '王家长' }, { nickname: '王家长' }), true)
  assert.equal(isForumAuthor({ displayName: '其他人' }, { nickname: '王家长' }), false)
})

test('forum view model normalizes pages, media, and reply ordering', () => {
  const existing = [{ replyId: 2, content: '旧内容', createdAt: '2026-07-31T10:02:00Z' }]
  const incoming = [
    { replyId: 2, content: '新内容', createdAt: '2026-07-31T10:02:00Z' },
    { replyId: 1, content: '第一条', createdAt: '2026-07-31T10:01:00Z' }
  ]
  const merged = mergeForumRecords(existing, incoming, 'replyId')

  assert.deepEqual(forumPageItems({ records: incoming }), incoming)
  assert.deepEqual(sortForumReplies(merged).map(item => item.replyId), [1, 2])
  assert.equal(merged.find(item => item.replyId === 2).content, '新内容')
  assert.deepEqual(forumFileIds([{ fileId: '11' }, { fileId: 'invalid' }]), [11])
  assert.deepEqual(resolveForumMedia({ media: ['summary'] }, { media: ['detail'] }), ['detail'])
  assert.deepEqual(resolveForumMedia({ media: ['summary'] }), ['summary'])
  assert.deepEqual(resolveForumMedia({ media: ['summary'] }, null), ['summary'])
})
