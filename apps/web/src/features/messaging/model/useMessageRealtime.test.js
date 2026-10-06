import assert from 'node:assert/strict'
import test from 'node:test'

import { createMessageRealtimeController } from './useMessageRealtime.js'

test('message realtime controller connects, refreshes, and follows token changes', async () => {
  let token = 'token-1'
  let clientOptions
  const calls = []
  let scheduled
  const controller = createMessageRealtimeController({
    getAccessToken: () => token,
    createClient(options) {
      clientOptions = options
      return {
        activate() {
          calls.push('activate')
          options.onStatusChange({ status: 'connected' })
        },
        reconnect() {
          calls.push('reconnect')
          return Promise.resolve()
        },
        deactivate() {
          calls.push('deactivate')
          return Promise.resolve()
        }
      }
    },
    onEvent: event => calls.push(event.eventType),
    onRefresh: () => calls.push('refresh'),
    onStatusChange: status => calls.push(status),
    setTimer(callback) {
      scheduled = callback
      return 1
    },
    clearTimer: () => {}
  })

  controller.connect()
  clientOptions.onEvent({ eventType: 'MESSAGE_CREATED' })
  scheduled()
  token = 'token-2'
  await controller.syncAccessToken()
  token = ''
  await controller.syncAccessToken()
  await controller.stop()

  assert.deepEqual(calls, [
    'activate',
    'connected',
    'MESSAGE_CREATED',
    'refresh',
    'reconnect',
    'deactivate',
    'deactivate'
  ])
})

test('message realtime controller stays disconnected without a token', () => {
  const statuses = []
  const controller = createMessageRealtimeController({
    getAccessToken: () => '',
    onStatusChange: status => statuses.push(status)
  })

  controller.connect()

  assert.deepEqual(statuses, ['disconnected'])
})
