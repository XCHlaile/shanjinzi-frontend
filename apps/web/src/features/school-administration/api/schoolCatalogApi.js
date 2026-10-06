import {
  cleanObject,
  fillPath,
  numericId,
  pageParams
} from '../../../shared/api/requestUtils.js'

function classListParams(params = {}) {
  return cleanObject({
    schoolId: params.schoolId === undefined ? undefined : numericId(params.schoolId),
    name: params.name,
    gradeName: params.gradeName,
    status: params.status,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20
  })
}

function classCreatePayload(data = {}) {
  return cleanObject({
    name: String(data.name || '').trim(),
    gradeName: String(data.gradeName || '').trim(),
    sortOrder: data.sortOrder === undefined ? undefined : numericId(data.sortOrder),
    schoolId: data.schoolId === undefined ? undefined : numericId(data.schoolId)
  })
}

function classUpdatePayload(data = {}) {
  return cleanObject({
    name: data.name === undefined ? undefined : String(data.name).trim(),
    gradeName: data.gradeName === undefined ? undefined : String(data.gradeName).trim(),
    sortOrder: data.sortOrder === undefined ? undefined : numericId(data.sortOrder)
  })
}

function teacherIdsPayload(teacherIds = []) {
  return {
    teacherIds: [...new Set(
      teacherIds
        .map(numericId)
        .filter(value => typeof value === 'number' && Number.isFinite(value))
    )]
  }
}

export function createSchoolCatalogApi(transport, contracts) {
  return {
    fetchPublicSchools(params) {
      return transport.get(contracts.publicSchools.list.path, { query: pageParams(params) })
    },
    fetchPublicSchoolDetail(id) {
      return transport.get(fillPath(contracts.publicSchools.detail.path, { id }))
    },
    fetchPublicClasses(params) {
      return transport.get(contracts.publicClasses.list.path, {
        query: classListParams(params)
      })
    },
    fetchPublicClassDetail(id) {
      return transport.get(fillPath(contracts.publicClasses.detail.path, { id }))
    },
    createPublicClass(data) {
      return transport.post(contracts.publicClasses.create.path, classCreatePayload(data))
    },
    updatePublicClass(id, data) {
      return transport.patch(
        fillPath(contracts.publicClasses.update.path, { id }),
        classUpdatePayload(data)
      )
    },
    deletePublicClass(id) {
      return transport.delete(fillPath(contracts.publicClasses.delete.path, { id }))
    },
    enablePublicClass(id) {
      return transport.patch(fillPath(contracts.publicClasses.enable.path, { id }))
    },
    disablePublicClass(id) {
      return transport.patch(fillPath(contracts.publicClasses.disable.path, { id }))
    },
    assignPublicClassTeachers(id, teacherIds) {
      return transport.post(
        fillPath(contracts.publicClasses.assignTeachers.path, { id }),
        teacherIdsPayload(teacherIds)
      )
    }
  }
}
