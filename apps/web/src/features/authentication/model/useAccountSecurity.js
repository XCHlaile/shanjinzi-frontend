import { computed, reactive, ref } from 'vue'

import { authenticationApi } from '../api/authenticationApi.js'
import { logout } from './session.js'
import { usePasswordReset } from './usePasswordReset.js'

export function useAccountSecurity({
  profileMessage,
  getAccountPhone = () => '',
  api = authenticationApi,
  logoutUser = logout,
  afterPasswordReset = async () => {},
  setTimer = setInterval,
  clearTimer = clearInterval
} = {}) {
  const passwordForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const passwordMessage = ref('')
  const passwordError = ref(false)
  const passwordLoading = ref(false)
  const activeTab = ref('profile')
  const {
    clearStatus: clearResetStatus,
    countdown: resetCountdown,
    error: resetFailureMessage,
    form: resetForm,
    loading: resetLoading,
    message: resetSuccessMessage,
    sending: resetCodeSending,
    sendResetCode,
    startCountdown: startResetCountdown,
    stopCountdown: stopResetCountdown,
    submitPasswordReset
  } = usePasswordReset({
    initialPhone: getAccountPhone(),
    api,
    invalidPhoneMessage: '当前账号没有有效的 11 位手机号',
    setTimer,
    clearTimer,
    afterReset: async () => {
      await logoutUser()
      await afterPasswordReset()
    }
  })
  const resetError = computed(() => Boolean(resetFailureMessage.value))
  const resetMessage = computed(() => (
    resetFailureMessage.value || resetSuccessMessage.value
  ))

  function setActiveTab(tab) {
    activeTab.value = tab
    if (profileMessage) profileMessage.value = ''
    passwordMessage.value = ''
    passwordError.value = false
    clearResetStatus()
  }

  async function savePassword() {
    passwordMessage.value = ''
    passwordError.value = false
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      passwordError.value = true
      passwordMessage.value = '两次输入的新密码不一致'
      return false
    }
    passwordLoading.value = true
    try {
      await api.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })
      Object.assign(passwordForm, {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      passwordMessage.value = '密码已修改'
      return true
    } catch (error) {
      passwordError.value = true
      passwordMessage.value = error.message || '修改失败'
      return false
    } finally {
      passwordLoading.value = false
    }
  }

  function openPasswordReset() {
    Object.assign(resetForm, {
      phone: getAccountPhone(),
      smsCode: '',
      newPassword: '',
      confirmPassword: ''
    })
    setActiveTab('reset')
  }

  return {
    activeTab,
    openPasswordReset,
    passwordError,
    passwordForm,
    passwordLoading,
    passwordMessage,
    resetCodeSending,
    resetCountdown,
    resetError,
    resetForm,
    resetLoading,
    resetMessage,
    savePassword,
    sendResetCode,
    setActiveTab,
    startResetCountdown,
    stopResetCountdown,
    submitPasswordReset
  }
}
