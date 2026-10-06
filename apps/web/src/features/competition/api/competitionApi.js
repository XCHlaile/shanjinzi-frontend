import { validateApiContractMap } from '@shanjinzi/api-contracts'

import {
  cleanObject,
  fillPath,
  numericId,
  pageParams
} from '../../../shared/api/requestUtils.js'
import { httpClient } from '../../../shared/api/httpClient.js'

export const competitionContracts = validateApiContractMap({
  competitions: {
    list: { method: 'GET', path: '/api/app/competitions' },
    detail: { method: 'GET', path: '/api/app/competitions/{competitionId}' },
    register: { method: 'POST', path: '/api/app/competitions/{competitionId}/registrations' }
  },
  registrations: {
    list: { method: 'GET', path: '/api/app/registrations' },
    detail: { method: 'GET', path: '/api/app/registrations/{registrationId}' },
    cancel: { method: 'DELETE', path: '/api/app/registrations/{registrationId}' }
  },
  publicCompetitions: {
    list: { method: 'GET', path: '/api/public/competitions' },
    detail: { method: 'GET', path: '/api/public/competitions/{id}' },
    registrationCount: { method: 'GET', path: '/api/public/competitions/{id}/registration-count' }
  },
  competitionAdministration: {
    registrations: { method: 'GET', path: '/api/open/competitions/{id}/registrations' },
    parentRegistrations: { method: 'GET', path: '/api/open/competitions/registrations' },
    leadTeacher: { method: 'PATCH', path: '/api/open/competitions/{id}/lead-teacher' }
  }
}, 'competitionContracts')

function competitionRegistrationFilters(params = {}) {
  return cleanObject({
    classId: params.classId === undefined ? undefined : numericId(params.classId),
    startTime: params.startTime,
    endTime: params.endTime
  })
}

export function createCompetitionApi(transport = httpClient) {
  return Object.freeze({
    fetchCompetitions(params) {
      return transport.get(competitionContracts.competitions.list.path, {
        query: pageParams(params)
      })
    },
    fetchCompetitionDetail(id) {
      return transport.get(
        fillPath(competitionContracts.competitions.detail.path, { competitionId: id })
      )
    },
    registerCompetition(id, data) {
      return transport.post(
        fillPath(competitionContracts.competitions.register.path, { competitionId: id }),
        data
      )
    },
    fetchRegistrations(params) {
      return transport.get(competitionContracts.registrations.list.path, {
        query: pageParams(params)
      })
    },
    fetchRegistrationDetail(id) {
      return transport.get(
        fillPath(competitionContracts.registrations.detail.path, { registrationId: id })
      )
    },
    removeRegistration(id) {
      return transport.delete(
        fillPath(competitionContracts.registrations.cancel.path, { registrationId: id })
      )
    },
    fetchPublicCompetitions(params) {
      return transport.get(competitionContracts.publicCompetitions.list.path, {
        query: pageParams(params)
      })
    },
    fetchPublicCompetitionDetail(id) {
      return transport.get(
        fillPath(competitionContracts.publicCompetitions.detail.path, { id })
      )
    },
    fetchPublicCompetitionRegistrationCount(id) {
      return transport.get(
        fillPath(competitionContracts.publicCompetitions.registrationCount.path, { id })
      )
    },
    fetchCompetitionRegistrations(id, params) {
      const query = competitionRegistrationFilters(params)
      return transport.get(
        fillPath(competitionContracts.competitionAdministration.registrations.path, { id }),
        Object.keys(query).length ? { query } : undefined
      )
    },
    fetchParentCompetitionRegistrations(parentId) {
      return transport.get(
        competitionContracts.competitionAdministration.parentRegistrations.path,
        { query: { parentId: numericId(parentId) } }
      )
    },
    setCompetitionLeadTeacher(id, teacherId) {
      const value = typeof teacherId === 'object'
        ? teacherId.key ?? teacherId.teacherId ?? teacherId.leadTeacherId
        : teacherId
      return transport.patch(
        fillPath(competitionContracts.competitionAdministration.leadTeacher.path, { id }),
        { key: numericId(value) }
      )
    }
  })
}

export const competitionApi = createCompetitionApi()
