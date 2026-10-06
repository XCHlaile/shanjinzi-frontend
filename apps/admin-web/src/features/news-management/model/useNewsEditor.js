import { reactive, ref } from 'vue'

import {
  newsArticleMatchesPayload,
  newsArticlePayload,
  normalizeNewsArticle
} from '../../../api/payloads/newsPayloads.js'
import {
  articleForm,
  emptyArticleForm,
  normalizeArticlePage,
  upsertArticleRows
} from '../lib/newsManagementViewModel.js'

export function useNewsEditor({
  api,
  categories,
  defaultCategoryId,
  feedback,
  handleAdminError,
  loadCategories,
  refreshNewsListAfterSave,
  rows
}) {
  const saving = ref(false)
  const dialogVisible = ref(false)
  const editingId = ref(null)
  const form = reactive(emptyArticleForm())

  function resetArticleForm() {
    Object.assign(form, emptyArticleForm(defaultCategoryId()))
  }

  async function recoverSavedNews(payload, articleId) {
    try {
      if (articleId) {
        const article = await api.fetchArticle(articleId)
        return newsArticleMatchesPayload(article, payload)
          ? normalizeNewsArticle(article)
          : null
      }

      const candidates = normalizeArticlePage(await api.fetchArticles({
        page: 1,
        pageSize: 100,
        keyword: payload.title,
        categoryId: payload.categoryId
      }))
      for (const candidate of candidates) {
        if (!candidate?.id || String(candidate.title || '') !== String(payload.title || '')) {
          continue
        }
        try {
          const article = await api.fetchArticle(candidate.id)
          if (newsArticleMatchesPayload(article, payload)) {
            return normalizeNewsArticle(article)
          }
        } catch {
          // Recovery keeps checking matching records before surfacing the save error.
        }
      }
      return null
    } catch {
      return null
    }
  }

  async function openCreate() {
    if (!categories.value.length) {
      try {
        await loadCategories()
      } catch (error) {
        handleAdminError(error, '分类加载失败')
        return false
      }
    }
    editingId.value = null
    resetArticleForm()
    dialogVisible.value = true
    return true
  }

  async function openEdit(row) {
    editingId.value = row.id
    try {
      const detail = await api.fetchArticle(row.id)
      const article = normalizeNewsArticle({ ...row, ...detail })
      Object.assign(form, articleForm(article, defaultCategoryId()))
      dialogVisible.value = true
      return true
    } catch (error) {
      handleAdminError(error, '资讯详情加载失败')
      return false
    }
  }

  async function saveNews() {
    if (!form.categoryId) {
      feedback.error('请选择分类')
      return false
    }
    if (!String(form.title || '').trim()) {
      feedback.error('请填写标题')
      return false
    }
    if (!String(form.contentMarkdown || '').trim()) {
      feedback.error('请填写 Markdown 正文')
      return false
    }

    const payload = newsArticlePayload(form)
    saving.value = true
    try {
      const savedArticle = editingId.value
        ? await api.updateArticle(editingId.value, payload)
        : await api.createArticle(payload)
      rows.value = upsertArticleRows(rows.value, savedArticle)
      feedback.success('资讯已保存')
      dialogVisible.value = false
      refreshNewsListAfterSave()
      return true
    } catch (error) {
      const savedArticle = await recoverSavedNews(payload, editingId.value)
      if (savedArticle) {
        rows.value = upsertArticleRows(rows.value, savedArticle)
        feedback.success('资讯已保存')
        dialogVisible.value = false
        refreshNewsListAfterSave()
        return true
      }
      handleAdminError(error, '资讯保存失败')
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    dialogVisible,
    editingId,
    form,
    openCreate,
    openEdit,
    recoverSavedNews,
    resetArticleForm,
    saveNews,
    saving
  }
}
