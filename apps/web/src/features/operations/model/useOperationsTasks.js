import { computed, reactive, ref } from 'vue'

import { operationsApi } from '../api/operationsApi.js'
import {
  formatOperationTime,
  operationActionLabel,
  operationExportStatusLabel,
  operationModuleLabel,
  operationRiskLabel,
  operationResultLabel,
  operationRoleLabel,
  operationScopeLabel,
  operationTaskTypeLabel
} from '../lib/operationsViewModel.js'

const noop = () => {}

function saveOperationExport(result, taskId) {
  const url = URL.createObjectURL(result.blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = result.filename || `export-${taskId}.xlsx`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function useOperationsTasks({
  activeTab,
  ensureAuditUserNames,
  targetLabel,
  operatorLabel,
  loadExportTasks,
  api = operationsApi,
  notify = { success: noop, error: noop },
  saveFile = saveOperationExport
}) {
  const creatingTask = ref(false)
  const downloadingId = ref(null)
  const detailDialog = ref(false)
  const detailLoading = ref(false)
  const detailError = ref('')
  const detailData = ref(null)
  const exportForm = reactive({
    taskType: 'STUDENTS',
    scopeType: 'SCHOOL',
    filterJson: ''
  })

  const detailEntries = computed(() => {
    const detail = detailData.value || {}
    if (activeTab.value === 'audit') {
      return [
        ['时间', formatOperationTime(detail.createdAt)],
        ['模块', operationModuleLabel(detail.module)],
        ['操作', operationActionLabel(detail.action)],
        ['目标', targetLabel(detail)],
        ['操作者', operatorLabel(detail)],
        ['操作者角色', operationRoleLabel(detail.operatorRoleCode)],
        ['结果', operationResultLabel(detail.result)],
        ['风险等级', operationRiskLabel(detail.riskLevel)],
        ['IP 地址', detail.ipAddress],
        ['变更前', detail.beforeData],
        ['变更后', detail.afterData]
      ]
    }
    return [
      ['任务编号', detail.id],
      ['导出内容', operationTaskTypeLabel(detail.taskType)],
      ['数据范围', operationScopeLabel(detail.scopeType)],
      ['状态', operationExportStatusLabel(detail.status)],
      ['记录数', detail.recordCount],
      ['创建时间', formatOperationTime(detail.createdAt)],
      ['完成时间', formatOperationTime(detail.completedAt)],
      ['失败原因', detail.errorMessage]
    ]
  })

  async function openAuditDetail(log) {
    detailDialog.value = true
    detailLoading.value = true
    detailError.value = ''
    try {
      detailData.value = await api.getOpenAuditLog(log.id)
      await ensureAuditUserNames([detailData.value])
    } catch (error) {
      detailData.value = null
      detailError.value = error.message || '审计详情加载失败'
    } finally {
      detailLoading.value = false
    }
  }

  async function openExportDetail(task) {
    detailDialog.value = true
    detailLoading.value = true
    detailError.value = ''
    try {
      detailData.value = await api.getOpenExportTask(task.id)
    } catch (error) {
      detailData.value = null
      detailError.value = error.message || '导出任务详情加载失败'
    } finally {
      detailLoading.value = false
    }
  }

  async function createExportTask() {
    creatingTask.value = true
    try {
      let filterJson = exportForm.filterJson.trim()
      if (filterJson) filterJson = JSON.parse(filterJson)
      await api.createOpenExportTask({
        taskType: exportForm.taskType,
        scopeType: exportForm.scopeType,
        filterJson
      })
      await loadExportTasks()
      notify.success('导出任务已创建')
    } catch (error) {
      notify.error(
        error instanceof SyntaxError
          ? '过滤条件不是合法 JSON'
          : error.message || '导出任务创建失败'
      )
    } finally {
      creatingTask.value = false
    }
  }

  async function downloadTask(task) {
    downloadingId.value = task.id
    try {
      const result = await api.downloadOpenExportTask(task.id)
      if (!(result?.blob instanceof Blob)) {
        throw new Error('后端未返回可下载文件')
      }
      saveFile(result, task.id)
      notify.success('文件下载已开始')
    } catch (error) {
      notify.error(error.message || '文件下载失败')
    } finally {
      downloadingId.value = null
    }
  }

  return {
    createExportTask,
    creatingTask,
    detailData,
    detailDialog,
    detailEntries,
    detailError,
    detailLoading,
    downloadingId,
    downloadTask,
    exportForm,
    openAuditDetail,
    openExportDetail
  }
}
