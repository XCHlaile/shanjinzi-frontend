import {
  cleanObject,
  fillPath,
  numericId
} from '../../../shared/api/requestUtils.js'

function userCreatePayload(data = {}) {
  return cleanObject({
    phone: data.phone,
    realName: data.realName,
    roleCode: data.roleCode,
    schoolId: data.schoolId === undefined ? undefined : numericId(data.schoolId),
    nickname: data.nickname,
    gender: data.gender
  })
}

function userUpdatePayload(data = {}) {
  return cleanObject({
    realName: data.realName,
    nickname: data.nickname,
    gender: data.gender,
    avatarFileId: data.avatarFileId === undefined
      ? undefined
      : numericId(data.avatarFileId),
    phone: data.phone
  })
}

function userListParams(params = {}) {
  return cleanObject({
    phone: params.phone,
    realName: params.realName,
    roleCode: params.roleCode,
    schoolId: params.schoolId === undefined ? undefined : numericId(params.schoolId),
    status: params.status,
    classId: params.classId === undefined ? undefined : numericId(params.classId),
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20
  })
}

export function createSchoolUserApi(transport, contracts) {
  return {
    listOpenUsers(params) {
      return transport.get(contracts.openUsers.list.path, {
        query: userListParams(params)
      })
    },
    createOpenUser(data) {
      return transport.post(contracts.openUsers.create.path, userCreatePayload(data))
    },
    getOpenUser(id) {
      return transport.get(fillPath(contracts.openUsers.detail.path, { id }))
    },
    updateOpenUser(id, data) {
      return transport.patch(
        fillPath(contracts.openUsers.update.path, { id }),
        userUpdatePayload(data)
      )
    },
    updateOpenUserClasses(id, classIds) {
      return transport.patch(
        fillPath(contracts.openUsers.updateClasses.path, { id }),
        { classIds: (classIds || []).map(numericId) }
      )
    },
    bindOpenUserStudents(id, studentIds, relationType) {
      return transport.post(
        fillPath(contracts.openUsers.bindStudents.path, { id }),
        cleanObject({
          studentIds: [...new Set((studentIds || []).map(numericId))],
          relationType
        })
      )
    },
    enableOpenUser(id) {
      return transport.patch(fillPath(contracts.openUsers.enable.path, { id }))
    },
    disableOpenUser(id) {
      return transport.patch(fillPath(contracts.openUsers.disable.path, { id }))
    }
  }
}
