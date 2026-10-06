import { useAccountSecurity } from './useAccountSecurity.js'
import { useProfileSettings } from './useProfileSettings.js'

export function useAccountManagement({
  user,
  afterPasswordReset = async () => {},
  createProfileSettings = useProfileSettings,
  createAccountSecurity = useAccountSecurity
} = {}) {
  const profile = createProfileSettings({ user })
  const security = createAccountSecurity({
    profileMessage: profile.message,
    getAccountPhone: () => profile.form.phone,
    afterPasswordReset
  })

  async function initialize() {
    await profile.loadProfile()
    security.resetForm.phone = profile.form.phone
  }

  return {
    ...profile,
    ...security,
    initialize
  }
}
