import { reactive, ref } from 'vue'

import {
  newsArticleCategoryPayload,
  newsPinPayload,
  newsSchedulePayload,
  newsSortOrderPayload
} from '../../../api/payloads/newsPayloads.js'
import {
  articleCategoryActionForm,
  articleScheduleActionForm,
  articleSortActionForm,
  emptyArticleActionForm
} from '../lib/newsManagementViewModel.js'

function isDialogCancellation(error) {
  return error === 'cancel' || error === 'close'
}

export function useNewsArticleActions({
  api,
  defaultCategoryId,
  dialogs,
  feedback,
  handleAdminError,
  loadData
}) {
  const actionSaving = ref(false)
  const categoryChangeVisible = ref(false)
  const sortVisible = ref(false)
  const scheduleVisible = ref(false)
  const selectedArticle = ref(null)
  const articleActionForm = reactive(emptyArticleActionForm())

  async function confirmArticleAction({
    row,
    confirmMessage,
    confirmTitle,
    action,
    successMessage,
    errorMessage
  }) {
    try {
      await dialogs.confirm(confirmMessage, confirmTitle, { type: 'warning' })
      await action(row.id)
      feedback.success(successMessage)
      await loadData()
      return true
    } catch (error) {
      if (!isDialogCancellation(error)) handleAdminError(error, errorMessage)
      return false
    }
  }

  function publishNews(row) {
    return confirmArticleAction({
      row,
      confirmMessage: `确认发布资讯 ${row.title}？`,
      confirmTitle: '发布资讯',
      action: api.publishArticle,
      successMessage: '资讯已发布',
      errorMessage: '资讯发布失败'
    })
  }

  function offlineNews(row) {
    return confirmArticleAction({
      row,
      confirmMessage: `确认下线资讯 ${row.title}？`,
      confirmTitle: '下线资讯',
      action: api.offlineArticle,
      successMessage: '资讯已下线',
      errorMessage: '资讯下线失败'
    })
  }

  async function togglePin(row) {
    try {
      await api.pinArticle(
        row.id,
        newsPinPayload({ isPinned: !row.isPinned })
      )
      feedback.success(row.isPinned ? '已取消置顶' : '资讯已置顶')
      await loadData()
      return true
    } catch (error) {
      handleAdminError(error, '置顶状态更新失败')
      return false
    }
  }

  function openCategoryChange(row) {
    selectedArticle.value = row
    Object.assign(
      articleActionForm,
      articleCategoryActionForm(row, defaultCategoryId())
    )
    categoryChangeVisible.value = true
  }

  async function saveArticleCategory() {
    if (!selectedArticle.value?.id) return false
    if (!articleActionForm.categoryId) {
      feedback.error('请选择分类')
      return false
    }
    actionSaving.value = true
    try {
      await api.changeArticleCategory(
        selectedArticle.value.id,
        newsArticleCategoryPayload(articleActionForm)
      )
      feedback.success('资讯分类已更新')
      categoryChangeVisible.value = false
      await loadData()
      return true
    } catch (error) {
      handleAdminError(error, '资讯分类更新失败')
      return false
    } finally {
      actionSaving.value = false
    }
  }

  function openSort(row) {
    selectedArticle.value = row
    Object.assign(articleActionForm, articleSortActionForm(row))
    sortVisible.value = true
  }

  async function saveSortOrder() {
    if (!selectedArticle.value?.id) return false
    actionSaving.value = true
    try {
      await api.changeArticleSortOrder(
        selectedArticle.value.id,
        newsSortOrderPayload(articleActionForm)
      )
      feedback.success('资讯排序已更新')
      sortVisible.value = false
      await loadData()
      return true
    } catch (error) {
      handleAdminError(error, '资讯排序更新失败')
      return false
    } finally {
      actionSaving.value = false
    }
  }

  function openSchedule(row) {
    selectedArticle.value = row
    Object.assign(articleActionForm, articleScheduleActionForm(row))
    scheduleVisible.value = true
  }

  async function saveSchedule() {
    if (!selectedArticle.value?.id) return false
    if (!articleActionForm.publishAt) {
      feedback.error('请选择发布时间')
      return false
    }
    actionSaving.value = true
    try {
      await api.scheduleArticle(
        selectedArticle.value.id,
        newsSchedulePayload(articleActionForm)
      )
      feedback.success('定时发布时间已保存')
      scheduleVisible.value = false
      await loadData()
      return true
    } catch (error) {
      handleAdminError(error, '定时发布保存失败')
      return false
    } finally {
      actionSaving.value = false
    }
  }

  async function removeNews(row) {
    try {
      await dialogs.confirm(
        `确认删除资讯 ${row.title}？`,
        '删除资讯',
        { type: 'warning' }
      )
      await api.deleteArticle(row.id)
      feedback.success('资讯已删除')
      await loadData()
      return true
    } catch (error) {
      if (!isDialogCancellation(error)) handleAdminError(error, '资讯删除失败')
      return false
    }
  }

  return {
    actionSaving,
    articleActionForm,
    categoryChangeVisible,
    offlineNews,
    openCategoryChange,
    openSchedule,
    openSort,
    publishNews,
    removeNews,
    saveArticleCategory,
    saveSchedule,
    saveSortOrder,
    scheduleVisible,
    selectedArticle,
    sortVisible,
    togglePin
  }
}
