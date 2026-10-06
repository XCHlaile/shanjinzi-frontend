import { computed, ref } from 'vue'

import { saveBrowserFile } from '../../../shared/lib/browserDownload.js'
import { exportTaskApi } from '../api/exportTaskApi.js'
import {
  exportTaskItems,
  matchesExportTask
} from '../lib/exportTaskViewModel.js'

const silentFeedback = {
  error() {},
  success() {}
}

export function useExportTaskDirectory({
  api = exportTaskApi,
  feedback = silentFeedback,
  saveFile = saveBrowserFile
} = {}) {
  const type = ref('')
  const status = ref('')
  const rows = ref([])
  const loading = ref(false)
  const loadError = ref('')
  const creating = ref(false)
  const downloadingId = ref(null)

  const filteredRows = computed(() => rows.value.filter(row => matchesExportTask(row, {
    type: type.value,
    status: status.value
  })))

  async function loadData() {
    loading.value = true
    loadError.value = ''
    try {
      rows.value = exportTaskItems(await api.fetchTasks({ page: 1, pageSize: 100 }))
      return true
    } catch (error) {
      rows.value = []
      loadError.value = error.message || '导出任务加载失败'
      feedback.error(loadError.value)
      return false
    } finally {
      loading.value = false
    }
  }

  async function createExport() {
    if (!type.value) {
      feedback.error('请选择导出类型')
      return false
    }

    creating.value = true
    try {
      await api.createTask({
        taskType: type.value,
        scopeType: 'PLATFORM',
        filterJson: '{}'
      })
      feedback.success('导出任务已创建')
      await loadData()
      return true
    } catch (error) {
      feedback.error(error.message || '导出任务创建失败')
      return false
    } finally {
      creating.value = false
    }
  }

  async function download(row) {
    downloadingId.value = row.id
    try {
      saveFile(
        await api.downloadTask(row.id),
        `export-${row.id}.csv`
      )
      return true
    } catch (error) {
      feedback.error(error.message || '导出文件下载失败')
      return false
    } finally {
      downloadingId.value = null
    }
  }

  return {
    createExport,
    creating,
    download,
    downloadingId,
    filteredRows,
    loadData,
    loadError,
    loading,
    rows,
    status,
    type
  }
}
