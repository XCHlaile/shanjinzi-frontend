import { httpClient } from '../../../shared/api/httpClient.js'
import { createSchoolCatalogApi } from './schoolCatalogApi.js'
import { schoolAdministrationContracts } from './schoolAdministrationContracts.js'
import { createSchoolStudentApi } from './schoolStudentApi.js'
import { createSchoolUserApi } from './schoolUserApi.js'

export { schoolAdministrationContracts } from './schoolAdministrationContracts.js'

export function createSchoolAdministrationApi(transport = httpClient) {
  return Object.freeze({
    ...createSchoolCatalogApi(transport, schoolAdministrationContracts),
    ...createSchoolUserApi(transport, schoolAdministrationContracts),
    ...createSchoolStudentApi(transport, schoolAdministrationContracts)
  })
}

export const schoolAdministrationApi = createSchoolAdministrationApi()
