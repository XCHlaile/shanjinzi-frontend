import { reactive, ref } from 'vue'

import { pageItems, pageTotal } from '../../../entities/student/index.js'
import { saveBrowserFile } from '../../../shared/lib/browserDownload.js'
import {
  acceptsStudentImportFile,
  emptyStudentImportOptions,
  queryValue
} from '../lib/studentManagementViewModel.js'

export function useStudentImport({
  api,
  feedback,
  saveFile = saveBrowserFile
}) {
  const templateDownloading = ref(false)
  const importDialogVisible = ref(false)
  const importing = ref(false)
  const importUploadRef = ref(null)
  const selectedImportFile = ref(null)
  const importOptions = reactive(emptyStudentImportOptions())
  const batchesDialogVisible = ref(false)
  const batchesLoading = ref(false)
  const importBatches = ref([])
  const batchPagination = reactive({ page: 1, pageSize: 20, total: 0 })
  const batchDetailDialogVisible = ref(false)
  const importBatchDetail = ref(null)

  async function downloadStudentImportTemplate() {
    templateDownloading.value = true
    try {
      saveFile(await api.downloadImportTemplate(), 'student-import-template.xlsx')
      feedback.success('学生导入模板下载成功')
      return true
    } catch (error) {
      feedback.error(error?.message || '学生导入模板下载失败')
      return false
    } finally {
      templateDownloading.value = false
    }
  }

  function openStudentImport() {
    selectedImportFile.value = null
    Object.assign(importOptions, emptyStudentImportOptions())
    importUploadRef.value?.clearFiles()
    importDialogVisible.value = true
  }

  function selectImportFile(uploadFile) {
    const file = uploadFile.raw || null
    if (!acceptsStudentImportFile(file)) {
      selectedImportFile.value = null
      importUploadRef.value?.clearFiles()
      feedback.error('仅支持 CSV、XLS 或 XLSX 学生名单文件')
      return false
    }
    selectedImportFile.value = file
    return true
  }

  function removeImportFile() {
    selectedImportFile.value = null
  }

  function updateImportOption(field, value) {
    if (Object.hasOwn(importOptions, field)) importOptions[field] = value
  }

  async function submitStudentImport() {
    if (!selectedImportFile.value) {
      feedback.error('请选择学生名单文件')
      return false
    }
    importing.value = true
    try {
      const result = await api.importStudents(selectedImportFile.value, {
        schoolId: queryValue(importOptions.schoolId),
        autoCreateClass: importOptions.autoCreateClass,
        remark: queryValue(importOptions.remark.trim())
      })
      feedback.success(result?.id ? `学生导入批次 ${result.id} 已提交` : '学生导入任务已提交')
      importDialogVisible.value = false
      importUploadRef.value?.clearFiles()
      selectedImportFile.value = null
      importBatchDetail.value = result || null
      batchPagination.page = 1
      batchesDialogVisible.value = true
      await loadImportBatches()
      return true
    } catch (error) {
      feedback.error(error?.message || '学生名单导入失败')
      return false
    } finally {
      importing.value = false
    }
  }

  function openImportBatches() {
    batchPagination.page = 1
    batchesDialogVisible.value = true
    return loadImportBatches()
  }

  function changeImportBatchPage(page) {
    batchPagination.page = page
    return loadImportBatches()
  }

  async function loadImportBatches() {
    batchesLoading.value = true
    try {
      const payload = await api.fetchImportBatches({
        page: batchPagination.page,
        pageSize: batchPagination.pageSize
      })
      importBatches.value = pageItems(payload)
      batchPagination.total = pageTotal(payload)
      return true
    } catch (error) {
      importBatches.value = []
      batchPagination.total = 0
      feedback.error(error?.message || '导入批次加载失败')
      return false
    } finally {
      batchesLoading.value = false
    }
  }

  async function openImportBatchDetail(row) {
    try {
      importBatchDetail.value = await api.fetchImportBatch(row.id)
      batchDetailDialogVisible.value = true
      return true
    } catch (error) {
      feedback.error(error?.message || '导入批次详情加载失败')
      return false
    }
  }

  return {
    batchDetailDialogVisible,
    batchPagination,
    batchesDialogVisible,
    batchesLoading,
    changeImportBatchPage,
    downloadStudentImportTemplate,
    importBatchDetail,
    importBatches,
    importDialogVisible,
    importing,
    importOptions,
    importUploadRef,
    loadImportBatches,
    openImportBatchDetail,
    openImportBatches,
    openStudentImport,
    removeImportFile,
    selectImportFile,
    selectedImportFile,
    submitStudentImport,
    templateDownloading,
    updateImportOption
  }
}
