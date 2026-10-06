import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  NETWORK_CONFIG,
  WEB_API_ENV_KEYS,
  resolveBackendOrigin,
  resolveBrowserApiBase,
  resolveAdminWebUrl
} from '../../../../../config/network.mjs'

import {
  DEFAULT_API_BASE,
  USER_SESSION_EXPIRED_EVENT,
  clearUserToken,
  createHttpClient,
  getUserRefreshToken,
  resolveApiAssetUrl,
  setUserRefreshToken
} from './httpClient.js'

const httpSource = readFileSync(new URL('./httpClient.js', import.meta.url), 'utf8')
const viteConfigSource = readFileSync(new URL('../../../vite.config.js', import.meta.url), 'utf8')

test('resolves backend media and avatar paths without changing absolute URLs', () => {
  assert.equal(
    resolveApiAssetUrl('/uploads/avatar/a.png', 'https://api.example.test'),
    'https://api.example.test/uploads/avatar/a.png'
  )
  assert.equal(resolveApiAssetUrl('https://cdn.example.test/a.png', 'https://api.example.test'), 'https://cdn.example.test/a.png')
  assert.equal(resolveApiAssetUrl('/uploads/avatar/a.png', ''), '/uploads/avatar/a.png')
})

function createMemoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null
    },
    setItem(key, value) {
      data.set(key, String(value))
    },
    removeItem(key) {
      data.delete(key)
    }
  }
}

test('centralizes backend defaults and environment overrides', () => {
  assert.equal(resolveBackendOrigin({}, WEB_API_ENV_KEYS), NETWORK_CONFIG.backendOrigin)
  assert.equal(resolveBackendOrigin({ VITE_API_BASE: ' https://api.example.test ' }, WEB_API_ENV_KEYS), 'https://api.example.test')
  assert.equal(resolveBrowserApiBase({ DEV: true }, WEB_API_ENV_KEYS), '')
  assert.equal(resolveBrowserApiBase({ PROD: true }, WEB_API_ENV_KEYS), '')
  assert.equal(resolveBrowserApiBase({ DEV: true, VITE_API_BASE: 'https://api.example.test' }, WEB_API_ENV_KEYS), 'https://api.example.test')
  assert.equal(resolveAdminWebUrl({ DEV: true }), NETWORK_CONFIG.adminWebOrigin)
  assert.equal(resolveAdminWebUrl({ DEV: false }), '/admin')
  assert.equal(resolveAdminWebUrl({ VITE_ADMIN_WEB_URL: ' https://admin.example.test/ ' }), 'https://admin.example.test')
})

test('uses same-origin OpenAPI paths without adding an extra api prefix', async () => {
  const calls = []
  const client = createHttpClient({
    baseUrl: DEFAULT_API_BASE,
    storage: createMemoryStorage({
      sjz_user_access_token: 'token-1',
      sjz_current_student: JSON.stringify({ studentId: 12 })
    }),
    fetchImpl(url, options) {
      calls.push({ url, options })
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ code: 'SUCCESS', data: { ok: true } })
      })
    }
  })

  const result = await client.request('/api/app/moments', {
    query: { page: 1, pageSize: 10, empty: '' }
  })

  assert.deepEqual(result, { ok: true })
  assert.equal(calls[0].url, '/api/app/moments?page=1&pageSize=10')
  assert.equal(calls[0].options.headers.get('Authorization'), 'Bearer token-1')
  assert.equal(calls[0].options.headers.get('X-Current-Student-Id'), '12')
})

test('normalizes OpenAPI business errors and clears expired sessions', async () => {
  const events = []
  const storage = createMemoryStorage({
    sjz_user_access_token: 'expired',
    sjz_user_refresh_token: 'refresh-expired',
    sjz_current_user: JSON.stringify({ id: 1 })
  })
  const client = createHttpClient({
    baseUrl: 'https://api.example.test',
    storage,
    eventTarget: { dispatchEvent: event => events.push(event.type) },
    fetchImpl() {
      return Promise.resolve({
        status: 401,
        json: () => Promise.resolve({ code: 'UNAUTHORIZED', message: '登录已过期' })
      })
    }
  })

  await assert.rejects(
    () => client.request('/api/app/me'),
    /登录已过期/
  )
  assert.equal(storage.getItem('sjz_user_access_token'), null)
  assert.equal(storage.getItem('sjz_user_refresh_token'), null)
  assert.equal(storage.getItem('sjz_current_user'), null)
  assert.deepEqual(events, [USER_SESSION_EXPIRED_EVENT])
})

