import { ref } from 'vue'

import {
  loginWithPassword,
  loginWithPhone,
  sendSMSCode
} from './session.js'

const defaultAuthentication = {
  loginWithPassword,
  loginWithPhone,
  sendSMSCode
}

export function useLogin({
  initialMessage = '',
  auth = defaultAuthentication,
  afterLogin = async () => {},
  afterUnregistered = async () => {},
  setTimer = setInterval,
  clearTimer = clearInterval
} = {}) {
  const phone = ref('')
  const code = ref('')
  const pwd = ref('')
  const error = ref('')
  const msg = ref(initialMessage)
  const loading = ref(false)
  const sending = ref(false)
  const countdown = ref(0)
  const loginMode = ref('code')
  let countdownTimer = null

  function clearStatus() {
    error.value = ''
    msg.value = ''
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

  async function handlePasswordLogin() {
    error.value = ''
    loading.value = true
    try {
      const result = await auth.loginWithPassword(phone.value, pwd.value)
      if (!result.success) {
        error.value = result.message || '登录失败，请确认账号密码或后端服务状态。'
        return false
      }
      await afterLogin()
      return true
    } catch (cause) {
      error.value = cause.message || '登录失败，请确认账号密码或后端服务状态。'
      return false
    } finally {
      loading.value = false
    }
  }

  async function sendCode() {
    if (!/^1\d{10}$/.test(phone.value)) {
      error.value = '请输入正确的手机号'
      return false
    }
    clearStatus()
    sending.value = true
    try {
      const result = await auth.sendSMSCode(phone.value)
      if (!result.success) {
        error.value = result.message || '发送失败'
        return false
      }
      msg.value = result.debugCode
        ? `测试验证码：${result.debugCode}`
        : '验证码已发送'
      startCountdown(Number(result.expiresInSeconds) || 60)
      return true
    } catch (cause) {
      error.value = cause.message || '发送失败'
      return false
    } finally {
      sending.value = false
    }
  }

  async function handleCodeLogin() {
    error.value = ''
    if (!phone.value || !code.value) {
      error.value = '请输入手机号和验证码'
      return false
    }
    loading.value = true
    try {
      const user = await auth.loginWithPhone(phone.value, code.value)
      if (user) {
        await afterLogin()
        return true
      }
      await afterUnregistered(phone.value)
      return false
    } catch (cause) {
      error.value = cause.message || '登录失败'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    code,
    countdown,
    error,
    handleCodeLogin,
    handlePasswordLogin,
    loading,
    loginMode,
    msg,
    phone,
    pwd,
    sendCode,
    sending,
    startCountdown,
    stopCountdown
  }
}
