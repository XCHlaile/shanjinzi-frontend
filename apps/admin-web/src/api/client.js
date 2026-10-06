import { ADMIN_API_ENV_KEYS, resolveBrowserApiBase } from '../../../../config/network.mjs'
import { createRequestDeduper, createTimeoutSignal } from '../../../../config/asyncRuntime.mjs'
import { emitClientPerformanceMetric } from '../../../../config/clientPerformanceReporter.mjs'
import { attachErrorState } from '../../../../config/errorState.mjs'

export const DEFAULT_ADMIN_API_BASE = resolveBrowserApiBase(import.meta.env, ADMIN_API_ENV_KEYS)
export const API_BASE = DEFAULT_ADMIN_API_BASE
export const ADMIN_SESSION_EXPIRED_EVENT = 'sjz:admin-session-expired'
export const DEFAULT_ADMIN_REQUEST_TIMEOUT_MS = Number(import.meta.env?.VITE_REQUEST_TIMEOUT_MS) > 0
  ? Number(import.meta.env?.VITE_REQUEST_TIMEOUT_MS)
  : 15000

function defaultStorage() {
  return typeof localStorage !== 'undefined' ? localStorage : null
}

function isSuccessCode(code) {
  return code === 'SUCCESS' || code === 'OK' || code === 0 || code === 200 || code === '0' || code === '200'
}

function errorWithStatus(message, status) {
  const error = new Error(message)
  error.status = status
  return attachErrorState(error)
}

function joinUrl(baseUrl, path) {
  return `${String(baseUrl).replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`
}

function appendQuery(url, query) {
  if (!query || typeof query !== 'object') return url
  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  return params.length ? `${url}${url.includes('?') ? '&' : '?'}${params.join('&')}` : url
}

function normalizeBody(body, status = 200) {
  if (body && typeof body === 'object' && 'code' in body) {
    if (isSuccessCode(body.code)) return body.data ?? body
    throw errorWithStatus(body.message || body.msg || '请求失败', Number(body.code) || status)
  }
  if (body?.success === false) throw errorWithStatus(body.message || body.msg || '请求失败', status)
  if (body?.success === true && 'data' in body) return body.data
  return body
}

