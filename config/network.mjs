export const NETWORK_CONFIG = Object.freeze({
  backendOrigin: 'http://192.168.100.106:3002',
  webPort: 3064,
  adminPort: 3101,
  adminWebOrigin: 'http://localhost:3101'
})

export const WEB_API_ENV_KEYS = Object.freeze(['VITE_API_BASE', 'VITE_ADMIN_API_BASE'])
export const ADMIN_API_ENV_KEYS = Object.freeze(['VITE_ADMIN_API_BASE', 'VITE_API_BASE'])
export const ADMIN_WEB_ENV_KEYS = Object.freeze(['VITE_ADMIN_WEB_URL'])

function firstEnvironmentValue(environment = {}, keys = []) {
  for (const key of keys) {
    const value = environment?.[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

export function resolveBackendOrigin(environment = {}, keys = WEB_API_ENV_KEYS) {
  return firstEnvironmentValue(environment, keys) || NETWORK_CONFIG.backendOrigin
}

export function resolveBrowserApiBase(environment = {}, keys = WEB_API_ENV_KEYS) {
  const explicitOrigin = firstEnvironmentValue(environment, keys)
  if (explicitOrigin) return explicitOrigin
  return ''
}

export function resolveAdminWebUrl(environment = {}) {
  const explicitOrigin = firstEnvironmentValue(environment, ADMIN_WEB_ENV_KEYS)
  const origin = explicitOrigin || (environment?.DEV ? NETWORK_CONFIG.adminWebOrigin : '/admin')
  return origin.replace(/\/+$/, '')
}
