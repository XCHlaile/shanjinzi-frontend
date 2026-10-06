import { adminApiContracts } from '../adminContracts.js'
import { cleanObject, fillAdminPath, numericId } from '../apiUtils.js'

function contentReportQuery(params = {}) {
  return cleanObject({
    schoolId: numericId(params.schoolId),
    status: params.status,
    targetType: params.targetType,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20
  })
}

function contentReportHandlePayload(data = {}) {
  return cleanObject({ action: data.action, note: data.note })
}

export function createContentReportApiClient({ request }) {
  return {
    listContentReports(params) {
      return request(adminApiContracts.contentReports.list.path, { query: contentReportQuery(params) })
    },
    getContentReport(reportId) {
      return request(fillAdminPath(adminApiContracts.contentReports.detail.path, { reportId }))
    },
    handleContentReport(reportId, data) {
      return request(fillAdminPath(adminApiContracts.contentReports.handle.path, { reportId }), {
        method: 'PATCH',
        body: contentReportHandlePayload(data)
      })
    }
  }
}
