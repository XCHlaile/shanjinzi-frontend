import assert from 'node:assert/strict'
import test from 'node:test'

import { createLatestRequestGuard, createRequestDeduper, createTimeoutSignal, createTtlCache, mapWithConcurrency } from '../../../../../config/asyncRuntime.mjs'
import { normalizeErrorState, userErrorMessage } from '../../../../../config/errorState.mjs'

test('normalizes transport and HTTP failures into recoverable UI states', () => {
  assert.deepEqual(normalizeErrorState({ status: 403, message: '无权查看' }), {
    kind: 'forbidden',
    title: '当前账号没有权限',
    message: '无权查看',
    hint: '',
    retryable: false,
    status: 403
  })
  assert.equal(normalizeErrorState(new TypeError('Failed to fetch')).kind, 'network')
  assert.equal(normalizeErrorState({ status: 503 }).retryable, true)
  assert.equal(userErrorMessage(null, '加载失败'), '加载失败')
})

test('latest request guard rejects stale commits', () => {
  const guard = createLatestRequestGuard()
  const first = guard.begin()
  const second = guard.begin()
  let value = ''
  assert.equal(first.commit(() => { value = 'stale' }), false)
  assert.equal(second.commit(() => { value = 'latest' }), true)
  assert.equal(value, 'latest')
})

test('dedupes identical work and bounds concurrent mapping', async () => {
  const dedupe = createRequestDeduper()
  let calls = 0
  const first = dedupe('same', async () => { calls += 1; return 7 })
  const second = dedupe('same', async () => { calls += 1; return 8 })
  assert.equal(await first, 7)
  assert.equal(await second, 7)
  assert.equal(calls, 1)

  let active = 0
  let peak = 0
  const values = await mapWithConcurrency([1, 2, 3, 4], async value => {
    active += 1
    peak = Math.max(peak, active)
    await Promise.resolve()
    active -= 1
    return value * 2
  }, 2)
  assert.deepEqual(values, [2, 4, 6, 8])
  assert.equal(peak, 2)
})

test('aborts slow work with an explicit timeout reason', async () => {
  const timeout = createTimeoutSignal(5)
  await new Promise(resolve => timeout.signal.addEventListener('abort', resolve, { once: true }))
  assert.equal(timeout.didTimeout(), true)
  assert.equal(timeout.signal.reason?.name, 'TimeoutError')
  timeout.cleanup()
})

test('reuses bounded TTL cache values and expires stale entries', async () => {
  let timestamp = 100
  let calls = 0
  const cache = createTtlCache({ ttlMs: 10, maxEntries: 2, now: () => timestamp })

  assert.equal(await cache.getOrLoad('student-1', async () => ++calls), 1)
  assert.equal(await cache.getOrLoad('student-1', async () => ++calls), 1)
  assert.equal(calls, 1)

  timestamp = 111
  assert.equal(await cache.getOrLoad('student-1', async () => ++calls), 2)
  cache.set('student-2', 2)
  cache.set('student-3', 3)
  assert.equal(cache.get('student-1'), undefined)
})

test('does not restore an in-flight cache value after invalidation', async () => {
  const cache = createTtlCache()
  let release
  const staleRequest = cache.getOrLoad('student-1', () => new Promise(resolve => {
    release = resolve
  }))
  await Promise.resolve()

  cache.clear()
  release('stale')
  assert.equal(await staleRequest, 'stale')
  assert.equal(cache.get('student-1'), undefined)
})
