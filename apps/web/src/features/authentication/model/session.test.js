import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getCurrentUser,
  isLoggedIn,
  persistUserLogin,
  refreshCurrentUser
} from './session.js'
import { getUserRefreshToken, getUserToken } from '../../../shared/api/httpClient.js'

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

test('persists OpenAPI login tokens and normalizes returned user information', () => {
  const storage = createMemoryStorage()

  const user = persistUserLogin({
    accessToken: 'access-token-1',
    refreshToken: 'refresh-token-1',
    expiresIn: 3600,
    user: {
      id: 12,
      phone: '13900000000',
      realName: '王老师',
      roles: ['TEACHER']
    }
  }, { storage })

  assert.equal(getUserToken(storage), 'access-token-1')
  assert.equal(getUserRefreshToken(storage), 'refresh-token-1')
  assert.equal(storage.getItem('sjz_user_expires_in'), '3600')
  assert.deepEqual(user, {
    id: 12,
    phone: '13900000000',
    realName: '王老师',
    roles: ['TEACHER'],
    name: '王老师',
    role: 'teacher'
  })
  assert.deepEqual(getCurrentUser(storage), user)
})

test('clears stale current student when backend login does not return one', () => {
  const storage = createMemoryStorage({
    sjz_current_student: JSON.stringify({ id: 'student-1', name: 'mock student' })
  })

  persistUserLogin({
    accessToken: 'access-token-1',
    user: {
      id: 18,
      phone: '13900000008',
      roles: ['PARENT']
    }
  }, { storage })

  assert.equal(storage.getItem('sjz_current_student'), null)
})

test('persists backend current student when login returns one', () => {
  const storage = createMemoryStorage()

  persistUserLogin({
    accessToken: 'access-token-1',
    currentStudent: { id: 12, name: 'real student' },
    user: {
      id: 18,
      phone: '13900000008',
      roles: ['PARENT']
    }
  }, { storage })

  assert.deepEqual(JSON.parse(storage.getItem('sjz_current_student')), { id: 12, name: 'real student' })
})

test('does not grant parent access to a login response with an unknown role', () => {
  const storage = createMemoryStorage()

  const user = persistUserLogin({
    accessToken: 'access-token-1',
    user: { id: 18, roles: ['UNKNOWN_ROLE'] }
  }, { storage })

  assert.equal(user.role, '')
})

test('refreshes current user from /api/app/me and lets token-only sessions enter the app', async () => {
  const storage = createMemoryStorage({
    sjz_user_access_token: 'access-token-1',
    sjz_current_user: JSON.stringify({
      id: 12,
      phone: '13900000000',
      realName: '旧姓名',
      roles: ['PARENT'],
      role: 'parent',
      name: '旧姓名'
    })
  })

  const user = await refreshCurrentUser({
    storage,
    api: {
      fetchProfile() {
        return Promise.resolve({
          id: 12,
          phone: '13900000000',
          realName: '王老师',
          roles: ['TEACHER']
        })
      }
    }
  })

  assert.equal(user.name, '王老师')
  assert.equal(user.role, 'teacher')
  assert.equal(getCurrentUser(storage).name, '王老师')
  assert.equal(isLoggedIn(createMemoryStorage({ sjz_user_access_token: 'access-token-only' })), true)
})
