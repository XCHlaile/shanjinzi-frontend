import { ref } from 'vue'

import { schoolAdministrationApi } from '../../school-administration/index.js'
import { pageItems } from '../lib/rosterPresentation.js'

export function useRosterStudentProfile({
  activeStudent,
  api = schoolAdministrationApi
} = {}) {
  const profileDialog = ref(false)
  const drawerLoading = ref(false)
  const drawerError = ref('')
  const profileEvents = ref([])

  async function openProfile(student) {
    if (activeStudent) activeStudent.value = student
    profileDialog.value = true
    drawerLoading.value = true
    drawerError.value = ''
    try {
      profileEvents.value = pageItems(
        await api.getOpenStudentProfile(student.id)
      )
      return true
    } catch (cause) {
      profileEvents.value = []
      drawerError.value = cause.message || '成长档案加载失败'
      return false
    } finally {
      drawerLoading.value = false
    }
  }

  return {
    drawerError,
    drawerLoading,
    openProfile,
    profileDialog,
    profileEvents
  }
}
