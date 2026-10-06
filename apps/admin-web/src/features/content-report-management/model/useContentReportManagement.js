import { reactive, ref } from 'vue'

import { contentReportManagementApi } from '../api/contentReportManagementApi.js'
import {
  contentReportHandlePayload,
  contentReportPageItems,
  contentReportPageTotal,
  contentReportQuery,
  contentReportSchoolName,
  contentReportSchoolOptions,
  reportSchoolLabel
} from '../lib/contentReportViewModel.js'

const silentFeedback = {
  error() {},
  success() {}
}

const permissiveConfirmation = {
  async confirm() {}
}

export function useContentReportManagement({
  api = contentReportManagementApi,
  confirmation = permissiveConfirmation,
  feedback = silentFeedback
} = {}) {
  const filters = reactive({ schoolId: null, status: '', targetType: '' })
  const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
  const rows = ref([])
  const loading = ref(false)
  const loadError = ref('')
  const schoolOptions = ref([])
  const schoolNames = ref({})
  const detailVisible = ref(false)
  const detailLoading = ref(false)
  const reportDetail = ref(null)
  const handleVisible = ref(false)
  const handling = ref(false)
  const activeReport = ref(null)
  const handleForm = reactive({ action: '', note: '' })

  async function loadSchoolOptions() {
    try {
      schoolOptions.value = contentReportSchoolOptions(
        contentReportPageItems(await api.fetchSchools({ page: 1, pageSize: 100 }))
      )
      schoolNames.value = Object.fromEntries(
        schoolOptions.value.map(school => [String(school.value), school.label])
      )
      return true
    } catch {
      schoolOptions.value = []
      schoolNames.value = {}
      return false
    }
  }

  async function ensureReportSchool(report = {}) {
    const schoolId = Number(report.schoolId)
    if (
      !Number.isFinite(schoolId)
      || report.schoolName
      || schoolNames.value[String(schoolId)]
    ) {
      return
    }

    try {
      const name = reportSchoolLabel(await api.fetchSchool(schoolId))
      if (name) {
        schoolNames.value = {
          ...schoolNames.value,
          [String(schoolId)]: name
        }
      }
    } catch {
      // A report remains usable even if its school cannot be resolved.
    }
  }

  function reportSchoolName(report = {}) {
    return contentReportSchoolName(report, schoolNames.value)
  }

  async function loadReports() {
    loading.value = true
    loadError.value = ''
    try {
      const payload = await api.fetchReports(contentReportQuery(filters, pagination))
      rows.value = contentReportPageItems(payload)
      pagination.total = contentReportPageTotal(payload)
      return true
    } catch (error) {
      rows.value = []
      pagination.total = 0
      loadError.value = error.message || '内容举报加载失败'
      feedback.error(loadError.value)
      return false
    } finally {
      loading.value = false
    }
  }

  function searchReports() {
    pagination.page = 1
    return loadReports()
  }

  function resetFilters() {
    Object.assign(filters, { schoolId: null, status: '', targetType: '' })
    pagination.page = 1
    return loadReports()
  }

  function handlePageSizeChange() {
    pagination.page = 1
    return loadReports()
  }

  async function openDetail(row) {
    detailVisible.value = true
    detailLoading.value = true
    reportDetail.value = null
    try {
      const detail = await api.fetchReport(row.reportId)
      await ensureReportSchool(detail)
      reportDetail.value = detail
      return true
    } catch (error) {
      feedback.error(error.message || '举报详情加载失败')
      return false
    } finally {
      detailLoading.value = false
    }
  }

  function openHandle(row) {
    activeReport.value = row
    Object.assign(handleForm, { action: '', note: '' })
    handleVisible.value = true
  }

  async function submitHandle() {
    if (!String(handleForm.action || '').trim()) {
      feedback.error('请输入处理动作 action')
      return false
    }

    try {
      await confirmation.confirm(
        '同一举报只能处理一次，确认提交当前处理结果？',
        '确认处理',
        { type: 'warning' }
      )
    } catch (error) {
      if (error === 'cancel' || error === 'close') return false
      feedback.error(error.message || '无法确认举报处理')
      return false
    }

    handling.value = true
    try {
      const updated = await api.handleReport(
        activeReport.value.reportId,
        contentReportHandlePayload(handleForm)
      )
      feedback.success('举报已处理')
      handleVisible.value = false
      if (reportDetail.value?.reportId === updated?.reportId) {
        reportDetail.value = updated
      }
      await loadReports()
      return true
    } catch (error) {
      feedback.error(error.message || '举报处理失败')
      return false
    } finally {
      handling.value = false
    }
  }

  async function initialize() {
    await loadSchoolOptions()
    return loadReports()
  }

  return {
    activeReport,
    detailLoading,
    detailVisible,
    ensureReportSchool,
    filters,
    handleForm,
    handlePageSizeChange,
    handleVisible,
    handling,
    initialize,
    loadError,
    loading,
    loadReports,
    loadSchoolOptions,
    openDetail,
    openHandle,
    pagination,
    reportDetail,
    reportSchoolName,
    resetFilters,
    rows,
    schoolNames,
    schoolOptions,
    searchReports,
    submitHandle
  }
}
