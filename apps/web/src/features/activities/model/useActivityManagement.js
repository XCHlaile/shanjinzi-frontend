import { useActivityComments } from './useActivityComments.js'
import { useActivityDirectory } from './useActivityDirectory.js'
import { useActivityMutations } from './useActivityMutations.js'
import { useActivityPublishing } from './useActivityPublishing.js'

export function useActivityManagement({
  role,
  currentStudent,
  initialUser,
  requestedMomentId,
  currentUserId,
  confirm = async () => {},
  prompt = async () => {},
  notify = { success() {}, error() {} },
  createDirectory = useActivityDirectory,
  createComments = useActivityComments,
  createPublishing = useActivityPublishing,
  createMutations = useActivityMutations
}) {
  const directory = createDirectory({
    role,
    currentStudent,
    initialUser,
    requestedMomentId
  })
  const comments = createComments({
    currentUserId,
    confirm,
    notify
  })
  directory.setActiveMomentReset(() => {
    comments.activeMomentId.value = null
  })

  const publishing = createPublishing({
    role,
    currentSchoolId: directory.currentSchoolId,
    listMode: directory.listMode,
    pagination: directory.pagination,
    reloadActivities: directory.loadActivities,
    notify
  })
  directory.setRelatedLoader(() => Promise.all([
    publishing.loadPublishClasses(),
    publishing.loadPublishStudents()
  ]))

  const mutations = createMutations({
    activityList: directory.activityList,
    currentUserId,
    confirm,
    prompt,
    notify
  })

  return {
    ...directory,
    ...comments,
    ...publishing,
    ...mutations
  }
}
