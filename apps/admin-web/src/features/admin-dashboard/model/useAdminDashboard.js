import { computed, ref } from 'vue'

import { adminDashboardApi } from '../api/adminDashboardApi.js'
import {
  dashboardList,
  dashboardMetrics,
  dashboardPageTotal
} from '../lib/adminDashboardViewModel.js'

function errorText(error) {
  return error?.message || '请求失败'
}

export function useAdminDashboard({ api = adminDashboardApi } = {}) {
  const stats = ref(null)
  const schoolAdminCount = ref(null)
  const trends = ref([])
  const rankings = ref([])
  const operations = ref([])
  const loading = ref(false)
  const loadError = ref('')

  const metrics = computed(() => dashboardMetrics(stats.value, schoolAdminCount.value))

  async function loadSection(label, loader) {
    try {
      return await loader()
    } catch (error) {
      return { __error: `${label}: ${errorText(error)}` }
    }
  }

  async function loadDashboard() {
    loading.value = true
    loadError.value = ''
    try {
      const [
        statsData,
        schoolAdminsData,
        trendsData,
        rankingsData,
        operationsData
      ] = await Promise.all([
        loadSection('统计数据', () => api.fetchStats()),
        loadSection('校方管理员统计', () => api.fetchUsers({
          roleCode: 'SCHOOL_ADMIN',
          page: 1,
          pageSize: 1
        })),
        loadSection('趋势数据', () => api.fetchTrends({ days: 7 })),
        loadSection('学校排行', () => api.fetchRankings()),
        loadSection('关键操作', () => api.fetchOperations())
      ])

      const errors = [
        statsData,
        schoolAdminsData,
        trendsData,
        rankingsData,
        operationsData
      ]
        .filter(item => item?.__error)
        .map(item => item.__error)
      if (errors.length) {
        loadError.value = `后端接口还没写或返回失败：${errors.join('；')}`
      }

      if (!statsData?.__error) stats.value = statsData || null
      if (!schoolAdminsData?.__error) {
        schoolAdminCount.value = dashboardPageTotal(schoolAdminsData)
      }
      if (!trendsData?.__error) trends.value = dashboardList(trendsData, ['trends'])
      if (!rankingsData?.__error) rankings.value = dashboardList(rankingsData, ['rankings'])
      if (!operationsData?.__error) {
        operations.value = dashboardList(operationsData, ['operations'])
      }

      return errors.length === 0
    } finally {
      loading.value = false
    }
  }

  return {
    loadDashboard,
    loadError,
    loading,
    metrics,
    operations,
    rankings,
    schoolAdminCount,
    stats,
    trends
  }
}
