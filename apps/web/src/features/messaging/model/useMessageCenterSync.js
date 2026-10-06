import { getUserToken } from '../../../shared/api/httpClient.js'
import { useLiveRefresh } from '../../../shared/composables/liveRefresh.js'
import { useMessageRealtime } from './useMessageRealtime.js'

export function useMessageCenterSync({
  activeChannel,
  activeConversation,
  applyPushedMessage,
  loadConversations,
  loadMessages,
  loadNotifications,
  loadNotificationUnreadCount,
  loadUnreadCount,
  getAccessToken = getUserToken,
  createRealtime = useMessageRealtime,
  setupLiveRefresh = useLiveRefresh
}) {
  async function refreshMessageCenter({ force = false } = {}) {
    await realtime.syncRealtimeAccessToken()
    if (!force && realtime.realtimeStatus.value === 'connected') return false
    await Promise.all([
      loadConversations({ silent: true }),
      loadUnreadCount(),
      loadNotificationUnreadCount(),
      activeChannel.value === 'notifications'
        ? loadNotifications({ silent: true })
        : Promise.resolve()
    ])
    if (activeConversation.value) await loadMessages({ silent: true })
    return true
  }

  const realtime = createRealtime({
    getAccessToken,
    onEvent: applyPushedMessage,
    onRefresh: () => refreshMessageCenter({ force: true })
  })

  const liveRefresh = setupLiveRefresh(
    refreshMessageCenter,
    { interval: 3000 }
  )

  function initializeMessageCenter() {
    void loadConversations()
    void loadUnreadCount()
    void loadNotificationUnreadCount()
    realtime.connectMessageRealtime()
  }

  return {
    connectMessageRealtime: realtime.connectMessageRealtime,
    initializeMessageCenter,
    liveRefresh,
    realtimeStatus: realtime.realtimeStatus,
    refreshMessageCenter,
    syncRealtimeAccessToken: realtime.syncRealtimeAccessToken
  }
}
