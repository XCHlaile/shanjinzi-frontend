import assert from 'node:assert/strict'
import test from 'node:test'

import { handleAdminAuthorizationError } from './adminAuthorization.js'

function fixture() {
  const messages = []
  let unauthorized = 0
  return {
    messages,
    get unauthorized() { return unauthorized },
    options: {
      feedback: { error: message => messages.push(message) },
      onUnauthorized: () => { unauthorized += 1 }
    }
  }
}

test('admin authorization redirects only expired sessions', () => {
  const expired = fixture()
  assert.equal(handleAdminAuthorizationError({ status: 401 }, expired.options), true)
  assert.equal(expired.unauthorized, 1)
  assert.deepEqual(expired.messages, ['登录已过期，请重新登录'])

  const forbidden = fixture()
  assert.equal(handleAdminAuthorizationError({ status: 403 }, forbidden.options), true)
  assert.equal(forbidden.unauthorized, 0)
  assert.deepEqual(forbidden.messages, ['当前账号无权执行此操作'])
})

test('admin authorization ignores non-authorization errors', () => {
  const state = fixture()
  assert.equal(handleAdminAuthorizationError({ status: 500 }, state.options), false)
  assert.equal(state.unauthorized, 0)
  assert.deepEqual(state.messages, [])
})
