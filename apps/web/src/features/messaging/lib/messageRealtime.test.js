import assert from 'node:assert/strict'
import test from 'node:test'

import {
  MESSAGE_STOMP_DESTINATION,
  createMessageRealtimeClient,
  parseMessageRealtimeEvent,
  resolveMessageBrokerUrl
} from './messageRealtime.js'

test('resolves the configured STOMP broker URL for local, LAN, and HTTPS deployments', () => {
  assert.equal(
    resolveMessageBrokerUrl({}, { origin: 'http://localhost:3064' }),
    'ws://localhost:3064/ws/messages'
  )
  assert.equal(
    resolveMessageBrokerUrl({ VITE_MESSAGE_WS_URL: 'ws://localhost:3002/ws/messages' }),
    'ws://localhost:3002/ws/messages'
  )
  assert.equal(
    resolveMessageBrokerUrl({ VITE_API_BASE: 'https://example.com' }),
    'wss://example.com/ws/messages'
  )
})

test('parses the backend event envelope and rejects incomplete events', () => {
  const event = parseMessageRealtimeEvent(JSON.stringify({
    eventId: 'evt-2',
    eventType: 'MESSAGE_CREATED',
    conversationId: 7,
    data: { message: { messageId: 100 } }
  }))
  assert.equal(event.eventType, 'MESSAGE_CREATED')
  assert.equal(event.data.message.messageId, 100)
  assert.throws(() => parseMessageRealtimeEvent('{}'), /eventType/)
})

test('connects with the access token, subscribes once, and de-duplicates events', async () => {
  const statuses = []
  const events = []
  const errors = []
  let fakeClient

  class FakeClient {
    constructor(config) {
      Object.assign(this, config)
      fakeClient = this
    }
    activate() {
      this.active = true
      this.beforeConnect()
    }
    subscribe(destination, callback, headers) {
      this.destination = destination
      this.subscriptionCallback = callback
      this.subscriptionHeaders = headers
      return { unsubscribe: () => { this.unsubscribed = true } }
    }
    async deactivate() {
      this.active = false
    }
  }

  const realtime = createMessageRealtimeClient({
    brokerURL: 'ws://localhost:3002/ws/messages',
    getAccessToken: () => 'access-token',
    onStatusChange: state => statuses.push(state.status),
    onEvent: event => events.push(event),
    onError: error => errors.push(error.message),
    ClientImpl: FakeClient
  })

  realtime.activate()
  assert.deepEqual(fakeClient.connectHeaders, { Authorization: 'Bearer access-token' })
  fakeClient.onConnect()
  assert.equal(fakeClient.destination, MESSAGE_STOMP_DESTINATION)
  assert.deepEqual(fakeClient.subscriptionHeaders, { ack: 'auto' })

  const frame = { body: JSON.stringify({ eventId: 'evt-1', eventType: 'MESSAGE_CREATED', data: {} }) }
  fakeClient.subscriptionCallback(frame)
  fakeClient.subscriptionCallback(frame)
  assert.equal(events.length, 1)
  assert.deepEqual(statuses.slice(0, 3), ['connecting', 'connecting', 'connected'])
  assert.deepEqual(errors, [])

  await realtime.deactivate()
  assert.equal(fakeClient.unsubscribed, true)
  assert.equal(statuses.at(-1), 'disconnected')
})
