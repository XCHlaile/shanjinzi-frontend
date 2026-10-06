import { nextTick, ref } from 'vue'

import { competitionApi } from '../api/competitionApi.js'
import {
  competitionPageItems,
  normalizeCompetition,
  normalizeRegistrationStats
} from '../lib/competitionViewModel.js'

async function focusCompetitionElement(id) {
  await nextTick()
  document.getElementById(`competition-${id}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

export function useCompetitionDirectory({
  role,
  getRequestedCompetitionId = () => null,
  api = competitionApi,
  focusTarget = focusCompetitionElement
}) {
  const competitions = ref([])
  const loading = ref(false)
  const loadError = ref('')

  async function loadRegistrationStats(items) {
    return Promise.all(items.map(async item => {
      try {
        const stats = normalizeRegistrationStats(
          await api.fetchPublicCompetitionRegistrationCount(item.id)
        )
        return {
          ...item,
          registered: stats.total,
          registrationStats: stats,
          countError: ''
        }
      } catch (error) {
        return {
          ...item,
          countError: `人数统计加载失败：${error.message || '请求失败'}`
        }
      }
    }))
  }

  function isSourceTarget(id) {
    const competitionId = getRequestedCompetitionId()
    return Boolean(
      competitionId
      && String(competitionId) === String(id)
    )
  }

  async function focusRequestedCompetition() {
    const competitionId = getRequestedCompetitionId()
    if (!competitionId) return

    let target = competitions.value.find(
      item => String(item.id) === String(competitionId)
    )
    if (!target) {
      try {
        const detail = role === 'parent'
          ? await api.fetchCompetitionDetail(competitionId)
          : await api.fetchPublicCompetitionDetail(competitionId)
        target = normalizeCompetition(detail)
        competitions.value.unshift(target)
      } catch {
        return
      }
    }
    await focusTarget(target.id)
  }

  async function loadCompetitions() {
    loading.value = true
    loadError.value = ''
    try {
      const payload = role === 'parent'
        ? await api.fetchCompetitions({ page: 1, pageSize: 100 })
        : await api.fetchPublicCompetitions({ page: 1, pageSize: 100 })
      const items = competitionPageItems(payload).map(normalizeCompetition)
      competitions.value = role === 'parent'
        ? items
        : await loadRegistrationStats(items)
      await focusRequestedCompetition()
    } catch (error) {
      competitions.value = []
      loadError.value = error.message || '赛事加载失败'
    } finally {
      loading.value = false
    }
  }

  return {
    competitions,
    focusRequestedCompetition,
    isSourceTarget,
    loadCompetitions,
    loadError,
    loading
  }
}
