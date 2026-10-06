export {
  competitionApi,
  competitionContracts,
  createCompetitionApi
} from './api/competitionApi.js'

export {
  canSignupCompetition,
  competitionHeroDescription,
  competitionPageItems,
  competitionProgressWidth,
  competitionRegistrationClassName,
  competitionRegistrationKey,
  competitionRegistrationName,
  competitionRegistrationStatusColor,
  competitionRegistrationStatusLabel,
  competitionScopeLabel,
  competitionSignupButtonText,
  competitionStatusLabel,
  competitionTeacherId,
  competitionTeacherOptionLabel,
  formatCompetitionDateTime,
  hasCompetitionRegistration,
  isAvailableCompetitionTeacher,
  isPositiveCompetitionId,
  normalizeMyCompetitionRegistration,
  normalizeCompetition,
  normalizeRegistrationStats
} from './lib/competitionViewModel.js'

export { useCompetitionDirectory } from './model/useCompetitionDirectory.js'
export { useCompetitionManagement } from './model/useCompetitionManagement.js'
export {
  useCompetitionRegistrationManagement
} from './model/useCompetitionRegistrationManagement.js'
export { useCompetitionSignup } from './model/useCompetitionSignup.js'
export { useMyRegistrations } from './model/useMyRegistrations.js'
