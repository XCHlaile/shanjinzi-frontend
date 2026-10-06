import { adminApiClient } from '../../../api/adminApi.js'

export function createContentReportManagementApi({
  managementApi = adminApiClient
} = {}) {
  return {
    fetchSchools(params) {
      return managementApi.listSchools(params)
    },
    fetchSchool(schoolId) {
      return managementApi.getSchool(schoolId)
    },
    fetchReports(params) {
      return managementApi.listContentReports(params)
    },
    fetchReport(reportId) {
      return managementApi.getContentReport(reportId)
    },
    handleReport(reportId, payload) {
      return managementApi.handleContentReport(reportId, payload)
    }
  }
}

export const contentReportManagementApi = createContentReportManagementApi()
