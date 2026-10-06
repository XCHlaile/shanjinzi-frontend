import { ref } from 'vue'

import { competitionApi } from '../api/competitionApi.js'
import {
  competitionPageItems,
  normalizeMyCompetitionRegistration
} from '../lib/competitionViewModel.js'

export function useMyRegistrations({ api = competitionApi } = {}) {
  const loading = ref(true)
  const error = ref('')
  const myList = ref([])

  async function loadRegistrations() {
    loading.value = true
    error.value = ''
    try {
      const payload = await api.fetchRegistrations({ page: 1, pageSize: 100 })
      myList.value = competitionPageItems(payload)
        .map(normalizeMyCompetitionRegistration)
    } catch (loadError) {
      myList.value = []
      error.value = loadError.message || '报名记录加载失败'
    } finally {
      loading.value = false
    }
  }

  return {
    error,
    loading,
    loadRegistrations,
    myList
  }
}
