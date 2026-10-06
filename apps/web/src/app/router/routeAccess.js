import { normalizeAccessRole } from '../../entities/user/index.js'

const webRoles = new Set(['parent', 'teacher', 'school'])

function loginRedirect(to, reason = '') {
  return {
    path: '/login',
    query: {
      ...(to?.fullPath ? { redirect: to.fullPath } : {}),
      ...(reason ? { reason } : {})
    }
  }
}

export function routeAccessDecision({ to, loggedIn, role }) {
  if (to.path === '/' && loggedIn) return { path: '/dashboard', replace: true }
  if (to.meta?.requiresAuth && !loggedIn) return loginRedirect(to)

  if (to.meta?.roles?.length) {
    const normalizedRole = normalizeAccessRole(role)
    if (!webRoles.has(normalizedRole)) return loginRedirect(to, 'role')
    if (!to.meta.roles.includes(normalizedRole)) {
      return { path: '/dashboard', replace: true }
    }
  }
  return true
}

export async function resolveRouteAccess({
  to,
  isLoggedIn,
  getRole,
  refreshCurrentUser
}) {
  let loggedIn = isLoggedIn()
  let role = normalizeAccessRole(getRole())

  if (to.meta?.requiresAuth && loggedIn && !role) {
    try {
      const user = await refreshCurrentUser()
      role = normalizeAccessRole(user?.role || user?.roles?.[0] || getRole())
    } catch {}
    loggedIn = isLoggedIn()
  }

  return routeAccessDecision({ to, loggedIn, role })
}
