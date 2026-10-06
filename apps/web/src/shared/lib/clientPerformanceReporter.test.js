import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createClientPerformanceReporter,
  normalizeMetricPath,
  performanceRating
} from '../../../../../config/clientPerformanceReporter.mjs'

test('removes identifiers and query data from measured routes', () => {
  assert.equal(
    normalizeMetricPath('https://example.test/api/public/students/42?phone=13800138000'),
    '/api/public/students/:id'
  )
  assert.equal(
    normalizeMetricPath('/messages/550e8400-e29b-41d4-a716-446655440000'),
    '/messages/:id'
  )
})

test('uses current Core Web Vitals ratings', () => {
  assert.equal(performanceRating('LCP', 2500), 'good')
  assert.equal(performanceRating('LCP', 4000), 'needs-improvement')
  assert.equal(performanceRating('INP', 501), 'poor')
  assert.equal(performanceRating('CLS', 0.1), 'good')
})

test('batches field metrics and derives the API error rate', () => {
  const reports = []
  const reporter = createClientPerformanceReporter({
    endpoint: 'https://metrics.example.test/rum',
    pageLocation: { pathname: '/school/students/18' },
    beaconImpl(_url, body) {
      reports.push(JSON.parse(body))
      return true
    },
    now: () => '2026-08-07T00:00:00.000Z'
  })
  reporter.record({
    name: 'api.duration', value: 120, unit: 'ms',
    context: { method: 'GET', path: '/api/public/students/18?token=secret', outcome: 'success' }
  })
  reporter.record({
    name: 'api.duration', value: 300, unit: 'ms',
    context: { method: 'GET', path: '/api/public/students/19', outcome: 'error', status: 503 }
  })

  const envelope = reporter.flush('test')

  assert.equal(envelope.metrics.at(-1).name, 'api.error_rate')
  assert.equal(envelope.metrics.at(-1).value, 0.5)
  assert.equal(envelope.metrics[0].route, '/school/students/:id')
  assert.equal(envelope.metrics[0].context.path, '/api/public/students/:id')
  assert.equal(reports.length, 1)
})
