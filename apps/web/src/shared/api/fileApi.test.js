import assert from 'node:assert/strict'
import test from 'node:test'

import { createFileApi } from './fileApi.js'

test('file API owns multipart uploads and source type normalization', async () => {
  const calls = []
  const api = createFileApi({
    post(path, data) {
      calls.push({ path, data })
      return Promise.resolve({ ok: true })
    }
  })
  const file = new Blob(['avatar'], { type: 'image/png' })

  await api.uploadFile({ file, sourceType: 'PROFILE AVATAR' })

  assert.equal(calls[0].path, '/api/app/files?sourceType=profile%20avatar')
  assert.ok(calls[0].data instanceof FormData)
  assert.deepEqual([...calls[0].data.keys()], ['file'])
  assert.ok(Object.isFrozen(api))
})
