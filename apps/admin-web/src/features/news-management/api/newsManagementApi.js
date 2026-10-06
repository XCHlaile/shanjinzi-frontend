import { adminApiClient } from '../../../api/adminApi.js'
import {
  createExportTask,
  downloadExportTask,
  waitForExportTask
} from '../../../api/exportTasks.js'

export function createNewsManagementApi({
  managementApi = adminApiClient,
  createExport = createExportTask,
  waitForExport = waitForExportTask,
  downloadExport = downloadExportTask
} = {}) {
  return {
    fetchArticles(params) {
      return managementApi.listNews(params)
    },
    fetchArticle(articleId) {
      return managementApi.getNews(articleId)
    },
    createArticle(payload) {
      return managementApi.createNews(payload)
    },
    updateArticle(articleId, payload) {
      return managementApi.updateNews(articleId, payload)
    },
    publishArticle(articleId) {
      return managementApi.publishNews(articleId)
    },
    offlineArticle(articleId) {
      return managementApi.offlineNews(articleId)
    },
    pinArticle(articleId, payload) {
      return managementApi.pinNews(articleId, payload)
    },
    changeArticleCategory(articleId, payload) {
      return managementApi.updateNewsCategory(articleId, payload)
    },
    changeArticleSortOrder(articleId, payload) {
      return managementApi.updateNewsSortOrder(articleId, payload)
    },
    scheduleArticle(articleId, payload) {
      return managementApi.scheduleNews(articleId, payload)
    },
    deleteArticle(articleId) {
      return managementApi.deleteNews(articleId)
    },
    fetchCategories(params) {
      return managementApi.listNewsCategories(params)
    },
    fetchCategory(categoryId) {
      return managementApi.getNewsCategory(categoryId)
    },
    createCategory(payload) {
      return managementApi.createNewsCategory(payload)
    },
    updateCategory(categoryId, payload) {
      return managementApi.updateNewsCategoryRecord(categoryId, payload)
    },
    deleteCategory(categoryId) {
      return managementApi.deleteNewsCategory(categoryId)
    },
    async exportArticles(filter) {
      const createdTask = await createExport('NEWS', filter)
      const completedTask = createdTask?.status === 'COMPLETED'
        ? createdTask
        : await waitForExport(createdTask?.id)
      return downloadExport(completedTask.id)
    }
  }
}

export const newsManagementApi = createNewsManagementApi()
