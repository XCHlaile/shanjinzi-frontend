import { WEB_API_ENV_KEYS, resolveBrowserApiBase } from '../../../../../config/network.mjs'
import { createRequestDeduper, createTimeoutSignal } from '../../../../../config/asyncRuntime.mjs'
import { emitClientPerformanceMetric } from '../../../../../config/clientPerformanceReporter.mjs'
import { attachErrorState } from '../../../../../config/errorState.mjs'

export const DEFAULT_API_BASE = resolveBrowserApiBase(import.meta.env, WEB_API_ENV_KEYS)
export const API_BASE = DEFAULT_API_BASE
export const USER_SESSION_EXPIRED_EVENT = 'sjz:user-session-expired'
export const DEFAULT_REQUEST_TIMEOUT_MS = Number(import.meta.env?.VITE_REQUEST_TIMEOUT_MS) > 0
  ? Number(import.meta.env?.VITE_REQUEST_TIMEOUT_MS)
  : 15000

export function resolveApiAssetUrl(value, baseUrl = DEFAULT_API_BASE) {
  const url = String(value || '').trim()
  if (!url || /^(?:https?:|data:|blob:)/i.test(url)) return url
  if (!baseUrl) return url
  return new URL(url, `${String(baseUrl).replace(/\/+$/, '')}/`).toString()
}

function getDefaultStorage() {
  return typeof localStorage !== 'undefined' ? localStorage : null
}

