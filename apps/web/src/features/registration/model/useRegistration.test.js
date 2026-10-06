import assert from 'node:assert/strict'
import test from 'node:test'

import { useRegistration } from './useRegistration.js'

test('registration loads valid public schools and resets stale selection', async () => {
  const registration = useRegistration({
    initialPhone: '13800000000',
    schoolApi: {
      async fetchPublicSchools(query) {
        assert.deepEqual(query, { page: 1, pageSize: 100 })
        return {
          schools: [
            { id: 2, name: '示范幼儿园' },
            { id: null, name: '无效学校' }
          ]
        }
      }
    }
  })
  registration.form.schoolId = 9

  await registration.loadSchools()

  assert.deepEqual(registration.schoolOptions.value, [{
    id: 2,
    name: '示范幼儿园'
  }])
  assert.equal(registration.form.schoolId, '')
  assert.equal(registration.schoolsLoading.value, false)
  assert.equal(registration.relationOptions.length, 6)
})

test('registration validates the phone and sends a register code', async () => {
  const calls = []
  const registration = useRegistration({
    auth: {
      async sendSMSCode(payload) {
        calls.push(payload)
        return { success: true, debugCode: '123456' }
      }
    }
  })

  assert.equal(await registration.sendRegisterCode(), false)
  assert.equal(registration.error.value, '请输入正确的手机号')

  registration.form.phone = '13800000000'
  assert.equal(await registration.sendRegisterCode(), true)

  assert.deepEqual(calls, [{
    phone: '13800000000',
    scene: 'REGISTER'
  }])
  assert.equal(registration.msg.value, '测试验证码：123456')
  assert.equal(registration.sending.value, false)
})

test('registration submits the selected school and continues after success', async () => {
  const calls = []
  const registration = useRegistration({
    initialPhone: '13800000000',
    auth: {
      async registerUser(payload) {
        calls.push(payload)
        return { ok: true, user: { id: 1 } }
      }
    },
    async afterRegister(result) {
      calls.push(['done', result.user.id])
    }
  })
  Object.assign(registration.form, {
    smsCode: '123456',
    password: 'Password123',
    realName: '山女士',
    schoolId: 2,
    studentName: '小山',
    bindCode: '',
    relationType: 'MOTHER'
  })

  assert.equal(await registration.handleRegister(), true)

  assert.equal(calls[0].schoolId, 2)
  assert.equal(calls[0].bindCode, '')
  assert.deepEqual(calls[1], ['done', 1])
  assert.equal(registration.loading.value, false)
})

test('registration exposes school and registration failures', async () => {
  const registration = useRegistration({
    schoolApi: {
      async fetchPublicSchools() {
        throw new Error('学校不可用')
      }
    },
    auth: {
      async registerUser() {
        return { ok: false, msg: '注册信息不匹配' }
      }
    }
  })

  await registration.loadSchools()
  assert.equal(registration.schoolLoadError.value, '学校不可用')

  assert.equal(await registration.handleRegister(), false)
  assert.equal(registration.error.value, '请选择学校')

  registration.form.schoolId = 2
  assert.equal(await registration.handleRegister(), false)
  assert.equal(registration.error.value, '注册信息不匹配')
})
