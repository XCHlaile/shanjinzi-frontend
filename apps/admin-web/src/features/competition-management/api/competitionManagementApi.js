import { adminApiClient } from '../../../api/adminApi.js'
import {
  createExportTask,
  downloadExportTask,
  waitForExportTask
} from '../../../api/exportTasks.js'

export function createCompetitionManagementApi({
  managementApi = adminApiClient,
  createExport = createExportTask,
  waitForExport = waitForExportTask,
  downloadExport = downloadExportTask
} = {}) {
  return {
    fetchCompetitions(params) {
      return managementApi.listCompetitions(params)
    },
    fetchCompetition(competitionId) {
      return managementApi.getCompetition(competitionId)
    },
    createCompetition(payload) {
      return managementApi.createCompetition(payload)
    },
    updateCompetition(competitionId, payload) {
      return managementApi.updateCompetition(competitionId, payload)
    },
    publishCompetition(competitionId) {
      return managementApi.publishCompetition(competitionId)
    },
    offlineCompetition(competitionId) {
      return managementApi.offlineCompetition(competitionId)
    },
    updateCompetitionInfoUrl(competitionId, payload) {
      return managementApi.updateCompetitionInfoUrl(competitionId, payload)
    },
    deleteCompetition(competitionId) {
      return managementApi.deleteCompetition(competitionId)
    },
    fetchSchools(params) {
      return managementApi.listSchools(params)
    },
    fetchCompetitionRegistrations(competitionId, params) {
      return managementApi.listCompetitionRegistrations(competitionId, params)
    },
    fetchParentRegistrations(parentId) {
      return managementApi.listParentCompetitionRegistrations(parentId)
    },
    async exportCompetitions(filter) {
      const createdTask = await createExport('COMPETITIONS', filter)
      const completedTask = createdTask?.status === 'COMPLETED'
        ? createdTask
        : await waitForExport(createdTask?.id)
      return downloadExport(completedTask.id)
    }
  }
}

export const competitionManagementApi = createCompetitionManagementApi()
