<template>
  <header ref="navbarRoot" class="navbar">
    <div class="container nav-inner">
      <router-link :to="homePath" class="logo" @click="handleNavItemClick">
        <span class="logo-icon"><img src="/logo.png" alt="山巾子科技"></span>
        <span class="logo-text">山巾子科技</span>
      </router-link>

      <button
        ref="menuButton"
        class="menu-toggle"
        :class="{ open: menuOpen }"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="primary-navigation"
        :aria-label="menuOpen ? '关闭菜单' : '打开菜单'"
        @click="menuOpen = !menuOpen"
      >
        <span class="bar"></span><span class="bar"></span><span class="bar"></span>
      </button>

      <nav
        id="primary-navigation"
        ref="navRoot"
        :class="['nav-links', { open: menuOpen }]"
        aria-label="主导航"
      >
        <template v-if="loggedIn">
          <template v-for="group in navGroups" :key="group.label">
            <router-link
              v-if="group.items.length === 1"
              :to="group.items[0].path"
              class="nav-link"
              active-class="active"
              @click="handleNavItemClick"
            >
              {{ group.label }}
            </router-link>

            <details v-else class="nav-group" @toggle="handleDisclosureToggle">
              <summary :class="['nav-summary', { active: isGroupActive(group) }]">
                <span>{{ group.label }}</span>
                <span class="menu-caret" aria-hidden="true"></span>
              </summary>
              <div class="nav-dropdown">
                <router-link
                  v-for="item in group.items"
                  :key="item.path"
                  :to="item.path"
                  active-class="active"
                  @click="handleNavItemClick"
                >
                  {{ item.label }}
                </router-link>
              </div>
            </details>
          </template>

          <span v-if="sessionContextLabel" class="nav-context">{{ sessionContextLabel }}</span>

          <details class="account-menu" @toggle="handleDisclosureToggle">
            <summary class="account-summary" :aria-label="`${accountName}账户菜单`">
              <span class="nav-user">{{ accountName }}</span>
              <span class="menu-caret" aria-hidden="true"></span>
            </summary>
            <div class="account-dropdown">
              <div class="account-meta">
                <strong>{{ accountName }}</strong>
                <span>{{ roleLabel }}</span>
                <small v-if="sessionContextLabel">{{ sessionContextLabel }}</small>
              </div>
              <router-link to="/profile" active-class="active" @click="handleNavItemClick">个人资料</router-link>
              <button type="button" @click="handleLogout">退出登录</button>
            </div>
          </details>
        </template>

        <template v-else>
          <router-link to="/" class="nav-link" active-class="active" @click="handleNavItemClick">首页</router-link>
          <router-link to="/platform" class="nav-link" active-class="active" @click="handleNavItemClick">平台功能</router-link>
          <router-link to="/case" class="nav-link" active-class="active" @click="handleNavItemClick">合作案例</router-link>
          <router-link to="/about" class="nav-link" active-class="active" @click="handleNavItemClick">关于我们</router-link>
          <router-link to="/login" class="nav-login" @click="handleNavItemClick">登录</router-link>
          <router-link to="/register" class="btn btn-primary nav-cta" @click="handleNavItemClick">注册</router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { schoolAdministrationApi } from '@/features/school-administration/index.js'
import {
  CURRENT_STUDENT_CHANGED_EVENT,
  getCurrentStudent
} from '@/features/student-context/index.js'
import { getRoleLabel, normalizeRole } from '@/entities/user/index.js'
import { navigationGroupsForRole } from '@/app/router/accessPolicy.js'
import {
  getCurrentUser,
  getRole,
  isLoggedIn,
  logout,
  refreshCurrentUser
} from '@/features/authentication/index.js'

const router = useRouter()
const route = useRoute()
const navbarRoot = ref(null)
const navRoot = ref(null)
const menuButton = ref(null)
const menuOpen = ref(false)
const loggedIn = ref(isLoggedIn())
const currentUser = ref(getCurrentUser())
const role = ref(normalizeRole(getRole()))
const roleLabel = ref(getRoleLabel(getRole()))
const currentStudent = ref(getCurrentStudent())
const currentSchoolName = ref('')

