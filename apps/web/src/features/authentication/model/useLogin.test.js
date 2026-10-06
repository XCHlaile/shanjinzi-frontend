import assert from 'node:assert/strict'
import test from 'node:test'

import { useLogin } from './useLogin.js'

function createLoginModel(authOverrides = {}) {
  const calls = []
  let timerCallback
  const model = useLogin({
    initialMessage: '密码已重置',
    auth: {
      async loginWithPassword(phone, password) {
        calls.push(['password-login', phone, password])
        return { success: true }
      },
      async loginWithPhone(phone, code) {
        calls.push(['code-login', phone, code])
        return { id: 1 }
      },
      async sendSMSCode(phone) {
        calls.push(['sms', phone])
        return {
          success: true,
          debugCode: '123456',
          expiresInSeconds: 30
        }
      },
      ...authOverrides
    },
    afterLogin: async () => calls.push(['dashboard']),
    afterUnregistered: async phone => calls.push(['register', phone]),
    setTimer(callback, delay) {
      timerCallback = callback
      calls.push(['timer', delay])
      return 11
    },
    clearTimer(id) {
      calls.push(['clear-timer', id])
    }
  })

  return {
    calls,
    getTimerCallback: () => timerCallback,
    model
  }
}

test('login model submits a password and continues after success', async () => {
  const { calls, model } = createLoginModel()
  model.phone.value = '13800000000'
  model.pwd.value = 'secret'

  assert.equal(await model.handlePasswordLogin(), true)
  assert.deepEqual(calls, [
    ['password-login', '13800000000', 'secret'],
    ['dashboard']
  ])
  assert.equal(model.loading.value, false)
})

test('login model exposes password authentication failures', async () => {
  const observedCalls = []
  const { model } = createLoginModel({
    async loginWithPassword(phone, password) {
      observedCalls.push(['password-login', phone, password])
      return { success: false, message: '账号或密码错误' }
    }
  })
  model.phone.value = '13800000000'
  model.pwd.value = 'wrong'

  assert.equal(await model.handlePasswordLogin(), false)
  assert.deepEqual(observedCalls, [
    ['password-login', '13800000000', 'wrong']
  ])
  assert.equal(model.error.value, '账号或密码错误')
  assert.equal(model.loading.value, false)
})

test('login model sends a code and owns its countdown', async () => {
  const { calls, getTimerCallback, model } = createLoginModel()
  model.phone.value = '13800000000'

  assert.equal(await model.sendCode(), true)
  assert.deepEqual(calls.slice(0, 2), [
    ['sms', '13800000000'],
    ['timer', 1000]
  ])
  assert.equal(model.msg.value, '测试验证码：123456')
  assert.equal(model.countdown.value, 30)

  getTimerCallback()()
  assert.equal(model.countdown.value, 29)
  model.stopCountdown()
  assert.deepEqual(calls.at(-1), ['clear-timer', 11])
})

test('login model routes unknown phone users to registration', async () => {
  const observedCalls = []
  const { calls, model } = createLoginModel({
    async loginWithPhone(phone, code) {
      observedCalls.push(['code-login', phone, code])
      return null
    }
  })
  model.phone.value = '13800000000'
  model.code.value = '654321'

  assert.equal(await model.handleCodeLogin(), false)
  assert.deepEqual(observedCalls, [
    ['code-login', '13800000000', '654321']
  ])
  assert.deepEqual(calls, [
    ['register', '13800000000']
  ])
  assert.equal(model.loading.value, false)
})

test('login model validates phone fields before authentication calls', async () => {
  const { calls, model } = createLoginModel()

  assert.equal(await model.sendCode(), false)
  assert.match(model.error.value, /手机号/)
  assert.equal(await model.handleCodeLogin(), false)
  assert.match(model.error.value, /手机号和验证码/)
  assert.deepEqual(calls, [])
})
