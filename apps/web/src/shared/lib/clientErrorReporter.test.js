import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createClientErrorReporter,
  installBrowserErrorReporting
} from '../../../../../config/clientErrorReporter.mjs'

test('reports a privacy-limited client error envelope to an optional collector', async () => {
  const calls = []
  const reporter = createClientErrorReporter({
    endpoint: 'https://errors.example.test/events',
    release: 'web-42',
    pageLocation: { pathname: '/school/students', search: '?token=secret' },
    now: () => '2026-08-03T00:00:00.000Z',
    fetchImpl: async (url, options) => calls.push({ url, options })
  })

  const error = new Error('加载失败')
  error.traceId = 'trace-1'
  const event = reporter(error, { kind: 'api', info: 'load roster' })
  await Promise.resolve()

  assert.equal(event.route, '/school/students')
  assert.equal(event.traceId, 'trace-1')
  assert.equal(event.release, 'web-42')
  assert.equal(calls[0].url, 'https://errors.example.test/events')
  assert.equal(calls[0].options.credentials, 'omit')
  assert.doesNotMatch(calls[0].options.body, /token=secret/)
})

test('installs Vue, window and unhandled rejection capture hooks', () => {
  const listeners = {}
  const app = { config: {} }
  const browserWindow = {
    location: { pathname: '/' },
    addEventListener(name, listener) { listeners[name] = listener }
  }

  const reporter = installBrowserErrorReporting(app, { browserWindow })

  assert.equal(typeof reporter, 'function')
  assert.equal(typeof app.config.errorHandler, 'function')
  assert.equal(typeof listeners.error, 'function')
  assert.equal(typeof listeners.unhandledrejection, 'function')
})
