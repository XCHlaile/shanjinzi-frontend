import { reactive, ref } from 'vue'

import { handleAdminAuthorizationError } from '../../../shared/lib/adminAuthorization.js'
import { newsExportFilter, newsListParams, normalizeArticlePage, normalizeCategoryPage } from '../lib/newsManagementViewModel.js'

export function useNewsDirectory({
  api,
  feedback,
  onUnauthorized,
  saveFile
}) {
  const filters = reactive({ keyword: '', categoryId: '', status: '' })
  const rows = ref([])
  const categories = ref([])
  const loading = ref(false)
  const loadError = ref('')
  const exporting = ref(false)

  function defaultCategoryId() {
    return categories.value[0]?.id ?? null
  }

  function handleAdminError(error, fallback, { silent = false } = {}) {
    if (handleAdminAuthorizationError(error, { feedback, onUnauthorized })) return true
    if (!silent) feedback.error(error?.message || fallback)
    return false
  }

  async function loadCategories() {
    categories.value = normalizeCategoryPage(
      await api.fetchCategories({ page: 1, pageSize: 100 })
    )
    return categories.value
  }

  async function loadData(options = {}) {
    const silent = options?.silent === true
    loading.value = true
    loadError.value = ''
    try {
      await loadCategories()
      rows.value = normalizeArticlePage(
        await api.fetchArticles(newsListParams(filters))
      )
      return true
    } catch (error) {
      loadError.value = error?.message || '资讯列表加载失败'
      handleAdminError(error, '资讯列表加载失败', { silent })
      return false
    } finally {
      loading.value = false
    }
  }

  async function exportNews() {
    exporting.value = true
    try {
      saveFile(
        await api.exportArticles(newsExportFilter(filters)),
        '资讯列表.csv'
      )
      feedback.success('资讯数据已导出')
      return true
    } catch (error) {
      handleAdminError(error, '资讯导出失败')
      return false
    } finally {
      exporting.value = false
    }
  }

  function refreshNewsListAfterSave() {
    void loadData({ silent: true })
  }

  function refreshCategoriesAfterSave() {
    void loadCategories().catch(error => {
      handleAdminError(error, '分类列表刷新失败', { silent: true })
    })
  }

  return {
    categories,
    defaultCategoryId,
    exportNews,
    exporting,
    filters,
    handleAdminError,
    loadCategories,
    loadData,
    loadError,
    loading,
    refreshCategoriesAfterSave,
    refreshNewsListAfterSave,
    rows
  }
}
