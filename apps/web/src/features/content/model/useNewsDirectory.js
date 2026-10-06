import { computed, ref } from 'vue'
import { createLatestRequestGuard } from '../../../../../../config/asyncRuntime.mjs'

import { contentApi } from '../api/contentApi.js'
import {
  normalizePublicNewsArticle,
  normalizePublicNewsCategory,
  publicNewsContentText,
  publicNewsItems
} from '../lib/newsViewModel.js'

export function useNewsDirectory({ api = contentApi, pageSize = 20 } = {}) {
  const newsCategories = ref([])
  const activeCategoryId = ref(null)
  const categoryError = ref('')
  const newsItems = ref([])
  const loading = ref(false)
  const loadError = ref('')
  const loadFailure = ref(null)
  const page = ref(1)
  const total = ref(0)
  const totalPages = ref(0)
  const expandedId = ref(null)
  const detailsById = ref({})
  const detailLoadingId = ref(null)
  const detailErrors = ref({})
  const newsLoadGuard = createLatestRequestGuard()

  const categoryOptions = computed(() => [
    { id: null, name: '全部' },
    ...newsCategories.value
  ])

  async function loadCategories() {
    categoryError.value = ''
    try {
      const payload = await api.fetchPublicNewsCategories()
      const list = Array.isArray(payload) ? payload : publicNewsItems(payload)
      newsCategories.value = list
        .map(normalizePublicNewsCategory)
        .sort((left, right) => left.sortOrder - right.sortOrder)
    } catch (error) {
      newsCategories.value = []
      categoryError.value = `新闻分类加载失败：${error.message || '请求失败'}`
    }
  }

  async function loadNews() {
    const request = newsLoadGuard.begin()
    request.commit(() => {
      loading.value = true
      loadError.value = ''
      loadFailure.value = null
      expandedId.value = null
    })
    try {
      const payload = await api.fetchPublicNews({
        page: page.value,
        pageSize,
        ...(activeCategoryId.value != null
          ? { categoryId: activeCategoryId.value }
          : {})
      })
      const nextItems = publicNewsItems(payload).map(normalizePublicNewsArticle)
      request.commit(() => {
        newsItems.value = nextItems
        total.value = Number(payload?.total ?? nextItems.length)
        totalPages.value = Number(payload?.totalPages ?? (nextItems.length ? 1 : 0))
      })
    } catch (error) {
      request.commit(() => {
        newsItems.value = []
        total.value = 0
        totalPages.value = 0
        loadError.value = error.message || '新闻资讯加载失败'
        loadFailure.value = error
      })
    } finally {
      request.commit(() => { loading.value = false })
    }
  }

  async function selectCategory(categoryId) {
    if (activeCategoryId.value === categoryId && page.value === 1) return
    activeCategoryId.value = categoryId
    page.value = 1
    await loadNews()
  }

  async function changePage(nextPage) {
    page.value = nextPage
    await loadNews()
  }

  async function toggleArticle(item) {
    if (expandedId.value === item.id) {
      expandedId.value = null
      return
    }
    expandedId.value = item.id
    if (detailsById.value[item.id]) return

    detailLoadingId.value = item.id
    detailErrors.value = { ...detailErrors.value, [item.id]: '' }
    try {
      const detail = await api.fetchPublicNewsDetail(item.id)
      detailsById.value = {
        ...detailsById.value,
        [item.id]: {
          ...detail,
          contentText: publicNewsContentText(detail?.contentHtml || detail?.summary)
        }
      }
    } catch (error) {
      detailErrors.value = {
        ...detailErrors.value,
        [item.id]: error.message || '新闻正文加载失败'
      }
    } finally {
      if (detailLoadingId.value === item.id) detailLoadingId.value = null
    }
  }

  async function initialize() {
    await Promise.all([loadCategories(), loadNews()])
  }

  return {
    activeCategoryId,
    categoryError,
    categoryOptions,
    changePage,
    detailErrors,
    detailLoadingId,
    detailsById,
    expandedId,
    initialize,
    loadError,
    loadFailure,
    loadNews,
    loading,
    newsItems,
    page,
    selectCategory,
    toggleArticle,
    total,
    totalPages
  }
}
