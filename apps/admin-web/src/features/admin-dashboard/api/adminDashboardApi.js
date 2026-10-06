import { adminApiClient } from '../../../api/adminApi.js'

export function createAdminDashboardApi({ managementApi = adminApiClient } = {}) {
  return {
    fetchStats() {
      return managementApi.getDashboardStats()
    },
    fetchUsers(params) {
      return managementApi.listUsers(params)
    },
    fetchTrends(params) {
      return managementApi.getDashboardTrends(params)
    },
    fetchRankings(params) {
      return managementApi.getDashboardRankings(params)
    },
    fetchOperations(params) {
      return managementApi.getDashboardOperations(params)
    }
  }
}

export const adminDashboardApi = createAdminDashboardApi()
