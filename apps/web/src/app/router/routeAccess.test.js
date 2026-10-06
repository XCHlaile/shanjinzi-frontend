import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveRouteAccess, routeAccessDecision } from './routeAccess.js'

const protectedRoute = (path, roles) => ({
  path,
  fullPath: path,
  meta: { requiresAuth: true, roles }
})

test('route access rejects direct navigation from a parent to school pages', () => {
  assert.deepEqual(routeAccessDecision({
    to: protectedRoute('/school/students', ['school']),
    loggedIn: true,
    role: 'parent'
  }), { path: '/dashboard', replace: true })
})

test('route access preserves the destination for anonymous and unsupported sessions', () => {
  assert.deepEqual(routeAccessDecision({
    to: protectedRoute('/teacher/classes', ['teacher']),
    loggedIn: false,
    role: ''
  }), { path: '/login', query: { redirect: '/teacher/classes' } })

  assert.deepEqual(routeAccessDecision({
    to: protectedRoute('/dashboard', ['parent', 'teacher', 'school']),
    loggedIn: true,
    role: 'SUPER_ADMIN'
  }), {
    path: '/login',
    query: { redirect: '/dashboard', reason: 'role' }
  })
})

test('route access hydrates token-only sessions before checking the role', async () => {
  let role = ''
  const decision = await resolveRouteAccess({
    to: protectedRoute('/teacher/classes', ['teacher']),
    isLoggedIn: () => true,
    getRole: () => role,
    refreshCurrentUser: async () => {
      role = 'teacher'
      return { role }
    }
  })

  assert.equal(decision, true)
})

test('route access fails closed when a token-only session cannot be hydrated', async () => {
  let loggedIn = true
  const decision = await resolveRouteAccess({
    to: protectedRoute('/school/students', ['school']),
    isLoggedIn: () => loggedIn,
    getRole: () => '',
    refreshCurrentUser: async () => {
      loggedIn = false
      throw new Error('expired')
    }
  })

  assert.deepEqual(decision, {
    path: '/login',
    query: { redirect: '/school/students' }
  })
})
