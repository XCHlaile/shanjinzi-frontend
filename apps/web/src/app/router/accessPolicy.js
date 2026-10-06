export const allUserRoles = Object.freeze(['parent', 'teacher', 'school'])

function policy(path, roles, navigation = {}) {
  return Object.freeze({
    path,
    roles: Object.freeze([...roles]),
    navigation: Object.freeze(navigation)
  })
}

export const protectedRoutePolicies = Object.freeze([
  policy('/dashboard', allUserRoles, {
    parent: { label: '首页', order: 0 },
    teacher: { label: '首页', order: 0 },
    school: { label: '首页', order: 0 }
  }),
  policy('/student-switcher', ['parent'], { parent: { label: '学生切换', order: 10 } }),
  policy('/growth-archive', ['parent', 'teacher'], {
    parent: { label: '成长档案', order: 20 },
    teacher: { label: '成长档案', order: 30 }
  }),
  policy('/teacher/classes', ['teacher'], { teacher: { label: '班级学生', order: 20 } }),
  policy('/school/students', ['school'], { school: { label: '学生名册', order: 10 } }),
  policy('/school/classes', ['school'], { school: { label: '班级管理', order: 20 } }),
  policy('/school/teachers', ['school'], { school: { label: '教师管理', order: 30 } }),
  policy('/school/parents', ['school'], { school: { label: '家长管理', order: 40 } }),
  policy('/school/bindings', ['school']),
  policy('/school/operations', ['school'], { school: { label: '审计与导出', order: 50 } }),
  policy('/profile', allUserRoles, {
    parent: { label: '个人资料', order: 90 },
    teacher: { label: '个人资料', order: 90 },
    school: { label: '个人资料', order: 120 }
  }),
  policy('/activities', allUserRoles, {
    parent: { label: '幼儿动态', order: 30 },
    teacher: { label: '发布动态', order: 40 },
    school: { label: '动态管理', order: 70 }
  }),
  policy('/competitions', allUserRoles, {
    parent: { label: '赛事报名', order: 40 },
    teacher: { label: '报名查看', order: 50 },
    school: { label: '赛事报名', order: 60 }
  }),
  policy('/forum', allUserRoles, {
    parent: { label: '家长论坛', order: 50 },
    teacher: { label: '家长论坛', order: 60 },
    school: { label: '家长论坛', order: 80 }
  }),
  policy('/news', allUserRoles, {
    parent: { label: '新闻资讯', order: 60 },
    teacher: { label: '新闻资讯', order: 70 },
    school: { label: '新闻资讯', order: 90 }
  }),
  policy('/messages', allUserRoles, {
    parent: { label: '消息中心', order: 70 },
    teacher: { label: '消息中心', order: 80 },
    school: { label: '消息中心', order: 100 }
  }),
  policy('/my-registrations', ['parent'])
])

const navigationGroupDefinitions = Object.freeze({
  parent: Object.freeze([
    Object.freeze({ label: '工作台', paths: Object.freeze(['/dashboard']) }),
    Object.freeze({ label: '孩子成长', paths: Object.freeze(['/student-switcher', '/growth-archive', '/activities']) }),
    Object.freeze({ label: '发现与参与', paths: Object.freeze(['/competitions', '/forum', '/news']) }),
    Object.freeze({ label: '消息', paths: Object.freeze(['/messages']) })
  ]),
  teacher: Object.freeze([
    Object.freeze({ label: '工作台', paths: Object.freeze(['/dashboard']) }),
    Object.freeze({ label: '班级与成长', paths: Object.freeze(['/teacher/classes', '/growth-archive', '/activities']) }),
    Object.freeze({ label: '协同与活动', paths: Object.freeze(['/competitions', '/forum', '/news']) }),
    Object.freeze({ label: '消息', paths: Object.freeze(['/messages']) })
  ]),
  school: Object.freeze([
    Object.freeze({ label: '工作台', paths: Object.freeze(['/dashboard']) }),
    Object.freeze({ label: '校务管理', paths: Object.freeze(['/school/students', '/school/classes', '/school/teachers', '/school/parents', '/school/operations']) }),
    Object.freeze({ label: '内容与赛事', paths: Object.freeze(['/activities', '/competitions', '/forum', '/news']) }),
    Object.freeze({ label: '消息', paths: Object.freeze(['/messages']) })
  ])
})

const policyByPath = new Map(protectedRoutePolicies.map(item => [item.path, item]))

export function protectedRouteMeta(path, extra = {}) {
  const routePolicy = policyByPath.get(path)
  if (!routePolicy) throw new Error(`Missing protected route policy: ${path}`)
  return {
    requiresAuth: true,
    roles: routePolicy.roles,
    ...extra
  }
}

export function canAccessProtectedRoute(path, role) {
  const routePolicy = policyByPath.get(path)
  return Boolean(routePolicy?.roles.includes(role))
}

export function navigationForRole(role) {
  return protectedRoutePolicies
    .map(item => ({ ...item.navigation[role], path: item.path }))
    .filter(item => item.label)
    .sort((left, right) => left.order - right.order)
    .map(({ path, label }) => ({ path, label }))
}

export function navigationGroupsForRole(role) {
  const itemsByPath = new Map(navigationForRole(role).map(item => [item.path, item]))
  return (navigationGroupDefinitions[role] || [])
    .map(group => ({
      label: group.label,
      items: group.paths.map(path => itemsByPath.get(path)).filter(Boolean)
    }))
    .filter(group => group.items.length)
}
