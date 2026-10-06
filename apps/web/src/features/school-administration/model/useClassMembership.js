import { ref } from 'vue'

import { schoolAdministrationApi } from '../api/schoolAdministrationApi.js'
import { useClassStudentMembership } from './useClassStudentMembership.js'
import { useClassTeacherMembership } from './useClassTeacherMembership.js'

const noop = () => {}

export function useClassMembership({
  schoolId,
  api = schoolAdministrationApi,
  confirm = async () => {},
  notify = { success: noop }
}) {
  const activeClass = ref(null)
  const teacherMembership = useClassTeacherMembership({
    activeClass,
    api,
    notify,
    schoolId
  })
  const studentMembership = useClassStudentMembership({
    activeClass,
    api,
    confirm,
    notify,
    schoolId
  })

  return {
    activeClass,
    ...teacherMembership,
    ...studentMembership
  }
}
