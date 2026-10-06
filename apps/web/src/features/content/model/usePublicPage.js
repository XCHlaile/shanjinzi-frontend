import { ref } from 'vue'

import { contentApi } from '../api/contentApi.js'

export function usePublicPage(pageKey, { api = contentApi } = {}) {
  const publicPage = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function loadPublicPage() {
    loading.value = true
    error.value = ''
    try {
      publicPage.value = await api.fetchPublicPage(pageKey)
      return publicPage.value
    } catch (cause) {
      publicPage.value = null
      error.value = cause.message || '页面内容加载失败'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    error,
    loading,
    loadPublicPage,
    publicPage
  }
}
