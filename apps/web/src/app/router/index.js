import { createRouter, createWebHistory } from 'vue-router'

import {
  getRole,
  isLoggedIn,
  refreshCurrentUser
} from '@/features/authentication/index.js'
import { protectedRouteMeta } from './accessPolicy.js'
import { resolveRouteAccess } from './routeAccess.js'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/Home.vue') },
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
  { path: '/reset-password', name: 'ResetPassword', component: () => import('@/views/ResetPassword.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/Register.vue') },
  { path: '/platform', name: 'Platform', component: () => import('@/views/Platform.vue') },
  { path: '/case', name: 'Case', component: () => import('@/views/Case.vue') },
  { path: '/about', name: 'About', component: () => import('@/views/About.vue') },
  { path: '/dashboard', name: 'Dashboard', component: () => import('@/views/Dashboard.vue'), meta: protectedRouteMeta('/dashboard') },
  { path: '/student-switcher', name: 'StudentSwitcher', component: () => import('@/views/StudentSwitcher.vue'), meta: protectedRouteMeta('/student-switcher') },
  { path: '/growth-archive', name: 'GrowthArchive', component: () => import('@/views/GrowthArchive.vue'), meta: protectedRouteMeta('/growth-archive') },
  { path: '/teacher/classes', name: 'ClassRoster', component: () => import('@/views/ClassRoster.vue'), meta: protectedRouteMeta('/teacher/classes') },
  { path: '/school/students', name: 'SchoolStudents', component: () => import('@/views/SchoolRoster.vue'), meta: protectedRouteMeta('/school/students') },
  { path: '/school/classes', name: 'SchoolClasses', component: () => import('@/views/SchoolClasses.vue'), meta: protectedRouteMeta('/school/classes') },
  { path: '/school/teachers', name: 'SchoolTeachers', component: () => import('@/views/SchoolRoster.vue'), meta: protectedRouteMeta('/school/teachers', { rosterMode: 'teachers' }) },
  { path: '/school/parents', name: 'SchoolParents', component: () => import('@/views/SchoolRoster.vue'), meta: protectedRouteMeta('/school/parents', { rosterMode: 'parents' }) },
  { path: '/school/bindings', name: 'BindingReview', component: () => import('@/views/BindingReview.vue'), meta: protectedRouteMeta('/school/bindings') },
  { path: '/school/operations', name: 'OpenOperations', component: () => import('@/views/OpenOperations.vue'), meta: protectedRouteMeta('/school/operations') },
  { path: '/profile', name: 'Profile', component: () => import('@/views/Profile.vue'), meta: protectedRouteMeta('/profile') },
  { path: '/activities', name: 'Activities', component: () => import('@/views/ChildrenActivities.vue'), meta: protectedRouteMeta('/activities') },
  { path: '/competitions', name: 'Competitions', component: () => import('@/views/CompetitionZone.vue'), meta: protectedRouteMeta('/competitions') },
  { path: '/forum', name: 'Forum', component: () => import('@/views/ParentForum.vue'), meta: protectedRouteMeta('/forum') },
  { path: '/news', name: 'News', component: () => import('@/views/NewsInfo.vue'), meta: protectedRouteMeta('/news') },
  { path: '/messages', name: 'Messages', component: () => import('@/views/MessageCenter.vue'), meta: protectedRouteMeta('/messages') },
  { path: '/my-registrations', name: 'MyRegistrations', component: () => import('@/views/MyRegistrations.vue'), meta: protectedRouteMeta('/my-registrations') },
  { path: '/registration-summary', redirect: '/competitions' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

router.beforeEach(to => resolveRouteAccess({
  to,
  isLoggedIn,
  getRole,
  refreshCurrentUser
}))

export default router
