import { Client } from '@stomp/stompjs'
import { NETWORK_CONFIG } from '../../../../../../config/network.mjs'

export const MESSAGE_WEBSOCKET_PATH = '/ws/messages'
export const MESSAGE_STOMP_DESTINATION = '/user/queue/messages'

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function websocketProtocol(protocol) {
  return protocol === 'https:' || protocol === 'wss:' ? 'wss:' : 'ws:'
}

export function resolveMessageBrokerUrl(environment = {}, pageLocation = globalThis.location) {
  const explicitUrl = text(environment.VITE_MESSAGE_WS_URL)
  const path = text(environment.VITE_MESSAGE_WS_PATH) || MESSAGE_WEBSOCKET_PATH
  const locationOrigin = pageLocation?.origin || NETWORK_CONFIG.backendOrigin

  if (explicitUrl) {
    const url = new URL(explicitUrl, locationOrigin)
    url.protocol = websocketProtocol(url.protocol)
    return url.toString()
  }

  const backendOrigin = text(environment.VITE_API_BASE)
    || text(environment.VITE_ADMIN_API_BASE)
    || locationOrigin
  const url = new URL(path, `${backendOrigin.replace(/\/+$/, '')}/`)
  url.protocol = websocketProtocol(url.protocol)
  return url.toString()
}

export function parseMessageRealtimeEvent(input) {
  const event = typeof input === 'string' ? JSON.parse(input) : input
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    throw new Error('WebSocket 消息不是有效对象')
  }
  if (!text(event.eventType)) throw new Error('WebSocket 消息缺少 eventType')
  return {
    ...event,
    eventType: text(event.eventType),
    eventId: text(event.eventId),
    data: event.data && typeof event.data === 'object' ? event.data : {}
  }
}

function errorMessage(error) {
  return error?.headers?.message || error?.body || error?.message || 'WebSocket 连接异常'
}

export function createMessageRealtimeClient({
  brokerURL,
  getAccessToken,
  onEvent = () => {},
  onStatusChange = () => {},
  onError = () => {},
  reconnectDelay = 5000,
  ClientImpl = Client
} = {}) {
  if (!text(brokerURL)) throw new Error('缺少消息 WebSocket 地址')
  if (typeof getAccessToken !== 'function') throw new Error('缺少 Access Token 获取方法')

  const seenEventIds = new Set()
  let subscription = null
  let manuallyStopped = false

  function updateStatus(status, details = {}) {
    onStatusChange({ status, brokerURL, ...details })
  }

  function rememberEvent(event) {
    if (!event.eventId) return true
    if (seenEventIds.has(event.eventId)) return false
    seenEventIds.add(event.eventId)
    if (seenEventIds.size > 200) seenEventIds.delete(seenEventIds.values().next().value)
    return true
  }

  const client = new ClientImpl({
    brokerURL,
    reconnectDelay,
    heartbeatIncoming: 0,
    heartbeatOutgoing: 0,
    connectionTimeout: 10000,
    debug: () => {},
    beforeConnect() {
      const accessToken = text(getAccessToken())
      if (!accessToken) throw new Error('Access Token 不存在，无法建立消息连接')
      client.connectHeaders = { Authorization: `Bearer ${accessToken}` }
      updateStatus('connecting')
    },
    onConnect() {
      manuallyStopped = false
      updateStatus('connected')
      subscription = client.subscribe(MESSAGE_STOMP_DESTINATION, frame => {
        try {
          const event = parseMessageRealtimeEvent(frame.body)
          if (rememberEvent(event)) onEvent(event)
        } catch (error) {
          onError(error)
        }
      }, { ack: 'auto' })
    },
    onStompError(frame) {
      const error = new Error(errorMessage(frame))
      updateStatus('error', { error })
      onError(error)
    },
    onWebSocketError(event) {
      const error = new Error(event?.message || 'WebSocket 网络错误')
      updateStatus('error', { error })
      onError(error)
    },
    onWebSocketClose(event) {
      subscription = null
      updateStatus(manuallyStopped ? 'disconnected' : 'reconnecting', {
        code: event?.code,
        reason: event?.reason || ''
      })
    }
  })

  return {
    client,
    activate() {
      manuallyStopped = false
      updateStatus('connecting')
      client.activate()
    },
    async deactivate() {
      manuallyStopped = true
      subscription?.unsubscribe?.()
      subscription = null
      await client.deactivate()
      updateStatus('disconnected')
    },
    async reconnect() {
      manuallyStopped = true
      await client.deactivate()
      manuallyStopped = false
      updateStatus('connecting')
      client.activate()
    }
  }
}

export function createDefaultMessageRealtimeClient(options = {}) {
  const environment = options.environment ?? import.meta.env ?? {}
  return createMessageRealtimeClient({
    ...options,
    brokerURL: options.brokerURL || resolveMessageBrokerUrl(environment, options.pageLocation),
    reconnectDelay: Number(environment.VITE_MESSAGE_WS_RECONNECT_DELAY_MS) || options.reconnectDelay || 5000
  })
}
