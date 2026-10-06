import assert from 'node:assert/strict'
import test from 'node:test'

import { saveBrowserFile } from './browserDownload.js'

test('browser download saves the blob and always revokes its object URL', () => {
  const calls = []
  const anchor = {
    click() {
      calls.push('click')
    },
    remove() {
      calls.push('remove')
    }
  }
  const filename = saveBrowserFile(
    { blob: new Blob(['csv']), filename: 'users.csv' },
    'fallback.csv',
    {
      urlApi: {
        createObjectURL(blob) {
          calls.push(['create-url', blob.size])
          return 'blob:test'
        },
        revokeObjectURL(url) {
          calls.push(['revoke-url', url])
        }
      },
      documentRef: {
        createElement(tag) {
          calls.push(['create-element', tag])
          return anchor
        },
        body: {
          appendChild(element) {
            calls.push(['append', element.href, element.download])
          }
        }
      }
    }
  )

  assert.equal(filename, 'users.csv')
  assert.deepEqual(calls, [
    ['create-url', 3],
    ['create-element', 'a'],
    ['append', 'blob:test', 'users.csv'],
    'click',
    'remove',
    ['revoke-url', 'blob:test']
  ])
})

test('browser download rejects responses without file content', () => {
  assert.throws(
    () => saveBrowserFile({}, 'fallback.csv'),
    /下载文件内容缺失/
  )
})
