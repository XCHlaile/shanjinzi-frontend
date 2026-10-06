import { reactive, ref } from 'vue'

import { operationsApi } from '../../operations/index.js'
import { schoolAdministrationApi } from '../../school-administration/index.js'
import { createStudentImportForm } from '../lib/rosterModel.js'
import { pageItems } from '../lib/rosterPresentation.js'

const noop = () => {}

export function downloadRosterFile(result, fallbackName) {
  if (!(result?.blob instanceof Blob)) throw new Error('后端未返回可下载文件')
  const url = URL.createObjectURL(result.blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = result.filename || fallbackName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function useStudentRosterTransfers({
  keyword,
  statusFilter,
  reloadRows,
  api = schoolAdministrationApi,
  exportApi = operationsApi,
  downloadFile = downloadRosterFile,
  notify = { success: noop, error: noop }
}) {
  const batchDialog = ref(false)
  const batchLoading = ref(false)
  const batchError = ref('')
  const importBatches = ref([])
  const importing = ref(false)
  const templateDownloading = ref(false)
  const studentImportFile = ref(null)
  const importInputKey = ref(0)
  const studentImportForm = reactive(createStudentImportForm())
  const exporting = ref(false)

  async function loadImportBatches() {
    batchLoading.value = true
    batchError.value = ''
    try {
      const payload = await api.listOpenStudentImportBatches({ page: 1, pageSize: 100 })
      importBatches.value = pageItems(payload)
    } catch (error) {
      importBatches.value = []
      batchError.value = error.message || '导入批次加载失败'
    } finally {
      batchLoading.value = false
    }
  }

  function openImportBatches() {
    batchDialog.value = true
    return loadImportBatches()
  }

  function selectImportFile(event) {
    studentImportFile.value = event.target.files?.[0] || null
  }

  async function downloadStudentImportTemplate() {
    templateDownloading.value = true
    try {
      const result = await api.downloadOpenStudentImportTemplate()
      downloadFile(result, '学生导入模板.xlsx')
      notify.success('导入模板已开始下载')
    } catch (error) {
      notify.error(error.message || '导入模板下载失败')
    } finally {
      templateDownloading.value = false
    }
  }

  async function submitStudentImport() {
    if (!studentImportFile.value || importing.value) return
    importing.value = true
    try {
      const batch = await api.importOpenStudents({
        file: studentImportFile.value,
        autoCreateClass: studentImportForm.autoCreateClass,
        remark: studentImportForm.remark || undefined
      })
      studentImportFile.value = null
      studentImportForm.remark = ''
      importInputKey.value += 1
      await loadImportBatches()
      await reloadRows({ refreshDetails: true })
      notify.success(`学生导入批次 #${batch?.id || '-'} 已创建`)
    } catch (error) {
      notify.error(error.message || '学生导入失败')
    } finally {
      importing.value = false
    }
  }

  async function createStudentExport() {
    exporting.value = true
    try {
      const task = await exportApi.createOpenExportTask({
        taskType: 'STUDENTS',
        scopeType: 'SCHOOL',
        filterJson: {
          keyword: keyword.value,
          status: statusFilter.value
        }
      })
      notify.success(`导出任务 #${task?.id || task?.taskId || '-'} 已创建，可到“审计与导出”查看进度`)
    } catch (error) {
      notify.error(error.message || '导出任务创建失败')
    } finally {
      exporting.value = false
    }
  }

  return {
    batchDialog,
    batchError,
    batchLoading,
    createStudentExport,
    downloadStudentImportTemplate,
    exporting,
    importBatches,
    importing,
    importInputKey,
    loadImportBatches,
    openImportBatches,
    selectImportFile,
    studentImportFile,
    studentImportForm,
    submitStudentImport,
    templateDownloading
  }
}
