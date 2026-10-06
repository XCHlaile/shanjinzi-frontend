import assert from 'node:assert/strict'
import test from 'node:test'
import { reactive, ref } from 'vue'

import { useAccountManagement } from './useAccountManagement.js'

test('account facade shares the loaded profile phone with security settings', async () => {
  const calls = []
  const user = { id: 8 }
  const afterPasswordReset = async () => {}
  const profile = {
    form: reactive({ phone: '' }),
    loadProfile: async () => {
      calls.push('profile-loaded')
      profile.form.phone = '13800138000'
    },
    message: ref('')
  }
  const security = {
    activeTab: ref('profile'),
    resetForm: reactive({ phone: '' })
  }

  const facade = useAccountManagement({
    user,
    afterPasswordReset,
    createProfileSettings(options) {
      calls.push('profile')
      assert.equal(options.user, user)
      return profile
    },
    createAccountSecurity(options) {
      calls.push('security')
      assert.equal(options.profileMessage, profile.message)
      assert.equal(options.getAccountPhone(), '')
      assert.equal(options.afterPasswordReset, afterPasswordReset)
      return security
    }
  })

  assert.deepEqual(calls, ['profile', 'security'])
  assert.equal(facade.message, profile.message)
  assert.equal(facade.activeTab, security.activeTab)

  await facade.initialize()
  assert.equal(security.resetForm.phone, '13800138000')
  assert.deepEqual(calls.slice(-1), ['profile-loaded'])
})
