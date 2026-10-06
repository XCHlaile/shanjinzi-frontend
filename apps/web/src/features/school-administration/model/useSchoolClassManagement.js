import { useClassDirectory } from './useClassDirectory.js'
import { useClassMembership } from './useClassMembership.js'

export function useSchoolClassManagement({
  confirm = async () => {},
  notify = { success() {} },
  createDirectory = useClassDirectory,
  createMembership = useClassMembership
} = {}) {
  const directory = createDirectory({ notify })
  const membership = createMembership({
    schoolId: directory.schoolId,
    confirm,
    notify
  })

  directory.setRelatedLoader(membership.loadTeacherOptions)

  return {
    ...directory,
    ...membership
  }
}
