import { computed, reactive, ref } from 'vue'

import { resolveApiAssetUrl } from '../../../shared/api/httpClient.js'
import { authenticationApi } from '../api/authenticationApi.js'
import { getCurrentUser, updateUserProfile } from './session.js'

export function useProfileSettings({
  user = getCurrentUser() || {},
  api = authenticationApi,
  saveUserProfile = updateUserProfile
} = {}) {
  const form = reactive({
    nickname: user.nickname || user.name || user.realName || '',
    phone: user.phone || '',
    gender: user.gender || ''
  })
  const message = ref('')
  const profileError = ref(false)
  const profileLoading = ref(false)
  const avatarFiles = ref([])
  const currentAvatarUrl = ref(user.avatarUrl || '')
  const avatarUploading = ref(false)

  const profileInitial = computed(
    () => String(form.nickname || form.phone || '用').slice(0, 1)
  )
  const avatarPreviewUrl = computed(() => resolveApiAssetUrl(
    avatarFiles.value[0]?.url || currentAvatarUrl.value
  ))

  async function loadProfile() {
    try {
      const profile = await api.fetchAccountProfile()
      form.nickname = profile.nickname || profile.realName || form.nickname
      form.phone = profile.phone || form.phone
      form.gender = profile.gender || ''
      currentAvatarUrl.value = profile.avatarUrl || currentAvatarUrl.value
      avatarFiles.value = profile.avatarFileId
        ? [{
            fileId: profile.avatarFileId,
            url: profile.avatarUrl,
            originalName: `当前头像 #${profile.avatarFileId}`
          }]
        : []
      return profile
    } catch (error) {
      profileError.value = true
      message.value = error.message || '个人资料加载失败'
      return null
    }
  }

  async function saveProfile() {
    if (profileLoading.value || avatarUploading.value) return false
    profileError.value = false
    profileLoading.value = true
    try {
      const result = await saveUserProfile({
        nickname: form.nickname,
        gender: form.gender,
        avatarFileId: avatarFiles.value[0]?.fileId,
        avatarUrl: avatarFiles.value[0]?.url || currentAvatarUrl.value
      })
      profileError.value = !result.success
      message.value = result.success
        ? '资料已保存'
        : result.message || '保存失败'
      if (result.success) {
        currentAvatarUrl.value = result.data?.avatarUrl
          || avatarFiles.value[0]?.url
          || currentAvatarUrl.value
      }
      return result.success
    } finally {
      profileLoading.value = false
    }
  }

  return {
    avatarFiles,
    avatarPreviewUrl,
    avatarUploading,
    currentAvatarUrl,
    form,
    loadProfile,
    message,
    profileError,
    profileInitial,
    profileLoading,
    saveProfile
  }
}
