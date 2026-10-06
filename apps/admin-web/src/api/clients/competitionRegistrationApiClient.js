import { adminApiContracts } from '../adminContracts.js'
import { cleanObject, fillAdminPath, numericId } from '../apiUtils.js'

function adminCompetitionRegistrationQuery(params = {}) {
  return cleanObject({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    status: params.status,
    keyword: params.keyword
  })
}

function openCompetitionRegistrationQuery(params = {}) {
  return cleanObject({
    classId: numericId(params.classId),
    startTime: params.startTime,
    endTime: params.endTime
  })
}

export function createCompetitionRegistrationApiClient({ request }) {
  return {
    listCompetitionRegistrations(id, params = {}) {
      return request(fillAdminPath(adminApiContracts.competitions.registrations.path, { id }), {
        query: adminCompetitionRegistrationQuery(params)
      })
    },
    listOpenCompetitionRegistrations(id, params = {}) {
      const path = fillAdminPath(adminApiContracts.openCompetitions.registrations.path, { id })
      const query = openCompetitionRegistrationQuery(params)
      return Object.keys(query).length ? request(path, { query }) : request(path)
    },
    listParentCompetitionRegistrations(parentId) {
      return request(adminApiContracts.openCompetitions.parentRegistrations.path, {
        query: { parentId: numericId(parentId) }
      })
    },
    setOpenCompetitionLeadTeacher(id, teacherId) {
      return request(fillAdminPath(adminApiContracts.openCompetitions.leadTeacher.path, { id }), {
        method: 'PATCH',
        body: { key: numericId(teacherId) }
      })
    }
  }
}