function readJson(storage, key) {
  try {
    return JSON.parse(storage?.getItem(key) || 'null')
  } catch {
    return null
  }
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

function isSuccessCode(code) {
  return code === 'SUCCESS' || code === 'OK' || code === 0 || code === 200 || code === '0' || code === '200'
}

function currentStudentId(storage) {
  const student = readJson(storage, 'sjz_current_student')
  return student?.currentStudentId || student?.studentId || student?.id || ''
}

function clearStoredUserSession(storage) {
  storage?.removeItem('sjz_user_access_token')
  storage?.removeItem('sjz_user_refresh_token')
  storage?.removeItem('sjz_user_expires_in')
  storage?.removeItem('sjz_current_user')
  storage?.removeItem('sjz_current_student')
}

async function readResponseBody(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function errorWithStatus(message, status, code = '') {
  const error = new Error(message)
  error.status = status
  error.code = code
  return attachErrorState(error)
}

function payloadAuthorizationStatus(status, payload) {
  if (status === 401 || status === 403) return status
  const code = Number(payload?.code)
  return code === 401 || code === 403 ? code : 0
}

function notifySessionExpired(eventTarget) {
  if (typeof eventTarget?.dispatchEvent !== 'function') return
  if (typeof globalThis.Event === 'function') {
    eventTarget.dispatchEvent(new Event(USER_SESSION_EXPIRED_EVENT))
  }
}

function normalizePayload(status, payload, authorizationStatus = 0) {
  if (status < 200 || status >= 300) {
    throw errorWithStatus(
      payload?.message || payload?.msg || `Request failed: ${status}`,
      authorizationStatus || status,
      payload?.code
    )
  }
  if (payload && typeof payload === 'object' && 'code' in payload) {
    if (isSuccessCode(payload.code)) return payload.data ?? payload
    throw errorWithStatus(
      payload.message || payload.msg || '请求失败',
      authorizationStatus || status,
      payload.code
    )
  }
  if (payload && typeof payload === 'object' && 'success' in payload) {
    if (payload.success === false) {
      throw errorWithStatus(
        payload.message || payload.msg || '请求失败',
        authorizationStatus || status,
        payload.code
      )
    }
    const keys = Object.keys(payload)
    const isEnvelope = keys.every(key => ['success', 'data', 'message', 'msg'].includes(key))
    if (isEnvelope && 'data' in payload) return payload.data
  }
  return payload
}

export function getUserToken(storage = getDefaultStorage()) {
  return storage?.getItem('sjz_user_access_token') || ''
}

export function setUserToken(token, storage = getDefaultStorage()) {
  if (token) storage?.setItem('sjz_user_access_token', token)
}

function responseFilename(response) {
  const disposition = response.headers.get('content-disposition') || ''
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  const regularMatch = disposition.match(/filename="?([^";]+)"?/i)
  const encoded = utf8Match?.[1] || regularMatch?.[1] || ''
  try {
    return decodeURIComponent(encoded)
  } catch {
    return encoded
  }
}

export function getUserRefreshToken(storage = getDefaultStorage()) {
  return storage?.getItem('sjz_user_refresh_token') || ''
}

export function setUserRefreshToken(token, storage = getDefaultStorage()) {
  if (token) storage?.setItem('sjz_user_refresh_token', token)
}

export function clearUserToken(storage = getDefaultStorage()) {
  clearStoredUserSession(storage)
}

export function createHttpClient({
  baseUrl = DEFAULT_API_BASE,
  storage = getDefaultStorage(),
  fetchImpl = typeof fetch === 'function' ? fetch.bind(globalThis) : null,
  eventTarget = typeof window !== 'undefined' ? window : null,
  performanceNow = () => globalThis.performance?.now?.() ?? Date.now(),
  requestTimeout = DEFAULT_REQUEST_TIMEOUT_MS,
  downloadTimeout = 60000
} = {}) {
  const dedupeGet = createRequestDeduper()

  async function performRequest(path, options = {}) {
    if (typeof fetchImpl !== 'function') throw new Error('Network request is not available')

    const { query, timeout = requestTimeout, dedupe: _dedupe, ...fetchOptions } = options

    const headers = new Headers(options.headers || {})
    const body = options.body
    const hasBody = body !== undefined && body !== null
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

    if (!headers.has('Content-Type') && hasBody && !isFormData) {
      headers.set('Content-Type', 'application/json')
    }

    const token = getUserToken(storage)
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)

    const studentId = options.currentStudentId ?? currentStudentId(storage)
    if (studentId && !headers.has('X-Current-Student-Id')) {
      headers.set('X-Current-Student-Id', String(studentId))
    }

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
        const timeoutError = errorWithStatus('请求超时，请稍后重试', 408, 'TIMEOUT')
        timeoutError.name = 'TimeoutError'
        throw timeoutError
      }
      throw attachErrorState(error)
    } finally {
      timeoutSignal.cleanup()
    }
    const payload = await readResponseBody(response)

    const authorizationStatus = payloadAuthorizationStatus(response.status, payload)
    if (authorizationStatus === 401) {
      clearStoredUserSession(storage)
      notifySessionExpired(eventTarget)
    }
    return normalizePayload(response.status, payload, authorizationStatus)
  }

  async function request(path, options = {}) {
    const startedAt = performanceNow()
    let outcome = 'success'
    let status = 0
    try {
      return await performRequest(path, options)
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

  async function download(path, options = {}) {
    if (typeof fetchImpl !== 'function') throw new Error('Network request is not available')

    const { query, timeout = downloadTimeout, dedupe: _dedupe, ...fetchOptions } = options

    const headers = new Headers(options.headers || {})
    const token = getUserToken(storage)
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)

    const studentId = options.currentStudentId ?? currentStudentId(storage)
    if (studentId && !headers.has('X-Current-Student-Id')) {
      headers.set('X-Current-Student-Id', String(studentId))
    }

    const url = appendQuery(joinUrl(baseUrl, path), query)
    const timeoutSignal = createTimeoutSignal(timeout, fetchOptions.signal)
    let response
    try {
      response = await fetchImpl(url, { ...fetchOptions, method: 'GET', signal: timeoutSignal.signal, headers })
    } catch (error) {
      if (timeoutSignal.didTimeout()) {
        const timeoutError = errorWithStatus('下载超时，请稍后重试', 408, 'TIMEOUT')
        timeoutError.name = 'TimeoutError'
        throw timeoutError
      }
      throw attachErrorState(error)
    } finally {
      timeoutSignal.cleanup()
    }
    if (response.status === 401) {
      clearStoredUserSession(storage)
      notifySessionExpired(eventTarget)
    }
    if (!response.ok) {
      const payload = await readResponseBody(response)
      throw errorWithStatus(
        payload?.message || payload?.msg || `Request failed: ${response.status}`,
        response.status,
        payload?.code
      )
    }
    return {
      blob: await response.blob(),
      filename: responseFilename(response)
    }
  }

  return {
    request,
    download,
    get(path, options) {
      const requestOptions = options || {}
      if (requestOptions.dedupe === false || requestOptions.signal) {
        return request(path, { ...requestOptions, method: 'GET' })
      }
      const key = [
        appendQuery(path, requestOptions.query),
        getUserToken(storage),
        requestOptions.currentStudentId ?? currentStudentId(storage)
      ].join('|')
      return dedupeGet(key, () => request(path, { ...requestOptions, method: 'GET' }))
    },
    post(path, data, options) {
      return request(path, { ...(options || {}), method: 'POST', body: data })
    },
    put(path, data, options) {
      return request(path, { ...(options || {}), method: 'PUT', body: data })
    },
    patch(path, data, options) {
      return request(path, { ...(options || {}), method: 'PATCH', body: data })
    },
    delete(path, options) {
      return request(path, { ...(options || {}), method: 'DELETE' })
    }
  }
}

export const httpClient = createHttpClient()

export function apiRequest(path, options = {}) {
  return httpClient.request(path, options)
}
