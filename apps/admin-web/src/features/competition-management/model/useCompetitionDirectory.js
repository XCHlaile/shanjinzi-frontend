import { computed, ref } from 'vue'

import {
  competitionExportFilter,
  competitionListParams,
  matchesCompetition,
  normalizeCompetitionPage
} from '../lib/competitionManagementViewModel.js'

export function useCompetitionDirectory({
  api,
  feedback,
  saveFile
}) {
  const keyword = ref('')
  const status = ref('')
  const rows = ref([])
  const selectedRow = ref(null)
  const loading = ref(false)
  const loadError = ref('')
  const exporting = ref(false)

  const filteredRows = computed(() => rows.value.filter(row => (
    matchesCompetition(row, {
      keyword: keyword.value,
      status: status.value
    })
  )))

  async function loadData() {
    loading.value = true
    loadError.value = ''
    try {
      rows.value = normalizeCompetitionPage(
        await api.fetchCompetitions(competitionListParams(keyword.value))
      )
      return true
    } catch (error) {
      rows.value = []
      loadError.value = error?.message || '赛事列表加载失败'
      feedback.error(loadError.value)
      return false
    } finally {
      loading.value = false
    }
  }

  async function exportCompetitions() {
    exporting.value = true
    try {
      saveFile(
        await api.exportCompetitions(competitionExportFilter({
          keyword: keyword.value,
          status: status.value
        })),
        '赛事列表.csv'
      )
      feedback.success('赛事数据已导出')
      return true
    } catch (error) {
      feedback.error(error?.message || '赛事导出失败')
      return false
    } finally {
      exporting.value = false
    }
  }

  return {
    exportCompetitions,
    exporting,
    filteredRows,
    keyword,
    loadData,
    loadError,
    loading,
    rows,
    selectedRow,
    status
  }
}
