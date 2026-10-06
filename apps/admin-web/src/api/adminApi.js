import { createAdminManagementApiClient } from './adminManagementApi.js'
import { createClassApiClient } from './clients/classApiClient.js'
import { createCompetitionRegistrationApiClient } from './clients/competitionRegistrationApiClient.js'
import { createContentReportApiClient } from './clients/contentReportApiClient.js'
import { createOpenOperationsApiClient } from './clients/openOperationsApiClient.js'
import { createOpenStudentApiClient } from './clients/openStudentApiClient.js'
import { createOpenUserApiClient } from './clients/openUserApiClient.js'
import { request, requestBlob } from './client.js'

export { fillAdminPath } from './apiUtils.js'
export {
  buildStudentUpdatePayload,
  normalizeStudentImportFile
} from './clients/openStudentApiClient.js'

export function createAdminApiClient({
  request: requestImpl = request,
  download: downloadImpl = requestBlob
} = {}) {
  const transport = { request: requestImpl, download: downloadImpl }

  return {
    ...createAdminManagementApiClient({ request: requestImpl }),
    ...createClassApiClient(transport),
    ...createCompetitionRegistrationApiClient(transport),
    ...createContentReportApiClient(transport),
    ...createOpenOperationsApiClient(transport),
    ...createOpenStudentApiClient(transport),
    ...createOpenUserApiClient(transport)
  }
}

export const adminApiClient = createAdminApiClient()
