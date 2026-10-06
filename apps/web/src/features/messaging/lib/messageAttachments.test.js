import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MESSAGE_ATTACHMENT_CACHE_KEY,
  mergeMessageAttachmentCache,
  readMessageAttachmentCache,
  resolveMessageAttachmentMedia,
  writeMessageAttachmentCache
} from './messageAttachments.js'

test('resolves message media from supported response fields', () => {
  const attachments = [{ fileId: 24, url: '/uploads/photo.png', mediaType: 'IMAGE' }]

  assert.deepEqual(resolveMessageAttachmentMedia({ attachmentFiles: attachments }), attachments)
  assert.deepEqual(resolveMessageAttachmentMedia({ attachments }), attachments)
  assert.deepEqual(resolveMessageAttachmentMedia({ media: attachments }), attachments)
  assert.deepEqual(resolveMessageAttachmentMedia({ attachmentFileIds: attachments }), attachments)
})

test('resolves attachment ids from upload metadata cache in message order', () => {
  const cache = {
    24: { fileId: 24, url: '/uploads/photo.png', mimeType: 'image/png' },
    25: { fileId: 25, url: '/uploads/video.mp4', mimeType: 'video/mp4' }
  }

  assert.deepEqual(
    resolveMessageAttachmentMedia({ attachmentFileIds: [25, 24] }, cache),
    [cache[25], cache[24]]
  )
})

test('stores only serializable attachment metadata', () => {
  const memory = new Map()
  const storage = {
    getItem: key => memory.get(key) || null,
    setItem: (key, value) => memory.set(key, value)
  }
  const cached = mergeMessageAttachmentCache({}, [{
    fileId: 24,
    url: '/uploads/photo.png',
    originalName: 'photo.png',
    mimeType: 'image/png',
    ignored: 'value'
  }])

  writeMessageAttachmentCache(cached, storage)
  const restored = readMessageAttachmentCache(storage)

  assert.equal(JSON.parse(memory.get(MESSAGE_ATTACHMENT_CACHE_KEY))['24'].ignored, undefined)
  assert.equal(restored['24'].url, '/uploads/photo.png')
  assert.equal(restored['24'].mimeType, 'image/png')
})