test('expires a session for business-code 401 responses returned with HTTP 200', async () => {
  const events = []
  const storage = createMemoryStorage({ sjz_user_access_token: 'expired' })
  const client = createHttpClient({
    storage,
    eventTarget: { dispatchEvent: event => events.push(event.type) },
    fetchImpl: async () => ({
      status: 200,
      json: async () => ({ code: 401, message: 'expired' })
    })
  })

  await assert.rejects(() => client.get('/api/app/me'), error => error.status === 401)
  assert.equal(storage.getItem('sjz_user_access_token'), null)
  assert.deepEqual(events, [USER_SESSION_EXPIRED_EVENT])
})

test('keeps the user session when a request is forbidden', async () => {
  const events = []
  const storage = createMemoryStorage({
    sjz_user_access_token: 'active-token',
    sjz_user_refresh_token: 'active-refresh-token',
    sjz_current_user: JSON.stringify({ id: 1, role: 'parent' })
  })
  const client = createHttpClient({
    baseUrl: 'https://api.example.test',
    storage,
    eventTarget: { dispatchEvent: event => events.push(event.type) },
    fetchImpl() {
      return Promise.resolve({
        ok: false,
        status: 403,
        headers: new Headers(),
        json: () => Promise.resolve({ code: 'FORBIDDEN', message: '当前操作无权限' })
      })
    }
  })

  await assert.rejects(() => client.request('/api/app/guardians/bindings/9'), /当前操作无权限/)
  await assert.rejects(() => client.download('/api/open/export-tasks/9/download'), /当前操作无权限/)
  assert.equal(storage.getItem('sjz_user_access_token'), 'active-token')
  assert.equal(storage.getItem('sjz_user_refresh_token'), 'active-refresh-token')
  assert.deepEqual(JSON.parse(storage.getItem('sjz_current_user')), { id: 1, role: 'parent' })
  assert.deepEqual(events, [])
})

test('downloads shared open export files with the web user token', async () => {
  const calls = []
  const fileBlob = new Blob(['student-data'], { type: 'text/csv' })
  const client = createHttpClient({
    baseUrl: 'https://api.example.test',
    storage: createMemoryStorage({ sjz_user_access_token: 'web-token' }),
    fetchImpl(url, options) {
      calls.push({ url, options })
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-disposition': "attachment; filename*=UTF-8''students.csv" }),
        blob: () => Promise.resolve(fileBlob)
      })
    }
  })

  const result = await client.download('/api/open/export-tasks/11/download')

  assert.equal(calls[0].url, 'https://api.example.test/api/open/export-tasks/11/download')
  assert.equal(calls[0].options.headers.get('Authorization'), 'Bearer web-token')
  assert.equal(result.filename, 'students.csv')
  assert.equal(result.blob, fileBlob)
})

test('uses same-origin API paths in local dev so Vite can proxy backend requests', () => {
  assert.ok(httpSource.includes('resolveBrowserApiBase(import.meta.env'))
  assert.ok(viteConfigSource.includes("'/api'"))
  assert.ok(viteConfigSource.includes("'/uploads'"))
  assert.ok(viteConfigSource.includes('proxy'))
  assert.ok(viteConfigSource.includes('resolveBackendOrigin(process.env'))
  assert.ok(viteConfigSource.includes('NETWORK_CONFIG.webPort'))
  assert.ok(!viteConfigSource.includes(NETWORK_CONFIG.backendOrigin))
})

test('stores and clears the OpenAPI refresh token with the user session', () => {
  const storage = createMemoryStorage()

  setUserRefreshToken('refresh-token-1', storage)
  assert.equal(getUserRefreshToken(storage), 'refresh-token-1')

  clearUserToken(storage)
  assert.equal(getUserRefreshToken(storage), '')
})

test('dedupes concurrent identical GET requests without caching later refreshes', async () => {
  let calls = 0
  const client = createHttpClient({
    storage: createMemoryStorage(),
    fetchImpl: async () => {
      calls += 1
      await new Promise(resolve => setTimeout(resolve, 5))
      return { status: 200, json: async () => ({ code: 'SUCCESS', data: { calls } }) }
    }
  })

  const [first, second] = await Promise.all([
    client.get('/api/public/news', { query: { page: 1 } }),
    client.get('/api/public/news', { query: { page: 1 } })
  ])
  assert.deepEqual(first, second)
  assert.equal(calls, 1)
  await client.get('/api/public/news', { query: { page: 1 } })
  assert.equal(calls, 2)
})
