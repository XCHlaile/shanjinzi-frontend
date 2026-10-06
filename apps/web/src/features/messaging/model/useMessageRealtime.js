import { onBeforeUnmount, ref } from 'vue'

import { createDefaultMessageRealtimeClient } from '../lib/messageRealtime.js'

export function createMessageRealtimeController({
  getAccessToken,
  createClient = createDefaultMessageRealtimeClient,
  onEvent = () => {},
  onRefresh = () => {},
  onStatusChange = () => {},
  setTimer = setTimeout,
  clearTimer = clearTimeout
} = {}) {
  let client = null
  let accessToken = ''
  let refreshTimer = null

  function updateStatus(status) {
    onStatusChange(status)
  }

  function scheduleRefresh() {
    if (refreshTimer !== null) clearTimer(refreshTimer)
    refreshTimer = setTimer(() => {
      refreshTimer = null
      void onRefresh()
    }, 60)
  }

  function handleEvent(event) {
    onEvent(event)
    scheduleRefresh()
  }

  async function syncAccessToken() {
    if (!client) return
    const currentToken = getAccessToken()
    if (currentToken === accessToken) return
    accessToken = currentToken
    if (currentToken) await client.reconnect()
    else await client.deactivate()
  }

  function connect() {
    accessToken = getAccessToken()
    if (!accessToken) {
      updateStatus('disconnected')
      return
    }
    try {
      client = createClient({
        getAccessToken,
        onEvent: handleEvent,
        onStatusChange(state) {
          updateStatus(state.status)
        }
      })
      client.activate()
    } catch {
      updateStatus('error')
    }
  }

  async function stop() {
    if (refreshTimer !== null) clearTimer(refreshTimer)
    refreshTimer = null
    await client?.deactivate()
  }

  return {
    connect,
    stop,
    syncAccessToken
  }
}

export function useMessageRealtime(options = {}) {
  const realtimeStatus = ref('connecting')
  const controller = createMessageRealtimeController({
    ...options,
    onStatusChange(status) {
      realtimeStatus.value = status
      options.onStatusChange?.(status)
    }
  })

  onBeforeUnmount(() => {
    void controller.stop()
  })

  return {
    realtimeStatus,
    connectMessageRealtime: controller.connect,
    syncRealtimeAccessToken: controller.syncAccessToken
  }
}
