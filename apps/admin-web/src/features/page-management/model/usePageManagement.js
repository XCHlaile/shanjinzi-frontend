import { computed, reactive, ref } from 'vue'

import { pageManagementApi } from '../api/pageManagementApi.js'
import {
  adminPageForm,
  adminPageItems,
  adminPagePayload,
  emptyAdminPageForm,
  matchesAdminPage,
  normalizeAdminPage
} from '../lib/pageManagementViewModel.js'

const silentFeedback = {
  error() {},
  success() {}
}

const permissiveConfirmation = {
  async confirm() {}
}

export function usePageManagement({
  api = pageManagementApi,
  confirmation = permissiveConfirmation,
  feedback = silentFeedback
} = {}) {
  const keyword = ref('')
  const status = ref('')
  const rows = ref([])
  const loading = ref(false)
  const loadError = ref('')
  const exporting = ref(false)
  const saving = ref(false)
  const dialogVisible = ref(false)
  const editingId = ref(null)
  const form = reactive(emptyAdminPageForm())

  const filteredRows = computed(() => rows.value.filter(row => matchesAdminPage(row, {
    keyword: keyword.value,
    status: status.value
  })))

  async function loadData() {
    loading.value = true
    loadError.value = ''
    try {
      rows.value = adminPageItems(await api.fetchPages({ page: 1, pageSize: 100 }))
        .map(normalizeAdminPage)
      return true
    } catch (error) {
      rows.value = []
      loadError.value = error.message || '页面列表加载失败'
      feedback.error(loadError.value)
      return false
    } finally {
      loading.value = false
    }
  }

  async function exportPages() {
    exporting.value = true
    try {
      await api.exportPages({
        keyword: keyword.value.trim(),
        status: status.value
      })
      feedback.success('页面导出任务已创建')
      return true
    } catch (error) {
      feedback.error(error.message || '页面导出任务创建失败')
      return false
    } finally {
      exporting.value = false
    }
  }

  function openCreate() {
    editingId.value = null
    Object.assign(form, emptyAdminPageForm())
    dialogVisible.value = true
  }

  function openEdit(row) {
    editingId.value = row.id
    Object.assign(form, adminPageForm(row))
    dialogVisible.value = true
  }

  async function savePage() {
    if (!form.route.trim() || !form.title.trim()) {
      feedback.error('请填写路由和标题')
      return false
    }

    saving.value = true
    try {
      if (editingId.value) {
        await api.updatePage(form.route, adminPagePayload(form))
      } else {
        await api.createPage(adminPagePayload(form, { includeKey: true }))
      }
      feedback.success('页面已保存')
      dialogVisible.value = false
      await loadData()
      return true
    } catch (error) {
      feedback.error(error.message || '页面保存失败')
      return false
    } finally {
      saving.value = false
    }
  }

  async function publishPage(row) {
    try {
      await api.publishPage(row.route || row.pageKey)
      feedback.success('页面已发布')
      await loadData()
      return true
    } catch (error) {
      feedback.error(error.message || '页面发布失败')
      return false
    }
  }

  async function removePage(row) {
    try {
      await confirmation.confirm(`确认删除页面 ${row.title}？`, '删除页面', { type: 'warning' })
    } catch {
      return false
    }

    try {
      await api.offlinePage(row.route || row.pageKey)
      feedback.success('页面已删除')
      await loadData()
      return true
    } catch (error) {
      feedback.error(error.message || '页面删除失败')
      return false
    }
  }

  return {
    dialogVisible,
    editingId,
    exportPages,
    exporting,
    filteredRows,
    form,
    keyword,
    loadData,
    loadError,
    loading,
    openCreate,
    openEdit,
    publishPage,
    removePage,
    rows,
    savePage,
    saving,
    status
  }
}
