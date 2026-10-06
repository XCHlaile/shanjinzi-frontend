import { ref } from 'vue'

import { handleAdminAuthorizationError } from '../../../shared/lib/adminAuthorization.js'
import { classManagementApi } from '../api/classManagementApi.js'
import { useClassDirectory } from './useClassDirectory.js'
import { useClassStudentAssignment } from './useClassStudentAssignment.js'
import { useClassTeacherAssignment } from './useClassTeacherAssignment.js'

const silentFeedback = {
  error() {},
  success() {},
  warning() {}
}

const silentDialogs = {
  async confirm() {}
}

export function useClassManagement({
  api = classManagementApi,
  dialogs = silentDialogs,
  feedback = silentFeedback,
  onUnauthorized = () => {},
  saveFile
} = {}) {
  const activeClass = ref(null)

  function handleAdminError(error, fallback) {
    if (handleAdminAuthorizationError(error, { feedback, onUnauthorized })) return true
    feedback.error(error?.message || fallback)
    return false
  }

  const teacherAssignment = useClassTeacherAssignment({
    activeClass,
    api,
    feedback,
    handleAdminError
  })
  const directory = useClassDirectory({
    api,
    dialogs,
    feedback,
    handleAdminError,
    onRowsLoaded: teacherAssignment.loadTeacherSummaries,
    saveFile
  })
  const studentAssignment = useClassStudentAssignment({
    activeClass,
    api,
    dialogs,
    feedback,
    handleAdminError
  })

  return {
    ...directory,
    ...studentAssignment,
    ...teacherAssignment,
    activeClass,
    handleAdminError
  }
}
