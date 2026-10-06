import { adminApiContracts } from '../adminContracts.js'
import { cleanObject, fillAdminPath, numericId } from '../apiUtils.js'

function userCreatePayload(data = {}) {
  return cleanObject({
    phone: data.phone,
    realName: data.realName,
    roleCode: data.roleCode,
    schoolId: numericId(data.schoolId),
    nickname: data.nickname,
    gender: data.gender
  })
}

function userUpdatePayload(data = {}) {
  return cleanObject({
    realName: data.realName,
    nickname: data.nickname,
    gender: data.gender,
    avatarFileId: numericId(data.avatarFileId),
    phone: data.phone
  })
}

function openUserQuery(params = {}) {
  return cleanObject({
    phone: params.phone,
    realName: params.realName,
    roleCode: params.roleCode,
    schoolId: numericId(params.schoolId),
    status: params.status,
    classId: numericId(params.classId),
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20
  })
}

export function createOpenUserApiClient({ request }) {
  return {
    listOpenUsers(params) {
      return request(adminApiContracts.openUsers.list.path, { query: openUserQuery(params) })
    },
    createOpenUser(data) {
      return request(adminApiContracts.openUsers.create.path, { method: 'POST', body: userCreatePayload(data) })
    },
    getOpenUser(id) {
      return request(fillAdminPath(adminApiContracts.openUsers.detail.path, { id }))
    },
    updateOpenUser(id, data) {
      return request(fillAdminPath(adminApiContracts.openUsers.update.path, { id }), {
        method: 'PATCH',
        body: userUpdatePayload(data)
      })
    },
    updateOpenUserClasses(id, classIds) {
      return request(fillAdminPath(adminApiContracts.openUsers.updateClasses.path, { id }), {
        method: 'PATCH',
        body: { classIds: (classIds || []).map(numericId) }
      })
    },
    bindOpenUserStudents(id, studentIds, relationType) {
      return request(fillAdminPath(adminApiContracts.openUsers.bindStudents.path, { id }), {
        method: 'POST',
        body: cleanObject({
          studentIds: [...new Set((studentIds || []).map(numericId))],
          relationType
        })
      })
    },
    enableOpenUser(id) {
      return request(fillAdminPath(adminApiContracts.openUsers.enable.path, { id }), { method: 'PATCH' })
    },
    disableOpenUser(id) {
      return request(fillAdminPath(adminApiContracts.openUsers.disable.path, { id }), { method: 'PATCH' })
    }
  }
}
