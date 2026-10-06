import { computed, ref } from 'vue'

import { messageApi } from '../api/messageApi.js'
import { adminMessageNotification } from '../lib/messageChannels.js'
import { mergeById, pageItems } from '../lib/messageViewModel.js'

const noop = () => {}

export function useMessageNotifications({
  activeChannel,
  broadcastConversations,
  messageUnreadCount,
  refreshMessageUnreadCount,
  api = messageApi,
  notify = { success: noop, error: noop },
  now = () => new Date().toISOString()
}) {
  const broadcastNotifications = ref([])
  const notifications = ref([])
  const notificationPage = ref(1)
  const notificationTotalPages = ref(0)
  const notificationReadStatus = ref('')
  const notificationLoading = ref(false)
  const notificationPolling = ref(false)
  const notificationError = ref('')
  const notificationUnreadCount = ref(0)
  const markingNotificationId = ref(null)
  const markingAllRead = ref(false)

  const broadcastUnreadCount = computed(() => (
    broadcastNotifications.value.filter(notification => !notification.readAt).length
  ))
  const privateUnreadCount = computed(() => (
    Math.max(0, messageUnreadCount.value - broadcastUnreadCount.value)
  ))
  const combinedNotificationUnreadCount = computed(() => (
    notificationUnreadCount.value + broadcastUnreadCount.value
  ))
  const visibleNotifications = computed(() => {
    const items = mergeById(notifications.value, broadcastNotifications.value, 'notificationId')
      .filter(notification => {
        if (notificationReadStatus.value === 'UNREAD') return !notification.readAt
        if (notificationReadStatus.value === 'READ') return Boolean(notification.readAt)
        return true
      })
    return items.sort((left, right) => (
      new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
    ))
  })

  async function fetchAllConversationMessages(conversationId) {
    const messages = []
    let page = 1
    let totalPages
    do {
      const payload = await api.fetchMessageHistory(conversationId, { page, pageSize: 100 })
      messages.push(...pageItems(payload))
      totalPages = Number(payload?.totalPages ?? 1)
      page += 1
    } while (page <= totalPages)
    return messages
  }

  async function loadBroadcastNotifications(items = broadcastConversations.value) {
    const histories = await Promise.all(items.map(async conversation => {
      try {
        const messages = await fetchAllConversationMessages(conversation.conversationId)
        return messages.map(message => adminMessageNotification(message, conversation))
      } catch {
        return []
      }
    }))
    broadcastNotifications.value = histories.flat()
  }

  async function loadNotificationUnreadCount() {
    try {
      const payload = await api.fetchNotificationUnreadCount()
      notificationUnreadCount.value = Number(payload?.unreadCount ?? 0)
    } catch {
      notificationUnreadCount.value = 0
    }
  }

  async function loadNotifications({ append = false, silent = false } = {}) {
    if (notificationLoading.value || notificationPolling.value) return
    if (silent) notificationPolling.value = true
    else {
      notificationLoading.value = true
      notificationError.value = ''
    }
    const requestedPage = append ? notificationPage.value + 1 : 1
    try {
      const payload = await api.fetchNotifications({
        page: requestedPage,
        pageSize: 20,
        readStatus: notificationReadStatus.value || undefined
      })
      const items = pageItems(payload)
      notifications.value = append
        ? mergeById(notifications.value, items, 'notificationId')
        : items
      notificationPage.value = Number(payload?.page ?? requestedPage)
      notificationTotalPages.value = Number(payload?.totalPages ?? (items.length ? 1 : 0))
    } catch (error) {
      if (!silent) {
        if (!append) notifications.value = []
        notificationError.value = error.message || '系统通知加载失败，请稍后重试'
      }
    } finally {
      if (silent) notificationPolling.value = false
      else notificationLoading.value = false
    }
  }

  async function openNotifications() {
    activeChannel.value = 'notifications'
    if (!visibleNotifications.value.length && !notificationLoading.value && !notificationPolling.value) {
      await loadNotifications()
    }
  }

  function reloadNotifications() {
    notificationPage.value = 1
    return loadNotifications()
  }

  function loadMoreNotifications() {
    return loadNotifications({ append: true })
  }

  async function markNotificationRead(notification) {
    if (notification.readAt || markingNotificationId.value) return
    markingNotificationId.value = notification.notificationId
    try {
      if (notification.adminBroadcast) {
        await api.markMessageRead(notification.messageId)
      } else {
        await api.markNotificationRead(notification.notificationId)
        notificationUnreadCount.value = Math.max(0, notificationUnreadCount.value - 1)
      }
      notification.readAt = now()
      if (notification.message) notification.message.readAt = notification.readAt
      if (notification.adminBroadcast) await refreshMessageUnreadCount()
    } catch (error) {
      notify.error(error.message || '通知已读状态更新失败')
    } finally {
      markingNotificationId.value = null
    }
  }

  async function markAllNotificationsRead() {
    if (markingAllRead.value) return
    markingAllRead.value = true
    try {
      const unreadBroadcastConversationIds = [...new Set(
        broadcastNotifications.value
          .filter(notification => !notification.readAt)
          .map(notification => notification.conversationId)
          .filter(Boolean)
      )]
      await Promise.all([
        api.markAllNotificationsRead(),
        ...unreadBroadcastConversationIds.map(conversationId => api.markConversationRead(conversationId))
      ])
      const readAt = now()
      notifications.value.forEach(item => { item.readAt ||= readAt })
      broadcastNotifications.value.forEach(item => {
        item.readAt ||= readAt
        if (item.message) item.message.readAt ||= readAt
      })
      notificationUnreadCount.value = 0
      await refreshMessageUnreadCount()
      notify.success('全部通知已标为已读')
    } catch (error) {
      notify.error(error.message || '全部标为已读失败')
    } finally {
      markingAllRead.value = false
    }
  }

  return {
    broadcastNotifications,
    broadcastUnreadCount,
    combinedNotificationUnreadCount,
    loadBroadcastNotifications,
    loadMoreNotifications,
    loadNotifications,
    loadNotificationUnreadCount,
    markAllNotificationsRead,
    markingAllRead,
    markingNotificationId,
    markNotificationRead,
    notificationError,
    notificationLoading,
    notificationPage,
    notificationPolling,
    notificationReadStatus,
    notificationTotalPages,
    notificationUnreadCount,
    notifications,
    openNotifications,
    privateUnreadCount,
    reloadNotifications,
    visibleNotifications
  }
}
