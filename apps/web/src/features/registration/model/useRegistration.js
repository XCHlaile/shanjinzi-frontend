import { reactive, ref } from 'vue'

import {
  registerUser,
  sendSMSCode
} from '../../authentication/index.js'
import { schoolAdministrationApi } from '../../school-administration/index.js'
import { STUDENT_RELATION_OPTIONS } from '../../student-context/index.js'

function registrationSchools(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.schools)) return payload.schools
  return []
}

export function useRegistration({
  initialPhone = '',
  auth = { registerUser, sendSMSCode },
  schoolApi = schoolAdministrationApi,
  afterRegister = async () => {}
} = {}) {
  const error = ref('')
  const msg = ref('')
  const loading = ref(false)
  const sending = ref(false)
  const schoolsLoading = ref(false)
  const schoolLoadError = ref('')
  const schoolOptions = ref([])
  const relationOptions = STUDENT_RELATION_OPTIONS
  const form = reactive({
    phone: initialPhone,
    smsCode: '',
    password: '',
    realName: '',
    schoolId: '',
    studentName: '',
    bindCode: '',
    relationType: relationOptions[0].value
  })

  async function loadSchools() {
    schoolsLoading.value = true
    schoolLoadError.value = ''
    try {
      schoolOptions.value = registrationSchools(
        await schoolApi.fetchPublicSchools({ page: 1, pageSize: 100 })
      ).filter(school => school?.id && school?.name)
      if (!schoolOptions.value.length) {
        schoolLoadError.value = '暂无可选学校，请联系平台管理员。'
      }
      if (!schoolOptions.value.some(
        school => String(school.id) === String(form.schoolId)
      )) {
        form.schoolId = ''
      }
    } catch (loadError) {
      schoolOptions.value = []
      form.schoolId = ''
      schoolLoadError.value = loadError.message || '学校列表加载失败，请稍后重试。'
    } finally {
      schoolsLoading.value = false
    }
  }

  async function sendRegisterCode() {
    if (!/^1\d{10}$/.test(form.phone)) {
      error.value = '请输入正确的手机号'
      return false
    }
    error.value = ''
    msg.value = ''
    sending.value = true
    try {
      const result = await auth.sendSMSCode({
        phone: form.phone,
        scene: 'REGISTER'
      })
      if (result.success) {
        msg.value = result.debugCode
          ? `测试验证码：${result.debugCode}`
          : '验证码已发送'
        return true
      }
      error.value = result.message || '发送失败'
      return false
    } finally {
      sending.value = false
    }
  }

  async function handleRegister() {
    error.value = ''
    msg.value = ''
    if (!form.schoolId) {
      error.value = '请选择学校'
      return false
    }
    loading.value = true
    try {
      const result = await auth.registerUser({ ...form })
      if (!result.ok) {
        error.value = result.msg || '注册失败'
        return false
      }
      await afterRegister(result)
      return true
    } finally {
      loading.value = false
    }
  }

  return {
    error,
    form,
    handleRegister,
    loadSchools,
    loading,
    msg,
    relationOptions,
    schoolLoadError,
    schoolOptions,
    schoolsLoading,
    sendRegisterCode,
    sending
  }
}
