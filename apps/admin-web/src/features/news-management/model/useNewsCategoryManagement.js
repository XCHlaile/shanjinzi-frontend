import { reactive, ref } from 'vue'

import {
  newsCategoryMatchesPayload,
  newsCategoryPayload,
  newsCategoryUpdatePayload,
  normalizeNewsCategory
} from '../../../api/payloads/newsPayloads.js'
import {
  categoryForm as categoryEditForm,
  emptyCategoryForm,
  normalizeCategoryPage,
  upsertCategoryRows
} from '../lib/newsManagementViewModel.js'

function isDialogCancellation(error) {
  return error === 'cancel' || error === 'close'
}

export function useNewsCategoryManagement({
  api,
  categories,
  dialogs,
  feedback,
  handleAdminError,
  loadCategories,
  refreshCategoriesAfterSave
}) {
  const categorySaving = ref(false)
  const categoryManagerVisible = ref(false)
  const categoryEditingId = ref(null)
  const categoryForm = reactive(emptyCategoryForm())

  function resetCategoryForm() {
    categoryEditingId.value = null
    Object.assign(categoryForm, emptyCategoryForm())
  }

  async function recoverSavedCategory(payload, categoryId) {
    try {
      if (categoryId) {
        const category = await api.fetchCategory(categoryId)
        return newsCategoryMatchesPayload(category, payload)
          ? normalizeNewsCategory(category)
          : null
      }
      return normalizeCategoryPage(await api.fetchCategories({
        page: 1,
        pageSize: 100,
        keyword: payload.name
      })).find(category => newsCategoryMatchesPayload(category, payload)) || null
    } catch {
      return null
    }
  }

  function openCategoryManager() {
    resetCategoryForm()
    categoryManagerVisible.value = true
  }

  function editCategory(row) {
    categoryEditingId.value = row.id
    Object.assign(categoryForm, categoryEditForm(row))
  }

  async function saveCategory() {
    if (!String(categoryForm.name || '').trim()) {
      feedback.error('请填写分类名称')
      return false
    }
    const payload = categoryEditingId.value
      ? newsCategoryUpdatePayload(categoryForm)
      : newsCategoryPayload(categoryForm)
    categorySaving.value = true
    try {
      const savedCategory = categoryEditingId.value
        ? await api.updateCategory(categoryEditingId.value, payload)
        : await api.createCategory(payload)
      categories.value = upsertCategoryRows(categories.value, savedCategory)
      feedback.success('分类已保存')
      resetCategoryForm()
      refreshCategoriesAfterSave()
      return true
    } catch (error) {
      const savedCategory = await recoverSavedCategory(
        payload,
        categoryEditingId.value
      )
      if (savedCategory) {
        categories.value = upsertCategoryRows(categories.value, savedCategory)
        feedback.success('分类已保存')
        resetCategoryForm()
        refreshCategoriesAfterSave()
        return true
      }
      handleAdminError(error, '分类保存失败')
      return false
    } finally {
      categorySaving.value = false
    }
  }

  async function deleteCategory(row) {
    try {
      await dialogs.confirm(
        `确认删除分类 ${row.name}？`,
        '删除分类',
        { type: 'warning' }
      )
      await api.deleteCategory(row.id)
      feedback.success('分类已删除')
      resetCategoryForm()
      await loadCategories()
      return true
    } catch (error) {
      if (!isDialogCancellation(error)) handleAdminError(error, '分类删除失败')
      return false
    }
  }

  return {
    categoryEditingId,
    categoryForm,
    categoryManagerVisible,
    categorySaving,
    deleteCategory,
    editCategory,
    openCategoryManager,
    recoverSavedCategory,
    resetCategoryForm,
    saveCategory
  }
}