const navGroups = computed(() => navigationGroupsForRole(role.value))
const homePath = computed(() => loggedIn.value ? '/dashboard' : '/')
const sessionContextLabel = computed(() => {
  if (role.value === 'parent') return currentStudent.value?.name || currentStudent.value?.studentName || ''
  if (role.value === 'school' || role.value === 'teacher') return currentSchoolName.value
  return ''
})
const accountName = computed(() => {
  const user = currentUser.value || {}
  return user.realName || user.nickname || user.name || user.phone || '已登录'
})

function schoolNameOf(user = {}) {
  return user.schoolName || user.school?.name || user.school?.schoolName || user.organizationName || ''
}

function schoolIdOf(user = {}) {
  return user.schoolId || user.school?.id || user.school?.schoolId
}

function isGroupActive(group) {
  return group.items.some(item => item.path === route.path)
}

function closeDisclosures(except = null) {
  navRoot.value?.querySelectorAll('details[open]').forEach(item => {
    if (item !== except) item.removeAttribute('open')
  })
}

function closeNavigation() {
  menuOpen.value = false
  closeDisclosures()
}

function handleNavItemClick() {
  closeNavigation()
}

function handleDisclosureToggle(event) {
  const disclosure = event.currentTarget
  if (disclosure.open) closeDisclosures(disclosure)
}

function handleDocumentPointerDown(event) {
  if (!navbarRoot.value?.contains(event.target)) closeNavigation()
}

function handleDocumentKeydown(event) {
  if (event.key !== 'Escape') return
  const hadOpenNavigation = menuOpen.value || Boolean(navRoot.value?.querySelector('details[open]'))
  closeNavigation()
  if (hadOpenNavigation) menuButton.value?.focus()
}

async function syncSchoolContext() {
  if (role.value !== 'school' && role.value !== 'teacher') {
    currentSchoolName.value = ''
    return
  }

  const user = currentUser.value || {}
  const knownName = schoolNameOf(user)
  if (knownName) {
    currentSchoolName.value = knownName
    return
  }

  const schoolId = schoolIdOf(user)
  if (!schoolId) {
    currentSchoolName.value = '未关联学校'
    return
  }

  currentSchoolName.value = `学校 #${schoolId}`
  try {
    const school = await schoolAdministrationApi.fetchPublicSchoolDetail(schoolId)
    currentSchoolName.value = school?.name || school?.schoolName || currentSchoolName.value
  } catch {}
}

function syncSession() {
  loggedIn.value = isLoggedIn()
  currentUser.value = getCurrentUser()
  role.value = normalizeRole(getRole())
  roleLabel.value = getRoleLabel(getRole())
  currentStudent.value = getCurrentStudent()
  currentSchoolName.value = ['school', 'teacher'].includes(role.value) ? schoolNameOf(currentUser.value) : ''
}

function syncCurrentStudent(event) {
  currentStudent.value = event?.detail || getCurrentStudent()
}

async function refreshSession() {
  syncSession()
  if (!loggedIn.value) return
  try {
    currentUser.value = await refreshCurrentUser()
    role.value = normalizeRole(currentUser.value?.role)
    roleLabel.value = getRoleLabel(role.value)
  } catch {}
  await syncSchoolContext()
}

watch(() => route.fullPath, () => {
  closeNavigation()
  refreshSession()
})

function handleLogout() {
  logout()
  syncSession()
  closeNavigation()
  router.push('/')
}

