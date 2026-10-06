import { reactive, ref } from 'vue'

import { competitionApi } from '../api/competitionApi.js'
import {
  canSignupCompetition,
  competitionSignupButtonText
} from '../lib/competitionViewModel.js'

export function useCompetitionSignup({
  currentStudent,
  user,
  actionMessage,
  reloadCompetitions,
  api = competitionApi
}) {
  const signup = ref(null)
  const signupSubmitting = ref(false)
  const signupError = ref('')
  const signupForm = reactive({
    studentName: currentStudent?.name || currentStudent?.studentName || '',
    className: currentStudent?.className || currentStudent?.primaryClass?.name || '',
    phone: user.phone || '',
    remark: ''
  })

  function canSignup(item) {
    return canSignupCompetition(item, currentStudent)
  }

  function signupButtonText(item) {
    return competitionSignupButtonText(
      item,
      currentStudent,
      signupForm.studentName
    )
  }

  function openSignup(item) {
    if (!canSignup(item)) return
    signup.value = item
    signupError.value = ''
    signupForm.studentName = currentStudent.name || currentStudent.studentName || ''
    signupForm.className = currentStudent.className
      || currentStudent.primaryClass?.name
      || ''
    signupForm.phone = user.phone || ''
    signupForm.remark = ''
  }

  function closeSignup() {
    if (signupSubmitting.value) return
    signup.value = null
    signupError.value = ''
  }

  async function submitSignup() {
    if (!signup.value || signupSubmitting.value) return
    signupSubmitting.value = true
    signupError.value = ''
    try {
      await api.registerCompetition(signup.value.id, {
        remark: signupForm.remark
      })
      signup.value = null
      actionMessage.value = '赛事报名提交成功'
      await reloadCompetitions()
    } catch (error) {
      signupError.value = error.message || '赛事报名失败'
    } finally {
      signupSubmitting.value = false
    }
  }

  return {
    canSignup,
    closeSignup,
    openSignup,
    signup,
    signupButtonText,
    signupError,
    signupForm,
    signupSubmitting,
    submitSignup
  }
}
