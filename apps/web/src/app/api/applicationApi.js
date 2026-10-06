import { validateApiContractMap } from '@shanjinzi/api-contracts'

import { activityContracts, createActivityApi } from '../../features/activities/index.js'
import {
  authenticationContracts,
  createAuthenticationApi
} from '../../features/authentication/index.js'
import { competitionContracts, createCompetitionApi } from '../../features/competition/index.js'
import { contentContracts, createContentApi } from '../../features/content/index.js'
import { createForumApi, forumContracts } from '../../features/forum/index.js'
import { createMessageApi, messageContracts } from '../../features/messaging/index.js'
import { createOperationsApi, operationsContracts } from '../../features/operations/index.js'
import {
  createSchoolAdministrationApi,
  schoolAdministrationContracts
} from '../../features/school-administration/index.js'
import { createStudentApi, studentContracts } from '../../features/student-context/index.js'
import { createFileApi, fileContracts } from '../../shared/api/fileApi.js'
import { httpClient } from '../../shared/api/httpClient.js'

export const apiContracts = validateApiContractMap({
  health: authenticationContracts.health,
  auth: authenticationContracts.auth,
  guardians: studentContracts.guardians,
  students: studentContracts.students,
  me: authenticationContracts.me,
  home: authenticationContracts.home,
  teacherWorkbench: authenticationContracts.teacherWorkbench,
  moments: activityContracts.moments,
  competitions: competitionContracts.competitions,
  registrations: competitionContracts.registrations,
  files: fileContracts.files,
  publicPages: contentContracts.publicPages,
  publicNews: contentContracts.publicNews,
  publicSchools: schoolAdministrationContracts.publicSchools,
  publicClasses: schoolAdministrationContracts.publicClasses,
  publicCompetitions: competitionContracts.publicCompetitions,
  competitionAdministration: competitionContracts.competitionAdministration,
  openUsers: schoolAdministrationContracts.openUsers,
  publicStudents: schoolAdministrationContracts.publicStudents,
  openAuditLogs: operationsContracts.openAuditLogs,
  openExports: operationsContracts.openExports,
  messages: messageContracts.messages,
  forum: forumContracts.forum,
  notifications: messageContracts.notifications
})

export { fillPath } from '../../shared/api/requestUtils.js'

export function createApiClient(transport = httpClient) {
  const activityApi = createActivityApi(transport)
  const authenticationApi = createAuthenticationApi(transport)
  const competitionApi = createCompetitionApi(transport)
  const contentApi = createContentApi(transport)
  const fileApi = createFileApi(transport)
  const forumApi = createForumApi(transport)
  const messageApi = createMessageApi(transport)
  const operationsApi = createOperationsApi(transport)
  const schoolAdministrationApi = createSchoolAdministrationApi(transport)
  const studentApi = createStudentApi(transport)

  return {
    ...activityApi,
    ...authenticationApi,
    ...competitionApi,
    ...contentApi,
    ...fileApi,
    ...forumApi,
    ...messageApi,
    ...operationsApi,
    ...schoolAdministrationApi,
    ...studentApi
  }
}
