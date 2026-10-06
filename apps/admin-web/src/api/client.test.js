import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { NETWORK_CONFIG } from '../../../../config/network.mjs'

import {
  ADMIN_SESSION_EXPIRED_EVENT,
  DEFAULT_ADMIN_API_BASE,
  createAdminHttpClient
} from './client.js'

const clientSource = readFileSync(new URL('./client.js', import.meta.url), 'utf8')
const viteConfigSource = readFileSync(new URL('../../vite.config.js', import.meta.url), 'utf8')

function createMemoryStorage() {
  const data = new Map()
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

test('maps admin login to the OpenAPI public admin auth endpoint', async () => {
  const calls = []
  const client = createAdminHttpClient({
    baseUrl: DEFAULT_ADMIN_API_BASE,
    storage: createMemoryStorage(),
    fetchImpl(url, options) {
      calls.push({ url, options })
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({
          code: 'SUCCESS',
          data: { accessToken: 'admin-token', user: { realName: 'Admin' } }
        })
      })
    }
  })

  const result = await client.adminLogin('admin', 'secret')

  assert.equal(calls[0].url, '/api/public/admin/auth/login')
  assert.equal(calls[0].options.method, 'POST')
  assert.equal(calls[0].options.body, JSON.stringify({ account: 'admin', password: 'secret' }))
  assert.equal(result.accessToken, 'admin-token')
})

test('does not expose fallback transport for admin screens', () => {
  assert.ok(!clientSource.includes('requestWithFallback'))
})

test('uses same-origin API paths in local dev so Vite can proxy backend requests', () => {
  assert.ok(clientSource.includes('resolveBrowserApiBase(import.meta.env'))
  assert.ok(viteConfigSource.includes("'/api'"))
  assert.ok(viteConfigSource.includes('proxy'))
  assert.ok(viteConfigSource.includes('resolveBackendOrigin(process.env'))
  assert.ok(viteConfigSource.includes('NETWORK_CONFIG.adminPort'))
  assert.ok(!viteConfigSource.includes(NETWORK_CONFIG.backendOrigin))
})

test('drops legacy local demo admin token before auth checks', () => {
  const storage = createMemoryStorage()
  storage.setItem('sjz_admin_access_token', 'demo-admin-token')
  storage.setItem('sjz_admin_display_name', 'Demo')
  const client = createAdminHttpClient({ storage, fetchImpl: async () => ({ status: 200, json: async () => ({}) }) })

  assert.equal(client.getToken(), '')
  assert.equal(client.isAuthenticated(), false)
  assert.equal(storage.getItem('sjz_admin_access_token'), null)
  assert.equal(storage.getItem('sjz_admin_display_name'), null)
})

test('marks unauthorized admin responses so pages can redirect to login', async () => {
  const events = []
  const storage = createMemoryStorage()
  storage.setItem('sjz_admin_access_token', 'expired-token')
  const client = createAdminHttpClient({
    storage,
    eventTarget: { dispatchEvent: event => events.push(event.type) },
    fetchImpl: async () => ({
      status: 401,
      json: async () => ({ code: 'UNAUTHORIZED', message: '登录已过期' })
    })
  })

  await assert.rejects(
    () => client.request('/api/admin/users'),
    error => error.status === 401 && /登录已过期/.test(error.message)
  )
  assert.equal(storage.getItem('sjz_admin_access_token'), null)
  assert.deepEqual(events, [ADMIN_SESSION_EXPIRED_EVENT])
})

test('expires admin sessions for business-code 401 responses', async () => {
  const events = []
  const storage = createMemoryStorage()
  storage.setItem('sjz_admin_access_token', 'expired-token')
  const client = createAdminHttpClient({
    storage,
    eventTarget: { dispatchEvent: event => events.push(event.type) },
    fetchImpl: async () => ({
      status: 200,
      json: async () => ({ code: 401, message: 'expired' })
    })
  })

  await assert.rejects(() => client.request('/api/admin/users'), error => error.status === 401)
  assert.equal(storage.getItem('sjz_admin_access_token'), null)
  assert.deepEqual(events, [ADMIN_SESSION_EXPIRED_EVENT])
})

test('keeps the admin session on forbidden responses', async () => {
  const events = []
  const storage = createMemoryStorage()
  storage.setItem('sjz_admin_access_token', 'active-token')
  const client = createAdminHttpClient({
    storage,
    eventTarget: { dispatchEvent: event => events.push(event.type) },
    fetchImpl: async () => ({
      status: 403,
      json: async () => ({ code: 'FORBIDDEN', message: 'forbidden' })
    })
  })

  await assert.rejects(() => client.request('/api/admin/users/2'), error => error.status === 403)
  assert.equal(storage.getItem('sjz_admin_access_token'), 'active-token')
  assert.deepEqual(events, [])
})

test('downloads open export files with admin authentication and filename metadata', async () => {
  const calls = []
  const storage = createMemoryStorage()
  storage.setItem('sjz_admin_access_token', 'admin-token')
  const client = createAdminHttpClient({
    baseUrl: DEFAULT_ADMIN_API_BASE,
    storage,
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return {
        status: 200,
        headers: new Headers({
          'Content-Disposition': "attachment; filename*=UTF-8''students%20export.xlsx",
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }),
        blob: async () => new Blob(['export-data'])
      }
    }
  })

  const result = await client.requestBlob('/api/open/export-tasks/12/download', { method: 'GET' })

  assert.equal(calls[0].url, '/api/open/export-tasks/12/download')
  assert.equal(calls[0].options.headers.get('Authorization'), 'Bearer admin-token')
  assert.equal(result.filename, 'students export.xlsx')
  assert.equal(result.contentType, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  assert.equal(await result.blob.text(), 'export-data')
})

test('dedupes only in-flight identical admin GET requests', async () => {
  let calls = 0
  const client = createAdminHttpClient({
    storage: createMemoryStorage(),
    fetchImpl: async () => {
      calls += 1
      await new Promise(resolve => setTimeout(resolve, 5))
      return { status: 200, json: async () => ({ code: 'SUCCESS', data: [] }) }
    }
  })

  await Promise.all([
    client.request('/api/admin/users', { query: { page: 1 } }),
    client.request('/api/admin/users', { query: { page: 1 } })
  ])
  assert.equal(calls, 1)
  await client.request('/api/admin/users', { query: { page: 1 } })
  assert.equal(calls, 2)
})
