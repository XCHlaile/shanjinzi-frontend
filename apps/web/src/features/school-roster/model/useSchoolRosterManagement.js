import { computed, watch } from 'vue'

import { useGuardianManagement } from './useGuardianManagement.js'
import { useRosterDirectory } from './useRosterDirectory.js'
import { useRosterRecordManagement } from './useRosterRecordManagement.js'
import { useRosterStudentProfile } from './useRosterStudentProfile.js'
import { useStudentRosterTransfers } from './useStudentRosterTransfers.js'

export function useSchoolRosterManagement({
  mode,
  pageSize = 20,
  confirm = async () => {},
  alert = async () => {},
  notify = { success() {}, error() {} },
  createDirectory = useRosterDirectory,
  createRecordManagement = useRosterRecordManagement,
  createGuardianManagement = useGuardianManagement,
  createStudentProfile = useRosterStudentProfile,
  createRosterTransfers = useStudentRosterTransfers,
  watchMode = watch
}) {
  const modeLabel = computed(() => (
    mode.value === 'teachers' ? '教师' : mode.value === 'parents' ? '家长' : '学生'
  ))
  const recordLabel = computed(() => modeLabel.value)
  const title = computed(() => (
    mode.value === 'teachers'
      ? '本校教师管理'
      : mode.value === 'parents'
        ? '本校家长管理'
        : '学生名册管理'
  ))
  const roleCode = computed(() => (mode.value === 'teachers' ? 'TEACHER' : 'PARENT'))

  const directory = createDirectory({
    mode,
    modeLabel,
    roleCode,
    pageSize
  })
  const recordManagement = createRecordManagement({
    mode,
    roleCode,
    recordLabel,
    resolveSchoolId: directory.resolveSchoolId,
    reloadRows: directory.loadRows,
    confirm,
    alert,
    notify
  })
  const guardianManagement = createGuardianManagement({
    rows: directory.rows,
    resolveSchoolId: directory.resolveSchoolId,
    confirm,
    notify
  })
  const studentProfile = createStudentProfile({
    activeStudent: guardianManagement.activeStudent
  })
  const rosterTransfers = createRosterTransfers({
    keyword: directory.keyword,
    statusFilter: directory.statusFilter,
    reloadRows: directory.loadRows,
    notify
  })

  watchMode(mode, async () => {
    directory.keyword.value = ''
    directory.statusFilter.value = ''
    directory.classIdFilter.value = ''
    directory.page.value = 1
    if (mode.value === 'teachers') await recordManagement.loadClassOptions()
    await directory.loadRows()
  }, { immediate: true })

  return {
    ...directory,
    ...recordManagement,
    ...guardianManagement,
    ...studentProfile,
    ...rosterTransfers,
    mode,
    modeLabel,
    recordLabel,
    roleCode,
    title
  }
}
