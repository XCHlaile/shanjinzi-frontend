import { computed, ref } from 'vue'

import {
  authenticationApi,
  getCurrentUser,
  refreshCurrentUser
} from '../../authentication/index.js'
import {
  getCurrentStudent,
  setCurrentStudent
} from '../../student-context/index.js'
import { getRoleLabel, normalizeRole } from '../../../entities/user/index.js'
import {
  dashboardCardsFromSummary,
  dashboardContext,
  dashboardDescription,
  dashboardPrimaryTask,
  dashboardTitle,
  normalizeDashboardStudent,
  teacherDashboardCardsFromSummary
} from '../lib/dashboardViewModel.js'

const emptyNavigation = () => []

export function useDashboard({
  initialUser = getCurrentUser() || { role: 'parent' },
  initialStudent = getCurrentStudent(),
  api = authenticationApi,
  refreshUser = refreshCurrentUser,
  persistCurrentStudent = setCurrentStudent,
  navigationForRole = emptyNavigation,
  navigationGroupsForRole = emptyNavigation
} = {}) {
  const user = ref(initialUser)
  const currentStudent = ref(initialStudent)
  const cards = ref([])

  const role = computed(() => normalizeRole(user.value.role))
  const roleLabel = computed(() => getRoleLabel(role.value))
  const navItems = computed(() => navigationForRole(role.value))
  const navGroups = computed(() => navigationGroupsForRole(role.value))
  const primaryTask = computed(() => dashboardPrimaryTask(role.value, currentStudent.value))
  const quickItems = computed(() => primaryTask.value.quickPaths
    .map(path => navItems.value.find(item => item.path === path))
    .filter(Boolean))
  const title = computed(() => dashboardTitle(role.value, currentStudent.value))
  const description = computed(() => dashboardDescription(role.value))
  const context = computed(() => dashboardContext(role.value, currentStudent.value))
  const contextTitle = computed(() => context.value.title)
  const contextDesc = computed(() => context.value.description)

  async function loadDashboardSummary() {
    try {
      if (role.value === 'teacher') {
        const summary = await api.fetchTeacherWorkbenchSummary()
        const nextCards = teacherDashboardCardsFromSummary(summary)
        if (nextCards) cards.value = nextCards
        return
      }
      if (role.value !== 'parent') return
      const summary = await api.fetchHomeSummary()
      const nextCards = dashboardCardsFromSummary(summary)
      if (nextCards) cards.value = nextCards
      if (summary?.currentStudent) {
        const student = normalizeDashboardStudent(summary.currentStudent)
        currentStudent.value = student
        persistCurrentStudent(student)
      }
    } catch {}
  }

  async function loadCurrentUser() {
    try {
      user.value = await refreshUser() || user.value
    } catch {}
  }

  async function initialize() {
    await loadCurrentUser()
    await loadDashboardSummary()
  }

  return {
    cards,
    contextDesc,
    contextTitle,
    description,
    initialize,
    navGroups,
    navItems,
    primaryTask,
    quickItems,
    role,
    roleLabel,
    title
  }
}
