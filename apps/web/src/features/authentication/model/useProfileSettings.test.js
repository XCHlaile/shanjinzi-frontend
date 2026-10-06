import assert from 'node:assert/strict'
import test from 'node:test'

import { useProfileSettings } from './useProfileSettings.js'

test('profile settings loads account fields and avatar metadata', async () => {
  const settings = useProfileSettings({
    user: { nickname: '旧昵称', phone: '13800000000' },
    api: {
      async fetchAccountProfile() {
        return {
          nickname: '新昵称',
          phone: '13900000000',
          gender: 'FEMALE',
          avatarFileId: 7,
          avatarUrl: '/api/open/files/7'
        }
      }
    },
    saveUserProfile: async () => ({ success: true })
  })

  await settings.loadProfile()

  assert.deepEqual(
    {
      nickname: settings.form.nickname,
      phone: settings.form.phone,
      gender: settings.form.gender
    },
    {
      nickname: '新昵称',
      phone: '13900000000',
      gender: 'FEMALE'
    }
  )
  assert.deepEqual(settings.avatarFiles.value, [{
    fileId: 7,
    url: '/api/open/files/7',
    originalName: '当前头像 #7'
  }])
  assert.equal(settings.profileInitial.value, '新')
  assert.match(settings.avatarPreviewUrl.value, /\/api\/open\/files\/7$/)
})

test('profile settings saves only editable profile and avatar fields', async () => {
  const calls = []
  const settings = useProfileSettings({
    user: {
      nickname: '小山',
      phone: '13800000000',
      avatarUrl: '/old-avatar'
    },
    api: { fetchAccountProfile: async () => ({}) },
    async saveUserProfile(payload) {
      calls.push(payload)
      return {
        success: true,
        data: { avatarUrl: '/saved-avatar' }
      }
    }
  })
  settings.form.nickname = '山金子'
  settings.form.gender = 'MALE'
  settings.avatarFiles.value = [{
    fileId: 9,
    url: '/uploaded-avatar'
  }]

  assert.equal(await settings.saveProfile(), true)

  assert.deepEqual(calls, [{
    nickname: '山金子',
    gender: 'MALE',
    avatarFileId: 9,
    avatarUrl: '/uploaded-avatar'
  }])
  assert.equal(settings.currentAvatarUrl.value, '/saved-avatar')
  assert.equal(settings.message.value, '资料已保存')
  assert.equal(settings.profileError.value, false)
  assert.equal(settings.profileLoading.value, false)
})

test('profile settings exposes load and save failures', async () => {
  const settings = useProfileSettings({
    user: {},
    api: {
      async fetchAccountProfile() {
        throw new Error('资料超时')
      }
    },
    saveUserProfile: async () => ({
      success: false,
      message: '头像不可用'
    })
  })

  assert.equal(await settings.loadProfile(), null)
  assert.equal(settings.message.value, '资料超时')
  assert.equal(settings.profileError.value, true)

  assert.equal(await settings.saveProfile(), false)
  assert.equal(settings.message.value, '头像不可用')
  assert.equal(settings.profileError.value, true)
})
