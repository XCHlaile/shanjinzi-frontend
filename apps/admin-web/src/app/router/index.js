import { createRouter, createWebHistory } from 'vue-router'

import { isAuthenticated } from '@/api/client.js'

const routes = [
  { path: '/login', component: () => import('@/views/Login.vue') },
  {
    path: '/',
    component: () => import('@/views/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', component: () => import('@/views/Dashboard.vue') },
      { path: 'users', component: () => import('@/views/Users.vue') },
      { path: 'schools', component: () => import('@/views/Schools.vue') },
      { path: 'students', component: () => import('@/views/Students.vue') },
      { path: 'bindings', component: () => import('@/views/Bindings.vue') },
      { path: 'simulations', component: () => import('@/views/Simulations.vue') },
      { path: 'messages', component: () => import('@/views/Messages.vue') },
      { path: 'pages', component: () => import('@/views/Pages.vue') },
      { path: 'news', component: () => import('@/views/News.vue') },
      { path: 'competitions', component: () => import('@/views/Competitions.vue') },
      { path: 'content-reports', component: () => import('@/views/ContentReports.vue') },
      { path: 'audit-logs', component: () => import('@/views/AuditLogs.vue') },
      { path: 'export-tasks', component: () => import('@/views/ExportTasks.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && isAuthenticated()) return '/dashboard'
  return true
})

export default router
