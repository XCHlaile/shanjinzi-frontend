import { reactive, ref } from 'vue'
import { createLatestRequestGuard, createTtlCache, mapWithConcurrency } from '../../../../../../config/asyncRuntime.mjs'

import { countBoundGuardians } from '../../../api/payloads/studentPayloads.js'
import { pageItems, pageTotal } from '../../../entities/student/index.js'
import {
  emptyStudentFilters,
  normalizeStudentListRow,
  studentListNeedsDetail,
  studentFilterPayload
} from '../lib/studentManagementViewModel.js'

export function useStudentList({
  api,
  feedback,
  saveFile
}) {
  const filters = reactive(emptyStudentFilters())
  const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
  const rows = ref([])
  const schools = ref([])
  const loading = ref(false)
  const loadError = ref('')
  const loadFailure = ref(null)
  const exporting = ref(false)
  const loadGuard = createLatestRequestGuard()
  const studentDetailCache = createTtlCache({ ttlMs: 60_000, maxEntries: 200 })

  async function loadSchools() {
    try {
      const payload = await api.fetchSchools({ page: 1, pageSize: 100 })
      schools.value = pageItems(payload).filter(school => school.status !== 'DISABLED')
    } catch {
      schools.value = []
    }
  }

  async function loadGuardianSummary(student) {
    try {
      return { guardianCount: countBoundGuardians(await api.fetchGuardians(student.id)) }
    } catch {
      return { guardianCount: Number(student.guardianCount) || 0 }
    }
  }

  async function loadStudentListRow(student) {
    const detail = studentListNeedsDetail(student)
      ? await studentDetailCache.getOrLoad(String(student.id), () => api.fetchStudent(student.id)).catch(() => null)
      : null
    return normalizeStudentListRow(student, detail)
  }

  async function loadStudents({ refreshDetails = false } = {}) {
    const request = loadGuard.begin()
    request.commit(() => {
      loading.value = true
      loadError.value = ''
      loadFailure.value = null
    })
    try {
      if (refreshDetails) studentDetailCache.clear()
      const payload = await api.fetchStudents({
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...studentFilterPayload(filters)
      })
      const nextRows = await mapWithConcurrency(pageItems(payload), loadStudentListRow, 5)
      request.commit(() => {
        rows.value = nextRows
        pagination.total = pageTotal(payload)
      })
      return true
    } catch (error) {
      request.commit(() => {
        rows.value = []
        pagination.total = 0
        loadError.value = error?.message || '学生列表加载失败'
        loadFailure.value = error
      })
      return false
    } finally {
      request.commit(() => { loading.value = false })
    }
  }

  function searchStudents() {
    pagination.page = 1
    return loadStudents()
  }

  function resetFilters() {
    Object.assign(filters, emptyStudentFilters())
    pagination.page = 1
    return loadStudents()
  }

  function handlePageSizeChange() {
    pagination.page = 1
    return loadStudents()
  }

  async function exportStudents() {
    exporting.value = true
    try {
      saveFile(await api.exportStudents(studentFilterPayload(filters)), '学生列表.csv')
      feedback.success('学生数据已导出')
      return true
    } catch (error) {
      feedback.error(error?.message || '学生导出失败')
      return false
    } finally {
      exporting.value = false
    }
  }

  return {
    exportStudents,
    exporting,
    filters,
    handlePageSizeChange,
    loadGuardianSummary,
    loadSchools,
    loadStudents,
    loading,
    loadError,
    loadFailure,
    pagination,
    resetFilters,
    rows,
    schools,
    searchStudents
  }
}
