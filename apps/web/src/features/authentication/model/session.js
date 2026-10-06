import { authenticationApi } from '../api/authenticationApi.js'
import {
  clearCurrentStudent,
  setCurrentStudent
} from '../../student-context/index.js'
import { normalizeAccessRole } from '../../../entities/user/index.js'
import {
  clearUserToken,
  getUserRefreshToken,
  getUserToken,
  setUserRefreshToken,
  setUserToken
} from '../../../shared/api/httpClient.js'

function defaultStorage() {
  return typeof localStorage !== 'undefined' ? localStorage : null
}

function store(key, val, storage = defaultStorage()) {
  if (val !== undefined) storage?.setItem(key, JSON.stringify(val))
  try {
    return JSON.parse(storage?.getItem(key) || 'null')
  } catch {
    return null
  }
}

function normalizeUser(user = {}) {
  const role = user.roles?.[0] || user.role
  return {
    ...user,
    id: user.id || user.userId,
    name: user.realName || user.nickname || user.name || user.phone,
    role: normalizeAccessRole(role)
  }
}

export function persistUserLogin(payload = {}, { storage = defaultStorage() } = {}) {
  const token = payload.accessToken || payload.token || payload.data?.accessToken || ''
  const refreshToken = payload.refreshToken || payload.data?.refreshToken || ''
  const expiresIn = payload.expiresIn || payload.data?.expiresIn || ''
  const rawUser = payload.user || payload.data?.user || {}
  const user = normalizeUser(rawUser)
  if (token) setUserToken(token, storage)
  if (refreshToken) setUserRefreshToken(refreshToken, storage)
  if (expiresIn) storage?.setItem('sjz_user_expires_in', String(expiresIn))
  store('sjz_current_user', user, storage)
  const currentStudent = payload.currentStudent || payload.data?.currentStudent
  if (currentStudent) setCurrentStudent(currentStudent, storage)
  else clearCurrentStudent(storage)
  return user
}

async function persistAndRefreshUser(payload = {}) {
  const fallback = persistUserLogin(payload)
  try {
    return await refreshCurrentUser() || fallback
  } catch {
    return fallback
  }
}

export async function sendSMSCode(phoneOrPayload, scene = 'LOGIN') {
  try {
    const payload = typeof phoneOrPayload === 'object'
      ? phoneOrPayload
      : { phone: phoneOrPayload, scene }
    const data = await authenticationApi.sendSMSCode(payload)
    return {
      success: true,
      data,
      debugCode: data?.devCode,
      devCode: data?.devCode,
      expiresInSeconds: data?.expiresInSeconds
    }
  } catch (error) {
    return { success: false, message: error.message || '网络错误' }
  }
}

export async function loginWithPhone(phoneOrPayload, smsCode) {
  const payload = typeof phoneOrPayload === 'object'
    ? phoneOrPayload
    : { phone: phoneOrPayload, smsCode }
  try {
    const data = await authenticationApi.smsLogin(payload)
    return await persistAndRefreshUser(data)
  } catch {
    return null
  }
}

export async function registerUser(formData) {
  try {
    const data = await authenticationApi.registerUser(formData)
    const user = await persistAndRefreshUser(data)
    return { ok: true, user, data }
  } catch (error) {
    return { ok: false, msg: error.message || '网络错误' }
  }
}

export function getCurrentUser(storage = defaultStorage()) { return store('sjz_current_user', undefined, storage) }
export function isLoggedIn(storage = defaultStorage()) { return !!getCurrentUser(storage) || !!getUserToken(storage) }
export function getRole(storage = defaultStorage()) { const u = getCurrentUser(storage); return u ? u.role : null }

export async function refreshCurrentUser({ storage = defaultStorage(), api = authenticationApi } = {}) {
  if (!getUserToken(storage)) return getCurrentUser(storage)
  const profile = await api.fetchProfile()
  const user = normalizeUser({
    ...getCurrentUser(storage),
    ...profile
  })
  store('sjz_current_user', user, storage)
  return user
}

export function logout() {
  const refreshToken = getUserRefreshToken()
  clearUserToken()
  if (refreshToken) return authenticationApi.logoutUser(refreshToken).catch(() => {})
  return Promise.resolve()
}

export async function loginWithPassword(phone, password) {
  try {
    const data = await authenticationApi.passwordLogin({ phone, password })
    const user = await persistAndRefreshUser(data)
    return { success: true, data, user }
  } catch (error) {
    return { success: false, message: error.message || '网络错误' }
  }
}

export async function updateUserProfile(data) {
  try {
    const profile = await authenticationApi.updateProfile(data)
    const user = normalizeUser({
      ...getCurrentUser(),
      ...profile,
      ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {})
    })
    localStorage.setItem('sjz_current_user', JSON.stringify(user))
    return { success: true, user, data: profile }
  } catch (error) {
    return { success: false, message: error.message || '网络错误' }
  }
}
