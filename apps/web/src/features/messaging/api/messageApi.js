import { validateApiContractMap } from '@shanjinzi/api-contracts'

import {
  cleanObject,
  fillPath,
  numericId
} from '../../../shared/api/requestUtils.js'
import { httpClient } from '../../../shared/api/httpClient.js'

export const messageContracts = validateApiContractMap({
  messages: {
    contacts: { method: 'GET', path: '/api/app/messages/contacts' },
    conversations: { method: 'GET', path: '/api/app/messages/conversations' },
    history: { method: 'GET', path: '/api/app/messages/conversations/{conversationId}/messages' },
    send: { method: 'POST', path: '/api/app/messages' },
    read: { method: 'PATCH', path: '/api/app/messages/{messageId}/read' },
    conversationRead: { method: 'PATCH', path: '/api/app/messages/conversations/{conversationId}/read' },
    recall: { method: 'PATCH', path: '/api/app/messages/{messageId}/recall' },
    hide: { method: 'DELETE', path: '/api/app/messages/{messageId}' },
    settings: { method: 'PATCH', path: '/api/app/messages/conversations/{conversationId}/settings' },
    unreadCount: { method: 'GET', path: '/api/app/messages/unread-count' }
  },
  notifications: {
    list: { method: 'GET', path: '/api/app/notifications' },
    unreadCount: { method: 'GET', path: '/api/app/notifications/unread-count' },
    read: { method: 'PATCH', path: '/api/app/notifications/{notificationId}/read' },
    readAll: { method: 'PATCH', path: '/api/app/notifications/read-all' }
  }
}, 'messageContracts')

function messagePayload(data = {}) {
  return cleanObject({
    clientMessageId: data.clientMessageId,
    receiverId: numericId(data.receiverId),
    content: data.content || data.text || data.body || '',
    attachmentFileIds: Array.isArray(data.attachmentFileIds)
      ? data.attachmentFileIds.map(numericId)
      : undefined
  })
}

export function createMessageApi(transport = httpClient) {
  return Object.freeze({
    fetchMessageContacts(keyword = '') {
      return transport.get(
        messageContracts.messages.contacts.path,
        { query: cleanObject({ keyword }) }
      )
    },
    fetchUnreadCount() {
      return transport.get(messageContracts.messages.unreadCount.path)
    },
    fetchConversations(params) {
      return transport.get(
        messageContracts.messages.conversations.path,
        { query: { page: 1, pageSize: 20, ...params } }
      )
    },
    fetchMessageHistory(conversationId, params) {
      return transport.get(
        fillPath(messageContracts.messages.history.path, { conversationId }),
        { query: { page: 1, pageSize: 50, ...params } }
      )
    },
    markMessageRead(messageId) {
      return transport.patch(
        fillPath(messageContracts.messages.read.path, { messageId })
      )
    },
    markConversationRead(conversationId) {
      return transport.patch(
        fillPath(messageContracts.messages.conversationRead.path, { conversationId })
      )
    },
    sendMessage(data) {
      return transport.post(messageContracts.messages.send.path, messagePayload(data))
    },
    recallMessage(messageId) {
      return transport.patch(
        fillPath(messageContracts.messages.recall.path, { messageId })
      )
    },
    hideMessage(messageId) {
      return transport.delete(
        fillPath(messageContracts.messages.hide.path, { messageId })
      )
    },
    updateConversationSettings(conversationId, data) {
      return transport.patch(
        fillPath(messageContracts.messages.settings.path, { conversationId }),
        cleanObject({ pinned: data?.pinned, muted: data?.muted })
      )
    },
    fetchNotifications(params) {
      return transport.get(
        messageContracts.notifications.list.path,
        { query: { page: 1, pageSize: 20, ...params } }
      )
    },
    fetchNotificationUnreadCount() {
      return transport.get(messageContracts.notifications.unreadCount.path)
    },
    markNotificationRead(notificationId) {
      return transport.patch(
        fillPath(messageContracts.notifications.read.path, { notificationId })
      )
    },
    markAllNotificationsRead() {
      return transport.patch(messageContracts.notifications.readAll.path)
    }
  })
}

export const messageApi = createMessageApi()
