import { reactive, ref } from 'vue'

import { schoolAdministrationApi } from '../../school-administration/index.js'
import { operationsApi } from '../api/operationsApi.js'
import {
  operationOperatorLabel,
  operationPageItems,
  operationTargetLabel,
  operationUserName
} from '../lib/operationsViewModel.js'

export function useOperationsDirectory({
  pageSize = 20,
  api = operationsApi,
  userApi = schoolAdministrationApi
} = {}) {
  const activeTab = ref('audit')
  const auditLogs = ref([])
  const exportTasks = ref([])
  const page = ref(1)
  const total = ref(0)
  const totalPages = ref(0)
  const loading = ref(false)
  const error = ref('')
  const userNames = ref({})
  const auditFilters = reactive({ module: '', action: '', riskLevel: '' })

  function applyPage(payload, target) {
    target.value = operationPageItems(payload)
    total.value = Number(payload?.total ?? target.value.length)
    totalPages.value = Number(payload?.totalPages ?? (target.value.length ? 1 : 0))
  }

  function clearPage(target) {
    target.value = []
    total.value = 0
    totalPages.value = 0
  }

  function targetLabel(log = {}) {
    return operationTargetLabel(log, userNames.value)
  }

  function operatorLabel(log = {}) {
    return operationOperatorLabel(log, userNames.value)
  }

  async function ensureAuditUserNames(logs = []) {
    const ids = [...new Set(logs.flatMap(log => {
      const values = [Number(log.operatorUserId)]
      if (String(log.targetType || '').toUpperCase() === 'USER') {
        values.push(Number(log.targetId))
      }
      return values.filter(Number.isFinite)
    }))].filter(id => !userNames.value[String(id)])
    if (!ids.length) return

    const results = await Promise.allSettled(ids.map(async id => {
      const user = await userApi.getOpenUser(id)
      return [id, operationUserName(user)]
    }))
    const next = { ...userNames.value }
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value[1]) {
        next[String(result.value[0])] = result.value[1]
      }
    })
    userNames.value = next
  }

  async function loadAuditLogs() {
    loading.value = true
    error.value = ''
    try {
      const payload = await api.listOpenAuditLogs({
        page: page.value,
        pageSize,
        module: auditFilters.module || undefined,
        action: auditFilters.action || undefined,
        riskLevel: auditFilters.riskLevel || undefined
      })
      applyPage(payload, auditLogs)
      await ensureAuditUserNames(auditLogs.value)
    } catch (loadError) {
      clearPage(auditLogs)
      error.value = loadError.message || '审计日志加载失败'
    } finally {
      loading.value = false
    }
  }

  async function loadExportTasks() {
    loading.value = true
    error.value = ''
    try {
      applyPage(
        await api.listOpenExportTasks({ page: page.value, pageSize }),
        exportTasks
      )
    } catch (loadError) {
      clearPage(exportTasks)
      error.value = loadError.message || '导出任务加载失败'
    } finally {
      loading.value = false
    }
  }

  function switchTab(tab) {
    activeTab.value = tab
    page.value = 1
    total.value = 0
    totalPages.value = 0
    return tab === 'audit' ? loadAuditLogs() : loadExportTasks()
  }

  function changePage(nextPage) {
    page.value = nextPage
    return activeTab.value === 'audit' ? loadAuditLogs() : loadExportTasks()
  }

  return {
    activeTab,
    auditFilters,
    auditLogs,
    changePage,
    ensureAuditUserNames,
    error,
    exportTasks,
    loading,
    loadAuditLogs,
    loadExportTasks,
    operatorLabel,
    page,
    switchTab,
    targetLabel,
    total,
    totalPages
  }
}
