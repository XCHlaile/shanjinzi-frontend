import assert from 'node:assert/strict'
import test from 'node:test'

import { virtualListRange } from './virtualList.js'

test('renders only the visible slice with a bounded overscan', () => {
  assert.deepEqual(virtualListRange({
    itemCount: 1000,
    itemHeight: 64,
    scrollTop: 6400,
    viewportHeight: 640,
    overscan: 3
  }), {
    start: 97,
    end: 113,
    offset: 6208,
    totalHeight: 64000
  })
})

test('clamps virtual ranges at both list boundaries', () => {
  assert.deepEqual(virtualListRange({
    itemCount: 3,
    itemHeight: 70,
    scrollTop: 1000,
    viewportHeight: 300,
    overscan: 5
  }), {
    start: 3,
    end: 3,
    offset: 210,
    totalHeight: 210
  })
})
