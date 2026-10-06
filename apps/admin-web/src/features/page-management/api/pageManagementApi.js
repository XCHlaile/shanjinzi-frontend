import { adminApiClient } from '../../../api/adminApi.js'
import { createExportTask } from '../../../api/exportTasks.js'

export function createPageManagementApi({
  managementApi = adminApiClient,
  createExport = createExportTask
} = {}) {
  return {
    fetchPages(params) {
      return managementApi.listPages(params)
    },
    createPage(payload) {
      return managementApi.createPage(payload)
    },
    updatePage(pageKey, payload) {
      return managementApi.updatePage(pageKey, payload)
    },
    publishPage(pageKey) {
      return managementApi.publishPage(pageKey)
    },
    offlinePage(pageKey) {
      return managementApi.offlinePage(pageKey)
    },
    exportPages(filter) {
      return createExport('PAGES', filter)
    }
  }
}

export const pageManagementApi = createPageManagementApi()