export function createAdminHttpClient({
  baseUrl = DEFAULT_ADMIN_API_BASE,
  storage = defaultStorage(),
  fetchImpl = typeof fetch === 'function' ? fetch.bind(globalThis) : null,
  eventTarget = typeof window !== 'undefined' ? window : null,
  performanceNow = () => globalThis.performance?.now?.() ?? Date.now(),
  requestTimeout = DEFAULT_ADMIN_REQUEST_TIMEOUT_MS,
  downloadTimeout = 60000
} = {}) {
  const dedupeGet = createRequestDeduper()

  function clearSession() {
    storage?.removeItem('sjz_admin_access_token')
    storage?.removeItem('sjz_admin_display_name')
  }

  function expireSession() {
    clearSession()
    if (typeof eventTarget?.dispatchEvent === 'function' && typeof globalThis.Event === 'function') {
      eventTarget.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT))
    }
  }

  function getToken() {
    const token = storage?.getItem('sjz_admin_access_token') || ''
    if (token === 'demo-admin-token') {
      clearSession()
      return ''
    }
    return token
  }

  function setSession(session) {
    const token = session.accessToken || session.token || ''
    if (token) storage?.setItem('sjz_admin_access_token', token)
    storage?.setItem('sjz_admin_display_name', session.displayName || session.user?.realName || '超级管理员')
  }

  async function performNetworkRequest(path, options = {}) {
    if (typeof fetchImpl !== 'function') throw new Error('Network request is not available')
    const { query, timeout = requestTimeout, dedupe: _dedupe, ...fetchOptions } = options
    const headers = new Headers(options.headers || {})
    const body = options.body
    const hasBody = body !== undefined && body !== null
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
    if (!headers.has('Content-Type') && hasBody && !isFormData) headers.set('Content-Type', 'application/json')
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    const url = appendQuery(joinUrl(baseUrl, path), query)
    const timeoutSignal = createTimeoutSignal(timeout, fetchOptions.signal)
    let response
    try {
      response = await fetchImpl(url, {
        ...fetchOptions,
        signal: timeoutSignal.signal,
        headers,
        body: isFormData || typeof body === 'string' ? body : hasBody ? JSON.stringify(body) : undefined
      })
    } catch (error) {
      if (timeoutSignal.didTimeout()) {
        const timeoutError = errorWithStatus('请求超时，请稍后重试', 408)
        timeoutError.name = 'TimeoutError'
        throw timeoutError
      }
      throw attachErrorState(error)
    } finally {
      timeoutSignal.cleanup()
    }
    const bodyPayload = await response.json().catch(() => null)
    const authorizationStatus = [401, 403].includes(response.status)
      ? response.status
      : [401, 403].includes(Number(bodyPayload?.code)) ? Number(bodyPayload.code) : 0
    if (authorizationStatus) {
      if (authorizationStatus === 401) expireSession()
      throw errorWithStatus(
        bodyPayload?.message || (authorizationStatus === 401 ? '登录已过期' : '当前账号无权执行此操作'),
        authorizationStatus
      )
    }
    if (response.status < 200 || response.status >= 300) {
      throw errorWithStatus(bodyPayload?.message || `Request failed: ${response.status}`, response.status)
    }
    return normalizeBody(bodyPayload, response.status)
  }

  async function performRequest(path, options = {}) {
    const startedAt = performanceNow()
    let outcome = 'success'
    let status = 0
    try {
      return await performNetworkRequest(path, options)
    } catch (error) {
      outcome = 'error'
      status = Number(error?.status) || 0
      throw error
    } finally {
      emitClientPerformanceMetric(eventTarget, {
        name: 'api.duration',
        value: Math.max(0, performanceNow() - startedAt),
        unit: 'ms',
        context: {
          method: String(options.method || 'GET').toUpperCase(),
          outcome,
          path,
          status
        }
      })
    }
  }

  function request(path, options = {}) {
    const method = String(options.method || 'GET').toUpperCase()
    if (method !== 'GET' || options.dedupe === false || options.signal) return performRequest(path, options)
    const key = [appendQuery(path, options.query), getToken()].join('|')
    return dedupeGet(key, () => performRequest(path, options))
  }

  async function requestBlob(path, options = {}) {
    if (typeof fetchImpl !== 'function') throw new Error('Network request is not available')
    const { query, timeout = downloadTimeout, dedupe: _dedupe, ...fetchOptions } = options
    const headers = new Headers(options.headers || {})
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    const url = appendQuery(joinUrl(baseUrl, path), query)
    const timeoutSignal = createTimeoutSignal(timeout, fetchOptions.signal)
    let response
    try {
      response = await fetchImpl(url, { ...fetchOptions, signal: timeoutSignal.signal, headers })
    } catch (error) {
      if (timeoutSignal.didTimeout()) {
        const timeoutError = errorWithStatus('下载超时，请稍后重试', 408)
        timeoutError.name = 'TimeoutError'
        throw timeoutError
      }
      throw attachErrorState(error)
    } finally {
      timeoutSignal.cleanup()
    }

    if (response.status === 401) expireSession()
    if (response.status < 200 || response.status >= 300) {
      const errorPayload = await response.json().catch(() => null)
      throw errorWithStatus(errorPayload?.message || `Request failed: ${response.status}`, response.status)
    }

    const disposition = response.headers?.get?.('Content-Disposition') || ''
    const encodedFilename = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
    const plainFilename = disposition.match(/filename="?([^";]+)"?/i)?.[1]
    return {
      blob: await response.blob(),
      filename: encodedFilename ? decodeURIComponent(encodedFilename) : plainFilename || '',
      contentType: response.headers?.get?.('Content-Type') || ''
    }
  }

  async function adminLogin(account, password) {
    const session = await request('/api/public/admin/auth/login', {
      method: 'POST',
      body: { account, password }
    })
    setSession(session)
    return session
  }

  return {
    getToken,
    setSession,
    clearSession,
    isAuthenticated() {
      return Boolean(getToken())
    },
    request,
    requestBlob,
    adminLogin
  }
}

const defaultClient = createAdminHttpClient()

export function getToken() {
  return defaultClient.getToken()
}

export function setSession(session) {
  return defaultClient.setSession(session)
}

export function clearSession() {
  return defaultClient.clearSession()
}

export function isAuthenticated() {
  return defaultClient.isAuthenticated()
}

export function request(path, options = {}) {
  return defaultClient.request(path, options)
}

export function requestBlob(path, options = {}) {
  return defaultClient.requestBlob(path, options)
}

export function adminLogin(username, password) {
  return defaultClient.adminLogin(username, password)
}
