import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useAccountSecurity } from './useAccountSecurity.js'

function createSecurityModel(apiOverrides = {}) {
  const calls = []
  let timerCallback
  const model = useAccountSecurity({
    profileMessage: ref('资料已保存'),
    getAccountPhone: () => '13800000000',
    api: {
      async changePassword(payload) {
        calls.push(['change', payload])
      },
      async sendSMSCode(payload) {
        calls.push(['sms', payload])
        return { devCode: '123456' }
      },
      async resetPassword(payload) {
        calls.push(['reset', payload])
      },
      ...apiOverrides
    },
    logoutUser: async () => calls.push(['logout']),
    afterPasswordReset: async () => calls.push(['redirect']),
    setTimer(callback, delay) {
      timerCallback = callback
      calls.push(['timer', delay])
      return 7
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

test('account security validates and changes the current password', async () => {
  const { calls, model } = createSecurityModel()
  Object.assign(model.passwordForm, {
    oldPassword: 'old-secret',
    newPassword: 'new-secret',
    confirmPassword: 'different'
  })

  assert.equal(await model.savePassword(), false)
  assert.equal(model.passwordError.value, true)
  assert.match(model.passwordMessage.value, /不一致/)

  model.passwordForm.confirmPassword = 'new-secret'
  assert.equal(await model.savePassword(), true)
  assert.deepEqual(calls, [[
    'change',
    { oldPassword: 'old-secret', newPassword: 'new-secret' }
  ]])
  assert.deepEqual({ ...model.passwordForm }, {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  assert.equal(model.passwordMessage.value, '密码已修改')
})

test('account security sends reset codes and owns the countdown', async () => {
  const { calls, getTimerCallback, model } = createSecurityModel()

  model.openPasswordReset()
  assert.equal(model.activeTab.value, 'reset')
  assert.equal(model.resetForm.phone, '13800000000')
  assert.equal(await model.sendResetCode(), true)

  assert.deepEqual(calls.slice(0, 2), [
    ['sms', { phone: '13800000000', scene: 'RESET_PASSWORD' }],
    ['timer', 1000]
  ])
  assert.equal(model.resetMessage.value, '测试验证码：123456')
  assert.equal(model.resetCountdown.value, 60)
  getTimerCallback()()
  assert.equal(model.resetCountdown.value, 59)
  model.stopResetCountdown()
  assert.deepEqual(calls.at(-1), ['clear-timer', 7])
})

test('account security resets the password before logout and redirect', async () => {
  const { calls, model } = createSecurityModel()
  Object.assign(model.resetForm, {
    phone: '13800000000',
    smsCode: '123456',
    newPassword: 'new-secret',
    confirmPassword: 'new-secret'
  })

  assert.equal(await model.submitPasswordReset(), true)

  assert.deepEqual(calls, [
    ['reset', {
      phone: '13800000000',
      smsCode: '123456',
      newPassword: 'new-secret'
    }],
    ['logout'],
    ['redirect']
  ])
  assert.equal(model.resetLoading.value, false)
})

test('account security rejects invalid reset fields before API calls', async () => {
  const { calls, model } = createSecurityModel()
  Object.assign(model.resetForm, {
    phone: 'invalid',
    smsCode: '12',
    newPassword: 'short',
    confirmPassword: 'other'
  })

  assert.equal(await model.submitPasswordReset(), false)
  assert.deepEqual(calls, [])
  assert.equal(model.resetError.value, true)
  assert.match(model.resetMessage.value, /手机号/)
})
