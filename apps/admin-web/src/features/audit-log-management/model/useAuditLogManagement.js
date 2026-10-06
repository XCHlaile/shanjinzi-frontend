import { computed, ref } from 'vue'

import { saveBrowserFile } from '../../../shared/lib/browserDownload.js'
import { auditLogApi } from '../api/auditLogApi.js'
import {
  auditActionDescription as describeAuditAction,
  auditExportFilter,
  auditExportTaskDetail,
  auditMessageBroadcastDetail,
  auditOperatorLabel as describeAuditOperator,
  auditPageItems,
  auditReferenceKey,
  auditTargetDescription as describeAuditTarget,
  auditTitledDetail,
  auditUserDetail,
  auditUserName,
  matchesAuditLog
} from '../lib/auditLogViewModel.js'

const silentFeedback = {
  error() {},
  success() {}
}

export function useAuditLogManagement({
  api = auditLogApi,
  feedback = silentFeedback,
  saveFile = saveBrowserFile
} = {}) {
  const keyword = ref('')
  const range = ref([])
  const rows = ref([])
  const loading = ref(false)
  const loadError = ref('')
  const exporting = ref(false)
  const auditObjectDetails = ref(new Map())
  const auditOperatorNames = ref(new Map())

  function auditActionDescription(row) {
    return describeAuditAction(row, auditObjectDetails.value)
  }

  function auditTargetDescription(row) {
    return describeAuditTarget(row, auditObjectDetails.value)
  }

  function auditOperatorLabel(row) {
    return describeAuditOperator(row, auditOperatorNames.value)
  }

  const filteredRows = computed(() => rows.value.filter(row => matchesAuditLog(row, {
    keyword: keyword.value,
    range: range.value,
    objectDetails: auditObjectDetails.value,
    operatorNames: auditOperatorNames.value
  })))

  function auditReferenceSources() {
    const params = { page: 1, pageSize: 100 }
    return [
      {
        targetType: 'User',
        load: () => api.fetchUsers(params),
        detail: auditUserDetail
      },
      {
        targetType: 'ExportTask',
        load: () => api.fetchExportTasks(params),
        detail: auditExportTaskDetail
      },
      {
        targetType: 'NewsArticle',
        load: () => api.fetchNews(params),
        detail: auditTitledDetail
      },
      {
        targetType: 'NewsCategory',
        load: () => api.fetchNewsCategories(params),
        detail: item => item.name || item.code || ''
      },
      {
        targetType: 'Competition',
        load: () => api.fetchCompetitions(params),
        detail: auditTitledDetail
      },
      {
        targetType: 'School',
        load: () => api.fetchSchools(params),
        detail: item => item.name || ''
      },
      {
        targetType: 'PageContent',
        load: () => api.fetchPages(params),
        detail: auditTitledDetail
      }
    ]
  }

  async function loadAuditReferences(auditRows) {
    const sources = auditReferenceSources()
    const broadcastIds = Array.from(new Set(auditRows
      .filter(row => (
        row.targetType === 'MessageBroadcast'
        && row.targetId !== null
        && row.targetId !== undefined
      ))
      .map(row => row.targetId)))
    const [sourceResults, broadcastResults] = await Promise.all([
      Promise.allSettled(sources.map(source => source.load())),
      Promise.allSettled(broadcastIds.map(id => api.fetchMessageBroadcast(id)))
    ])
    const details = new Map()
    const operatorNames = new Map()

    sourceResults.forEach((result, index) => {
      if (result.status !== 'fulfilled') return
      const source = sources[index]
      auditPageItems(result.value).forEach(item => {
        const id = item.id ?? item.competitionId
        if (id === null || id === undefined || id === '') return
        const detail = source.detail(item)
        if (detail) details.set(auditReferenceKey(source.targetType, id), detail)
        if (source.targetType === 'User') {
          const name = auditUserName(item)
          if (name) operatorNames.set(String(id), name)
        }
      })
    })

    broadcastResults.forEach((result, index) => {
      if (result.status !== 'fulfilled') return
      const detail = auditMessageBroadcastDetail(result.value)
      if (detail) {
        details.set(auditReferenceKey('MessageBroadcast', broadcastIds[index]), detail)
      }
    })

    auditObjectDetails.value = details
    auditOperatorNames.value = operatorNames
  }

  async function loadData() {
    loading.value = true
    loadError.value = ''
    try {
      const auditRows = auditPageItems(
        await api.fetchAuditLogs({ page: 1, pageSize: 100 })
      )
      rows.value = auditRows
      await loadAuditReferences(auditRows)
      return true
    } catch (error) {
      rows.value = []
      auditObjectDetails.value = new Map()
      auditOperatorNames.value = new Map()
      loadError.value = error.message || '审计日志加载失败'
      feedback.error(loadError.value)
      return false
    } finally {
      loading.value = false
    }
  }

  async function exportAudit() {
    exporting.value = true
    try {
      saveFile(
        await api.exportAuditLogs(auditExportFilter({
          keyword: keyword.value,
          range: range.value
        })),
        '审计日志.csv'
      )
      feedback.success('审计日志已导出')
      return true
    } catch (error) {
      feedback.error(error.message || '审计日志导出失败')
      return false
    } finally {
      exporting.value = false
    }
  }

  return {
    auditActionDescription,
    auditObjectDetails,
    auditOperatorLabel,
    auditOperatorNames,
    auditTargetDescription,
    exportAudit,
    exporting,
    filteredRows,
    keyword,
    loadAuditReferences,
    loadData,
    loadError,
    loading,
    range,
    rows
  }
}
