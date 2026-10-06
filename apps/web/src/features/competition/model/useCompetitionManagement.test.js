import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useCompetitionManagement } from './useCompetitionManagement.js'

test('competition facade shares directory reload and action state across models', () => {
  const calls = []
  const actionMessage = ref('')
  const currentStudent = { id: 3 }
  const user = { id: 8 }
  const getRequestedCompetitionId = () => 12
  const directory = {
    competitions: ref([]),
    loadCompetitions: async () => {}
  }
  const signup = { signup: ref(null) }
  const registrations = { registrationCompetition: ref(null) }

  const facade = useCompetitionManagement({
    role: 'school',
    currentStudent,
    user,
    actionMessage,
    getRequestedCompetitionId,
    createDirectory(options) {
      calls.push('directory')
      assert.equal(options.role, 'school')
      assert.equal(options.getRequestedCompetitionId, getRequestedCompetitionId)
      return directory
    },
    createSignup(options) {
      calls.push('signup')
      assert.equal(options.currentStudent, currentStudent)
      assert.equal(options.user, user)
      assert.equal(options.actionMessage, actionMessage)
      assert.equal(options.reloadCompetitions, directory.loadCompetitions)
      return signup
    },
    createRegistrationManagement(options) {
      calls.push('registrations')
      assert.equal(options.role, 'school')
      assert.equal(options.actionMessage, actionMessage)
      return registrations
    }
  })

  assert.deepEqual(calls, ['directory', 'signup', 'registrations'])
  assert.equal(facade.actionMessage, actionMessage)
  assert.equal(facade.competitions, directory.competitions)
  assert.equal(facade.signup, signup.signup)
  assert.equal(facade.registrationCompetition, registrations.registrationCompetition)
})
