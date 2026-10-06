import { ref } from 'vue'

import { useCompetitionDirectory } from './useCompetitionDirectory.js'
import {
  useCompetitionRegistrationManagement
} from './useCompetitionRegistrationManagement.js'
import { useCompetitionSignup } from './useCompetitionSignup.js'

export function useCompetitionManagement({
  role,
  currentStudent,
  user,
  getRequestedCompetitionId = () => null,
  actionMessage = ref(''),
  createDirectory = useCompetitionDirectory,
  createSignup = useCompetitionSignup,
  createRegistrationManagement = useCompetitionRegistrationManagement
}) {
  const directory = createDirectory({
    role,
    getRequestedCompetitionId
  })
  const signup = createSignup({
    currentStudent,
    user,
    actionMessage,
    reloadCompetitions: directory.loadCompetitions
  })
  const registrationManagement = createRegistrationManagement({
    role,
    actionMessage
  })

  return {
    ...directory,
    ...signup,
    ...registrationManagement,
    actionMessage
  }
}
