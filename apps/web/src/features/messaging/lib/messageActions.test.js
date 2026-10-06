import assert from 'node:assert/strict'
import test from 'node:test'

import {
  canRecallMessage,
  createClientMessageId,
  isOwnMessage
} from './messageActions.js'

test('creates client ids with native UUID support and a deterministic fallback', () => {
  assert.equal(
    createClientMessageId({ cryptoImpl: { randomUUID: () => 'native-id' } }),
    'native-id'
  )

  const fallback = createClientMessageId({
    cryptoImpl: null,
    random: () => 0.5
  })
  assert.match(fallback, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
})

test('allows only the sender to recall a recent message', () => {
  const now = Date.parse('2026-07-31T10:05:00.000Z')
  const recent = {
    sender: { id: 7 },
    createdAt: '2026-07-31T10:01:00.000Z'
  }

  assert.equal(isOwnMessage(recent, '7'), true)
  assert.equal(canRecallMessage(recent, '7', now), true)
  assert.equal(canRecallMessage(recent, '8', now), false)
  assert.equal(canRecallMessage({ ...recent, recalledAt: 'now' }, '7', now), false)
  assert.equal(canRecallMessage({
    ...recent,
    createdAt: '2026-07-31T09:59:00.000Z'
  }, '7', now), false)
})
