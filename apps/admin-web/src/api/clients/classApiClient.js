import { adminApiContracts } from '../adminContracts.js'
import { cleanObject, fillAdminPath, numericId } from '../apiUtils.js'
import { classCreatePayload, classTeachersPayload, classUpdatePayload } from '../payloads/classPayloads.js'

function classQuery(params = {}) {
  return cleanObject({
    schoolId: numericId(params.schoolId),
    name: params.name,
    gradeName: params.gradeName,
    status: params.status,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20
  })
}

export function createClassApiClient({ request }) {
  return {
    listClasses(params) {
      return request(adminApiContracts.classes.list.path, { query: classQuery(params) })
    },
    getClass(id) {
      return request(fillAdminPath(adminApiContracts.classes.detail.path, { id }))
    },
    createClass(data) {
      return request(adminApiContracts.classes.create.path, { method: 'POST', body: classCreatePayload(data) })
    },
    updateClass(id, data) {
      return request(fillAdminPath(adminApiContracts.classes.update.path, { id }), {
        method: 'PATCH',
        body: classUpdatePayload(data)
      })
    },
    deleteClass(id) {
      return request(fillAdminPath(adminApiContracts.classes.delete.path, { id }), { method: 'DELETE' })
    },
    enableClass(id) {
      return request(fillAdminPath(adminApiContracts.classes.enable.path, { id }), { method: 'PATCH' })
    },
    disableClass(id) {
      return request(fillAdminPath(adminApiContracts.classes.disable.path, { id }), { method: 'PATCH' })
    },
    assignClassTeachers(id, teacherIds) {
      return request(fillAdminPath(adminApiContracts.classes.assignTeachers.path, { id }), {
        method: 'POST',
        body: classTeachersPayload(teacherIds)
      })
    }
  }
}
