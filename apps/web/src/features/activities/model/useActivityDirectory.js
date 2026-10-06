import { computed, nextTick, reactive, ref } from 'vue'

import { refreshCurrentUser } from '../../authentication/index.js'
import { activityApi } from '../api/activityApi.js'
import {
  activityBoundaryText,
  activityListTitle,
  activitySchoolId,
  normalizeActivityMoment
} from '../lib/activityViewModel.js'

const noop = () => {}

function defaultScrollToMoment(momentId) {
  document.getElementById(`moment-${momentId}`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  })
}

function defaultScrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function useActivityDirectory({
  role,
  currentStudent,
  initialUser = {},
  requestedMomentId = () => '',
  api = activityApi,
  refreshUser = refreshCurrentUser,
  scrollToMoment = defaultScrollToMoment,
  scrollToTop = defaultScrollToTop
}) {
  let user = initialUser
  let resetActiveMoment = noop
  let loadRelated = noop

  const currentSchoolId = ref(activitySchoolId(user))
  const listMode = ref('visible')
  const activityList = ref([])
  const pagination = reactive({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
  const loading = ref(false)
  const loadError = ref('')

  const studentContextId = currentStudent?.studentId
    ?? currentStudent?.id
    ?? currentStudent?.currentStudentId
    ?? ''
  const momentRequestOptions = role === 'parent'
    ? { currentStudentId: studentContextId }
    : { currentStudentId: '' }

  const boundaryText = computed(() => activityBoundaryText(role))
  const listTitle = computed(() => activityListTitle(role, listMode.value))
  const listEndpoint = computed(() => listMode.value === 'mine'
    ? 'GET /api/app/moments/mine'
    : 'GET /api/app/moments')

  function setActiveMomentReset(reset) {
    resetActiveMoment = typeof reset === 'function' ? reset : noop
  }

  function setRelatedLoader(loader) {
    loadRelated = typeof loader === 'function' ? loader : noop
  }

  async function refreshSchoolContext() {
    if (role !== 'school') return
    try {
      user = await refreshUser() || user
    } catch {}
    currentSchoolId.value = activitySchoolId(user)
  }

  function getRequestedMomentId() {
    return typeof requestedMomentId === 'function'
      ? requestedMomentId()
      : requestedMomentId
  }

  function isSourceTarget(id) {
    const momentId = getRequestedMomentId()
    return Boolean(momentId && String(momentId) === String(id))
  }

  async function focusRequestedMoment() {
    const momentId = getRequestedMomentId()
    if (!momentId) return
    let target = activityList.value.find(item => String(item.id) === String(momentId))
    if (!target) {
      try {
        target = normalizeActivityMoment(await api.fetchActivityDetail(momentId))
        activityList.value.unshift(target)
      } catch {
        return
      }
    }
    await nextTick()
    scrollToMoment(target.id)
  }

  async function loadActivities() {
    loading.value = true
    loadError.value = ''
    resetActiveMoment()
    try {
      const query = { page: pagination.page, pageSize: pagination.pageSize }
      const payload = listMode.value === 'mine'
        ? await api.fetchMyActivities(query, momentRequestOptions)
        : await api.fetchActivities(query, momentRequestOptions)
      activityList.value = (Array.isArray(payload?.items) ? payload.items : [])
        .map(normalizeActivityMoment)
      pagination.page = Number(payload?.page) || pagination.page
      pagination.pageSize = Number(payload?.pageSize) || pagination.pageSize
      pagination.total = Number(payload?.total) || 0
      pagination.totalPages = Number(payload?.totalPages) || 0
      await focusRequestedMoment()
    } catch (error) {
      activityList.value = []
      pagination.total = 0
      pagination.totalPages = 0
      loadError.value = error.message || '动态加载失败'
    } finally {
      loading.value = false
    }
  }

  async function switchList(mode) {
    if (listMode.value === mode) return
    listMode.value = mode
    pagination.page = 1
    await loadActivities()
  }

  async function changePage(page) {
    if (
      loading.value
      || page < 1
      || page > pagination.totalPages
      || page === pagination.page
    ) return
    pagination.page = page
    await loadActivities()
    scrollToTop()
  }

  async function initialize() {
    await refreshSchoolContext()
    await Promise.all([loadActivities(), loadRelated()])
  }

  return {
    activityList,
    boundaryText,
    changePage,
    currentSchoolId,
    initialize,
    isSourceTarget,
    listEndpoint,
    listMode,
    listTitle,
    loadActivities,
    loadError,
    loading,
    pagination,
    setActiveMomentReset,
    setRelatedLoader,
    switchList
  }
}
