import { ref } from 'vue'
import { createLatestRequestGuard, createTtlCache, mapWithConcurrency } from '../../../../../../config/asyncRuntime.mjs'

import {
  getCurrentUser,
  refreshCurrentUser
} from '../../authentication/index.js'
import { schoolAdministrationApi } from '../../school-administration/index.js'
import {
  normalizeStudentRosterRow,
  studentListNeedsDetail,
  studentSearchFields
} from '../lib/rosterModel.js'
import {
  pageItems,
  schoolIdOf
} from '../lib/rosterPresentation.js'

export function useRosterDirectory({
  mode,
  modeLabel,
  roleCode,
  pageSize = 20,
  api = schoolAdministrationApi,
  getUser = getCurrentUser,
  refreshUser = refreshCurrentUser
}) {
  const rows = ref([])
  const keyword = ref('')
  const statusFilter = ref('')
  const classIdFilter = ref('')
  const page = ref(1)
  const total = ref(0)
  const totalPages = ref(0)
  const loading = ref(false)
  const loadError = ref('')
  const loadFailure = ref(null)
  const loadGuard = createLatestRequestGuard()
  const studentDetailCache = createTtlCache({ ttlMs: 60_000, maxEntries: 200 })

  async function resolveSchoolId(fallbackSchoolId) {
    let user = getUser() || {}
    let currentSchoolId = schoolIdOf(user)
    if (!currentSchoolId) {
      try {
        user = await refreshUser() || user
      } catch {}
      currentSchoolId = schoolIdOf(user)
    }
    if (!currentSchoolId) throw new Error('当前校方账号未关联学校')
    if (fallbackSchoolId && String(fallbackSchoolId) !== String(currentSchoolId)) {
      throw new Error('无权访问其他学校的数据')
    }
    return currentSchoolId
  }

  async function loadStudentRosterRow(student, currentSchoolId) {
    const detail = studentListNeedsDetail(student)
      ? await studentDetailCache.getOrLoad(String(student.id), () => api.getOpenStudent(student.id)).catch(() => null)
      : null
    if (detail && String(schoolIdOf(detail)) !== String(currentSchoolId)) {
      throw new Error('学生详情不属于当前学校')
    }
    return normalizeStudentRosterRow(student, detail)
  }

  async function searchStudentRows(params) {
    const search = keyword.value.trim()
    if (!search) return api.listOpenStudents(params)

    const filters = studentSearchFields(search)
    let emptyPayload = null
    let firstError = null
    for (const filter of filters) {
      try {
        const payload = await api.listOpenStudents({ ...params, [filter]: search })
        if (Number(payload?.total) > 0 || pageItems(payload).length > 0) return payload
        emptyPayload ||= payload
      } catch (error) {
        firstError ||= error
      }
    }
    if (emptyPayload) return emptyPayload
    throw firstError || new Error('学生查询失败')
  }

  async function loadRows({ refreshDetails = false } = {}) {
    const request = loadGuard.begin()
    request.commit(() => {
      loading.value = true
      loadError.value = ''
      loadFailure.value = null
    })
    try {
      if (refreshDetails) studentDetailCache.clear()
      const currentSchoolId = await resolveSchoolId()
      const payload = mode.value === 'students'
        ? await searchStudentRows({
            schoolId: currentSchoolId,
            page: page.value,
            pageSize,
            status: statusFilter.value || undefined
          })
        : await api.listOpenUsers({
            schoolId: currentSchoolId,
            page: page.value,
            pageSize,
            realName: keyword.value || undefined,
            roleCode: roleCode.value,
            status: statusFilter.value || undefined,
            classId: classIdFilter.value || undefined
          })
      const listedRows = pageItems(payload)
      const scopedRows = listedRows.filter(item => (
        String(schoolIdOf(item)) === String(currentSchoolId)
      ))
      const nextRows = mode.value === 'students'
        ? await mapWithConcurrency(scopedRows, item => loadStudentRosterRow(item, currentSchoolId), 4)
        : scopedRows
      const responseStayedInScope = scopedRows.length === listedRows.length
      request.commit(() => {
        rows.value = nextRows
        total.value = responseStayedInScope
          ? Number(payload?.total ?? nextRows.length)
          : nextRows.length
        totalPages.value = responseStayedInScope
          ? Number(payload?.totalPages ?? (nextRows.length ? 1 : 0))
          : (nextRows.length ? 1 : 0)
      })
    } catch (error) {
      request.commit(() => {
        rows.value = []
        total.value = 0
        totalPages.value = 0
        loadError.value = error.message || `${modeLabel.value}数据加载失败`
        loadFailure.value = error
      })
    } finally {
      request.commit(() => { loading.value = false })
    }
  }

  function submitSearch() {
    page.value = 1
    return loadRows()
  }

  function changePage(nextPage) {
    page.value = nextPage
    return loadRows()
  }

  return {
    changePage,
    classIdFilter,
    keyword,
    loadError,
    loadFailure,
    loading,
    loadRows,
    page,
    resolveSchoolId,
    rows,
    statusFilter,
    submitSearch,
    total,
    totalPages
  }
}
