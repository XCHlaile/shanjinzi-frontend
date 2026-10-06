import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useMessageCenterSync } from './useMessageCenterSync.js'

function createSyncModel({
  status = 'disconnected',
  channel = 'messages',
  activeConversation = null
} = {}) {
  const calls = []
  let realtimeOptions
  let scheduledRefresh
  const model = useMessageCenterSync({
    activeChannel: ref(channel),
    activeConversation: ref(activeConversation),
    applyPushedMessage: event => calls.push(['event', event]),
    loadConversations: options => calls.push(['conversations', options]),
    loadMessages: options => calls.push(['messages', options]),
    loadNotifications: options => calls.push(['notifications', options]),
    loadNotificationUnreadCount: () => calls.push(['notification-count']),
    loadUnreadCount: () => calls.push(['message-count']),
    createRealtime(options) {
      realtimeOptions = options
      return {
        connectMessageRealtime: () => calls.push(['connect']),
        realtimeStatus: ref(status),
        syncRealtimeAccessToken: async () => calls.push(['sync-token'])
      }
    },
    setupLiveRefresh(refresh, options) {
      scheduledRefresh = refresh
      calls.push(['live-refresh', options])
      return { trigger: refresh }
    }
  })
  return {
    calls,
    getRealtimeOptions: () => realtimeOptions,
    getScheduledRefresh: () => scheduledRefresh,
    model
  }
}

test('message center sync skips polling while realtime is connected', async () => {
  const { calls, model } = createSyncModel({ status: 'connected' })

  assert.equal(await model.refreshMessageCenter(), false)

  assert.deepEqual(calls, [
    ['live-refresh', { interval: 3000 }],
    ['sync-token']
  ])
})

test('message center sync refreshes active notification and message state', async () => {
  const { calls, model } = createSyncModel({
    status: 'connected',
    channel: 'notifications',
    activeConversation: { conversationId: 7 }
  })

  assert.equal(await model.refreshMessageCenter({ force: true }), true)

  assert.deepEqual(calls, [
    ['live-refresh', { interval: 3000 }],
    ['sync-token'],
    ['conversations', { silent: true }],
    ['message-count'],
    ['notification-count'],
    ['notifications', { silent: true }],
    ['messages', { silent: true }]
  ])
})

test('message center sync wires realtime refresh and initial loading', async () => {
  const {
    calls,
    getRealtimeOptions,
    getScheduledRefresh,
    model
  } = createSyncModel()

  model.initializeMessageCenter()
  getRealtimeOptions().onEvent({ eventType: 'MESSAGE_CREATED' })
  await getRealtimeOptions().onRefresh()
  await getScheduledRefresh()()

  assert.deepEqual(calls.slice(1, 6), [
    ['conversations', undefined],
    ['message-count'],
    ['notification-count'],
    ['connect'],
    ['event', { eventType: 'MESSAGE_CREATED' }]
  ])
  assert.equal(
    calls.filter(call => call[0] === 'conversations').length,
    3
  )
})
