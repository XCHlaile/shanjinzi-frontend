import { adminApiContracts } from './adminContracts.js'
import { cleanObject, fillAdminPath, pageQuery } from './apiUtils.js'

export function createAdminManagementApiClient({ request }) {
  return {
    getDashboardStats() {
      return request(adminApiContracts.dashboard.stats.path)
    },
    getDashboardTrends(params) {
      return request(adminApiContracts.dashboard.trends.path, { query: cleanObject(params) })
    },
    getDashboardRankings(params) {
      return request(adminApiContracts.dashboard.rankings.path, { query: cleanObject(params) })
    },
    getDashboardOperations(params) {
      return request(adminApiContracts.dashboard.operations.path, { query: cleanObject(params) })
    },

    listUsers(params) {
      return request(adminApiContracts.users.list.path, { query: pageQuery(params) })
    },
    getUser(id) {
      return request(fillAdminPath(adminApiContracts.users.detail.path, { id }))
    },
    createUser(data) {
      return request(adminApiContracts.users.create.path, { method: 'POST', body: data })
    },
    updateUser(id, data) {
      return request(fillAdminPath(adminApiContracts.users.update.path, { id }), { method: 'PATCH', body: data })
    },
    updateUserRole(id, data) {
      return request(fillAdminPath(adminApiContracts.users.updateRole.path, { id }), { method: 'PATCH', body: data })
    },
    updateUserSchool(id, data) {
      return request(fillAdminPath(adminApiContracts.users.updateSchool.path, { id }), { method: 'PATCH', body: data })
    },
    enableUser(id) {
      return request(fillAdminPath(adminApiContracts.users.enable.path, { id }), { method: 'PATCH' })
    },
    disableUser(id) {
      return request(fillAdminPath(adminApiContracts.users.disable.path, { id }), { method: 'PATCH' })
    },
    resetUserPassword(id) {
      return request(fillAdminPath(adminApiContracts.users.resetPassword.path, { id }), { method: 'POST' })
    },
    deleteUser(id) {
      return request(fillAdminPath(adminApiContracts.users.softDelete.path, { id }), { method: 'DELETE' })
    },

    listSchools(params) {
      return request(adminApiContracts.schools.list.path, { query: pageQuery(params) })
    },
    getSchool(id) {
      return request(fillAdminPath(adminApiContracts.schools.detail.path, { id }))
    },
    listPublicSchools(params) {
      return request(adminApiContracts.publicSchools.list.path, { query: pageQuery(params) })
    },
    getPublicSchool(id) {
      return request(fillAdminPath(adminApiContracts.publicSchools.detail.path, { id }))
    },
    createSchool(data) {
      return request(adminApiContracts.schools.create.path, { method: 'POST', body: data })
    },
    updateSchool(id, data) {
      return request(fillAdminPath(adminApiContracts.schools.update.path, { id }), { method: 'PATCH', body: data })
    },
    enableSchool(id) {
      return request(fillAdminPath(adminApiContracts.schools.enable.path, { id }), { method: 'PATCH' })
    },
    disableSchool(id) {
      return request(fillAdminPath(adminApiContracts.schools.disable.path, { id }), { method: 'PATCH' })
    },

    listPages(params) {
      return request(adminApiContracts.pages.list.path, { query: pageQuery(params) })
    },
    createPage(data) {
      return request(adminApiContracts.pages.create.path, { method: 'POST', body: data })
    },
    getPage(pageKey) {
      return request(fillAdminPath(adminApiContracts.pages.detail.path, { pageKey }))
    },
    updatePage(pageKey, data) {
      return request(fillAdminPath(adminApiContracts.pages.update.path, { pageKey }), { method: 'PUT', body: data })
    },
    publishPage(pageKey) {
      return request(fillAdminPath(adminApiContracts.pages.publish.path, { pageKey }), { method: 'PATCH' })
    },
    offlinePage(pageKey) {
      return request(fillAdminPath(adminApiContracts.pages.offline.path, { pageKey }), { method: 'PATCH' })
    },

    listNews(params) {
      return request(adminApiContracts.news.list.path, { query: pageQuery(params) })
    },
    getNews(id) {
      return request(fillAdminPath(adminApiContracts.news.detail.path, { id }))
    },
    createNews(data) {
      return request(adminApiContracts.news.create.path, { method: 'POST', body: data })
    },
    updateNews(id, data) {
      return request(fillAdminPath(adminApiContracts.news.update.path, { id }), { method: 'PUT', body: data })
    },
    deleteNews(id) {
      return request(fillAdminPath(adminApiContracts.news.delete.path, { id }), { method: 'DELETE' })
    },
    publishNews(id) {
      return request(fillAdminPath(adminApiContracts.news.publish.path, { id }), { method: 'PATCH' })
    },
    offlineNews(id) {
      return request(fillAdminPath(adminApiContracts.news.offline.path, { id }), { method: 'PATCH' })
    },
    pinNews(id, data) {
      return request(fillAdminPath(adminApiContracts.news.pin.path, { id }), { method: 'PATCH', body: data })
    },
    updateNewsCategory(id, data) {
      return request(fillAdminPath(adminApiContracts.news.articleCategory.path, { id }), { method: 'PATCH', body: data })
    },
    updateNewsSortOrder(id, data) {
      return request(fillAdminPath(adminApiContracts.news.sortOrder.path, { id }), { method: 'PATCH', body: data })
    },
    scheduleNews(id, data) {
      return request(fillAdminPath(adminApiContracts.news.schedule.path, { id }), { method: 'PUT', body: data })
    },
    listNewsCategories(params) {
      return request(adminApiContracts.news.categories.path, { query: pageQuery(params) })
    },
    getNewsCategory(id) {
      return request(fillAdminPath(adminApiContracts.news.categoryDetail.path, { id }))
    },
    createNewsCategory(data) {
      return request(adminApiContracts.news.createCategory.path, { method: 'POST', body: data })
    },
    updateNewsCategoryRecord(id, data) {
      return request(fillAdminPath(adminApiContracts.news.updateCategory.path, { id }), { method: 'PUT', body: data })
    },
    deleteNewsCategory(id) {
      return request(fillAdminPath(adminApiContracts.news.deleteCategory.path, { id }), { method: 'DELETE' })
    },

    listCompetitions(params) {
      return request(adminApiContracts.competitions.list.path, { query: pageQuery(params) })
    },
    getCompetition(id) {
      return request(fillAdminPath(adminApiContracts.competitions.detail.path, { id }))
    },
    createCompetition(data) {
      return request(adminApiContracts.competitions.create.path, { method: 'POST', body: data })
    },
    updateCompetition(id, data) {
      return request(fillAdminPath(adminApiContracts.competitions.update.path, { id }), { method: 'PUT', body: data })
    },
    deleteCompetition(id) {
      return request(fillAdminPath(adminApiContracts.competitions.delete.path, { id }), { method: 'DELETE' })
    },
    publishCompetition(id) {
      return request(fillAdminPath(adminApiContracts.competitions.publish.path, { id }), { method: 'PATCH' })
    },
    offlineCompetition(id) {
      return request(fillAdminPath(adminApiContracts.competitions.offline.path, { id }), { method: 'PATCH' })
    },
    updateCompetitionInfoUrl(id, data) {
      return request(fillAdminPath(adminApiContracts.competitions.infoUrl.path, { id }), { method: 'PATCH', body: data })
    },

    listAuditLogs(params) {
      return request(adminApiContracts.auditLogs.list.path, { query: pageQuery(params) })
    },
    getAuditLog(id) {
      return request(fillAdminPath(adminApiContracts.auditLogs.detail.path, { id }))
    },
    listExportTasks(params) {
      return request(adminApiContracts.exports.list.path, { query: pageQuery(params) })
    },
    createExportTask(data) {
      return request(adminApiContracts.exports.create.path, { method: 'POST', body: data })
    },
    getExportTask(id) {
      return request(fillAdminPath(adminApiContracts.exports.detail.path, { id }))
    },

    listMessageBroadcasts(params) {
      return request(adminApiContracts.messageBroadcasts.list.path, { query: pageQuery(params) })
    },
    createMessageBroadcast(data) {
      return request(adminApiContracts.messageBroadcasts.create.path, { method: 'POST', body: data })
    },
    getMessageBroadcast(broadcastId) {
      return request(fillAdminPath(adminApiContracts.messageBroadcasts.detail.path, { broadcastId }))
    },
    retryMessageBroadcast(broadcastId) {
      return request(fillAdminPath(adminApiContracts.messageBroadcasts.retry.path, { broadcastId }), { method: 'POST' })
    }
  }
}
