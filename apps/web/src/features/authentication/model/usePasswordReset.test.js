import assert from 'node:assert/strict'
import test from 'node:test'

import { usePasswordReset } from './usePasswordReset.js'

function createPasswordResetModel(apiOverrides = {}) {
  const calls = []
  let timerCallback
  const model = usePasswordReset({
    initialPhone: '13800000000',
    api: {
      async sendSMSCode(payload) {
        calls.push(['sms', payload])
        return { devCode: '123456', expiresInSeconds: 30 }
      },
      async resetPassword(payload) {
        calls.push(['reset', payload])
      },
      ...apiOverrides
    },
    afterReset: async () => calls.push(['redirect']),
    setTimer(callback, delay) {
      timerCallback = callback
      calls.push(['timer', delay])
      return 9
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

test('password reset sends a reset-scene code and owns its countdown', async () => {
  const { calls, getTimerCallback, model } = createPasswordResetModel()

  assert.equal(await model.sendResetCode(), true)
  assert.deepEqual(calls.slice(0, 2), [
    ['sms', { phone: '13800000000', scene: 'RESET_PASSWORD' }],
    ['timer', 1000]
  ])
  assert.equal(model.message.value, '测试验证码：123456')
  assert.equal(model.countdown.value, 30)

  getTimerCallback()()
  assert.equal(model.countdown.value, 29)
  model.stopCountdown()
  assert.deepEqual(calls.at(-1), ['clear-timer', 9])
})

test('password reset validates and submits the normalized credentials', async () => {
  const { calls, model } = createPasswordResetModel()
  Object.assign(model.form, {
    smsCode: '654321',
    newPassword: 'new-secret',
    confirmPassword: 'new-secret'
  })

  assert.equal(await model.submitPasswordReset(), true)
  assert.deepEqual(calls, [
    ['reset', {
      phone: '13800000000',
      smsCode: '654321',
      newPassword: 'new-secret'
    }],
    ['redirect']
  ])
  assert.equal(model.loading.value, false)
})

test('password reset rejects invalid fields before calling the API', async () => {
  const { calls, model } = createPasswordResetModel()
  Object.assign(model.form, {
    phone: 'invalid',
    smsCode: '12',
    newPassword: 'short',
    confirmPassword: 'different'
  })

  assert.equal(await model.submitPasswordReset(), false)
  assert.deepEqual(calls, [])
  assert.match(model.error.value, /手机号/)
})

test('password reset clears stale success state when sending fails', async () => {
  const { model } = createPasswordResetModel({
    async sendSMSCode() {
      throw new Error('短信服务不可用')
    }
  })
  model.message.value = '旧提示'

  assert.equal(await model.sendResetCode(), false)
  assert.equal(model.message.value, '')
  assert.equal(model.error.value, '短信服务不可用')
  assert.equal(model.sending.value, false)
})