onMounted(() => {
  window.addEventListener(CURRENT_STUDENT_CHANGED_EVENT, syncCurrentStudent)
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
  refreshSession()
})
onUnmounted(() => {
  window.removeEventListener(CURRENT_STUDENT_CHANGED_EVENT, syncCurrentStudent)
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  z-index: 1000;
  top: 0;
  right: 0;
  left: 0;
  border-bottom: 1px solid rgba(213, 227, 234, 0.84);
  background: rgba(247, 250, 252, 0.94);
  box-shadow: 0 0.35rem 1.5rem rgba(35, 83, 112, 0.05);
  backdrop-filter: blur(16px) saturate(135%);
}

.nav-inner { display: flex; min-height: 72px; align-items: center; justify-content: space-between; }
.logo { display: flex; align-items: center; gap: 0.7rem; flex: 0 0 auto; color: #17324d; text-decoration: none; }
.logo-icon { display: flex; width: 40px; height: 40px; align-items: center; justify-content: center; overflow: hidden; border-radius: 10px; }
.logo-icon img { display: block; width: 100%; height: 100%; object-fit: contain; }
.logo-text { font-size: 1.12rem; font-weight: 780; letter-spacing: -0.025em; }
.nav-links { display: flex; align-items: center; gap: 1rem; }
.nav-link,
.nav-login,
.nav-summary { position: relative; color: #526b7f; font-size: 0.88rem; font-weight: 650; }
.nav-link,
.nav-login { padding: 0.55rem 0; }
.nav-link::after,
.nav-summary::after { position: absolute; right: 0; bottom: 0.14rem; left: 0; height: 2px; border-radius: 2px; background: #2d72ad; content: ''; transform: scaleX(0); transform-origin: left; transition: transform 180ms ease; }
.nav-link:hover,
.nav-link.active,
.nav-login:hover,
.nav-summary:hover,
.nav-summary.active { color: #205781; }
.nav-link.active::after,
.nav-link:hover::after,
.nav-summary.active::after,
.nav-summary:hover::after { transform: scaleX(1); }
.nav-group,
.account-menu { position: relative; }
.nav-summary,
.account-summary { display: flex; min-height: 44px; align-items: center; gap: 0.55rem; cursor: pointer; list-style: none; }
.nav-summary::-webkit-details-marker,
.account-summary::-webkit-details-marker { display: none; }
.menu-caret { width: 7px; height: 7px; flex: 0 0 auto; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; transform: rotate(45deg) translateY(-2px); transition: transform 180ms ease; }
details[open] > summary .menu-caret { transform: rotate(225deg) translate(-1px, -1px); }
.nav-dropdown,
.account-dropdown { position: absolute; top: calc(100% + 0.55rem); min-width: 180px; padding: 0.5rem; border: 1px solid #d5e3ea; border-radius: 12px; background: #fbfdfe; box-shadow: 0 1rem 2.5rem rgba(35, 83, 112, 0.14); }
.nav-dropdown { left: -0.8rem; }
.account-dropdown { right: 0; min-width: 220px; }
.nav-dropdown a,
.account-dropdown a,
.account-dropdown button { display: flex; width: 100%; min-height: 42px; align-items: center; padding: 0.62rem 0.75rem; border: 0; border-radius: 8px; background: transparent; color: #3f5d72; cursor: pointer; font: inherit; font-size: 0.84rem; font-weight: 620; text-align: left; }
.nav-dropdown a:hover,
.nav-dropdown a.active,
.account-dropdown a:hover,
.account-dropdown a.active,
.account-dropdown button:hover { background: #eef6fa; color: #205781; }
.account-meta { display: grid; gap: 0.15rem; margin: 0 0.45rem 0.45rem; padding: 0.25rem 0.3rem 0.7rem; border-bottom: 1px solid #e7f0f4; color: #17324d; }
.account-meta span,
.account-meta small { color: #6c8292; font-size: 0.76rem; }
.nav-user,
.nav-context { padding: 0.38rem 0.7rem; border-radius: 8px; font-size: 0.8rem; font-weight: 680; white-space: nowrap; }
.nav-user { background: #dceef7; color: #205781; }
.nav-context { max-width: 150px; overflow: hidden; background: #fff0e9; color: #9b4d34; text-overflow: ellipsis; }
.nav-cta { min-height: 40px; padding: 0.55rem 1.1rem; font-size: 0.84rem; }
.menu-toggle { display: none; width: 44px; height: 44px; flex-direction: column; align-items: center; justify-content: center; gap: 5px; border: 0; border-radius: 10px; background: transparent; cursor: pointer; }
.menu-toggle .bar { width: 23px; height: 2px; border-radius: 2px; background: #17324d; transition: transform 220ms ease, opacity 160ms ease; }
.menu-toggle.open .bar:first-child { transform: translateY(7px) rotate(45deg); }
.menu-toggle.open .bar:nth-child(2) { opacity: 0; }
.menu-toggle.open .bar:last-child { transform: translateY(-7px) rotate(-45deg); }

@media (prefers-color-scheme: dark) {
  .navbar { border-color: rgba(49, 80, 100, 0.88); background: rgba(16, 36, 49, 0.94); box-shadow: 0 0.35rem 1.5rem rgba(0, 0, 0, 0.12); }
  .logo { color: #edf6fa; }
  .menu-toggle .bar { background: #edf6fa; }
  .nav-link,
  .nav-login,
  .nav-summary { color: #b7cad5; }
  .nav-link:hover,
  .nav-link.active,
  .nav-login:hover,
  .nav-summary:hover,
  .nav-summary.active { color: #edf6fa; }
  .nav-dropdown,
  .account-dropdown { border-color: #315064; background: #132b3a; }
  .nav-dropdown a,
  .account-dropdown a,
  .account-dropdown button { color: #c8d9e2; }
  .nav-dropdown a:hover,
  .nav-dropdown a.active,
  .account-dropdown a:hover,
  .account-dropdown a.active,
  .account-dropdown button:hover { background: #1a3849; color: #edf6fa; }
  .account-meta { border-color: #315064; color: #edf6fa; }
  .account-meta span,
  .account-meta small { color: #94aab7; }
}

@media (max-width: 1100px) {
  .menu-toggle { display: flex; }
  .nav-links {
    position: fixed;
    top: 72px;
    right: 0;
    left: 0;
    max-height: calc(100vh - 72px);
    overflow-y: auto;
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
    padding: 1rem 1.5rem 1.5rem;
    border-bottom: 1px solid #d5e3ea;
    background: #f7fafc;
    box-shadow: 0 1.25rem 2.5rem rgba(35, 83, 112, 0.12);
    opacity: 0;
    pointer-events: none;
    transform: translateY(-0.75rem);
    visibility: hidden;
    transition: opacity 180ms ease, transform 220ms ease, visibility 220ms ease;
  }
  .nav-links.open { opacity: 1; pointer-events: auto; transform: translateY(0); visibility: visible; }
  .nav-link,
  .nav-login,
  .nav-summary,
  .account-summary { min-height: 46px; padding: 0.7rem 0; }
  .nav-link::after,
  .nav-summary::after { display: none; }
  .nav-group,
  .account-menu { width: 100%; }
  .nav-summary,
  .account-summary { justify-content: space-between; }
  .nav-dropdown,
  .account-dropdown { position: static; min-width: 0; margin-bottom: 0.35rem; padding: 0.35rem 0 0.35rem 0.7rem; border: 0; border-left: 1px solid #d5e3ea; border-radius: 0; background: transparent; box-shadow: none; }
  .nav-dropdown a,
  .account-dropdown a,
  .account-dropdown button { min-height: 44px; }
  .nav-context { max-width: none; align-self: flex-start; margin: 0.25rem 0; }
  .nav-user { background: transparent; padding: 0; }
  .account-meta { margin-right: 0; margin-left: 0; }
  .nav-cta { align-self: stretch; justify-content: center; margin-top: 0.25rem; }

  @media (prefers-color-scheme: dark) {
    .nav-links { border-color: #315064; background: #102431; }
    .nav-dropdown,
    .account-dropdown { border-color: #315064; background: transparent; }
  }
}
</style>
