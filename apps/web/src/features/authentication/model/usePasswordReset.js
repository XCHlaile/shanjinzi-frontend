import { reactive, ref } from 'vue'

import { authenticationApi } from '../api/authenticationApi.js'

export function usePasswordReset({
  initialPhone = '',
  api = authenticationApi,
  afterReset = async () => {},
  invalidPhoneMessage = '请输入正确的 11 位手机号',
  setTimer = setInterval,
  clearTimer = clearInterval
} = {}) {
  const form = reactive({
    phone: initialPhone,
    smsCode: '',
    newPassword: '',
    confirmPassword: ''
  })
  const error = ref('')
  const message = ref('')
  const loading = ref(false)
  const sending = ref(false)
  const countdown = ref(0)
  let countdownTimer = null

  function clearStatus() {
    error.value = ''
    message.value = ''
  }

  function validatePhone() {
    if (!/^1\d{10}$/.test(form.phone)) {
      throw new Error(invalidPhoneMessage)
    }
  }

  function stopCountdown() {
    if (countdownTimer !== null) clearTimer(countdownTimer)
    countdownTimer = null
  }

  function startCountdown(seconds = 60) {
    stopCountdown()
    countdown.value = seconds
    countdownTimer = setTimer(() => {
      countdown.value -= 1
      if (countdown.value <= 0) stopCountdown()
    }, 1000)
  }

  async function sendResetCode() {
    clearStatus()
    try {
      validatePhone()
      sending.value = true
      const result = await api.sendSMSCode({
        phone: form.phone,
        scene: 'RESET_PASSWORD'
      })
      message.value = result?.devCode
        ? `测试验证码：${result.devCode}`
        : '验证码已发送'
      startCountdown(Number(result?.expiresInSeconds) || 60)
      return true
    } catch (cause) {
      error.value = cause.message || '验证码发送失败'
      return false
    } finally {
      sending.value = false
    }
  }

  async function submitPasswordReset() {
    clearStatus()
    try {
      validatePhone()
      if (!/^\d{6}$/.test(form.smsCode)) {
        throw new Error('请输入 6 位短信验证码')
      }
      if (form.newPassword.length < 6 || form.newPassword.length > 72) {
        throw new Error('新密码长度应为 6—72 位')
      }
      if (form.newPassword !== form.confirmPassword) {
        throw new Error('两次输入的新密码不一致')
      }
      loading.value = true
      await api.resetPassword({
        phone: form.phone,
        smsCode: form.smsCode,
        newPassword: form.newPassword
      })
      await afterReset()
      return true
    } catch (cause) {
      error.value = cause.message || '密码重置失败'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    clearStatus,
    countdown,
    error,
    form,
    loading,
    message,
    sending,
    sendResetCode,
    startCountdown,
    stopCountdown,
    submitPasswordReset
  }
}
