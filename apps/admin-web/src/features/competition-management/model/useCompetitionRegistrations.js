import { computed, ref } from 'vue'

import {
  competitionPageItems,
  isCompetitionDialogCancel,
  registrationDialogTitle as buildRegistrationDialogTitle
} from '../lib/competitionManagementViewModel.js'

export function useCompetitionRegistrations({
  api,
  dialogs,
  feedback
}) {
  const registrationsDialogVisible = ref(false)
  const registrationsLoading = ref(false)
  const registrationRows = ref([])
  const registrationCompetition = ref(null)
  const registrationPage = ref(1)
  const registrationPageSize = 20
  const registrationTotal = ref(0)
  const registrationKeyword = ref('')

  const registrationDialogTitle = computed(() => (
    buildRegistrationDialogTitle(registrationCompetition.value)
  ))

  async function openRegistrations(row) {
    if (!row) return false
    registrationCompetition.value = row
    registrationPage.value = 1
    registrationTotal.value = 0
    registrationKeyword.value = ''
    registrationsDialogVisible.value = true
    return loadCompetitionRegistrations(1)
  }

  async function loadCompetitionRegistrations(
    targetPage = registrationPage.value
  ) {
    if (!registrationCompetition.value?.id) return false
    registrationPage.value = targetPage
    registrationsLoading.value = true
    try {
      const payload = await api.fetchCompetitionRegistrations(
        registrationCompetition.value.id,
        {
          page: registrationPage.value,
          pageSize: registrationPageSize,
          keyword: registrationKeyword.value.trim()
        }
      )
      registrationRows.value = competitionPageItems(payload)
      registrationTotal.value = Number(
        payload?.total ?? registrationRows.value.length
      )
      return true
    } catch (error) {
      registrationRows.value = []
      registrationTotal.value = 0
      feedback.error(error?.message || '报名明细加载失败')
      return false
    } finally {
      registrationsLoading.value = false
    }
  }

  async function openParentRegistrations() {
    let parentId
    try {
      const promptResult = await dialogs.prompt(
        '请输入家长用户 ID',
        '按家长查询报名',
        {
          inputPattern: /^[1-9]\d*$/,
          inputErrorMessage: '家长用户 ID 必须是正整数',
          inputPlaceholder: '家长用户 ID'
        }
      )
      parentId = promptResult.value
    } catch (error) {
      if (!isCompetitionDialogCancel(error)) {
        feedback.error(error?.message || '无法读取家长用户 ID')
      }
      return false
    }

    registrationCompetition.value = { title: `家长 #${parentId}` }
    registrationTotal.value = 0
    registrationsDialogVisible.value = true
    registrationsLoading.value = true
    try {
      registrationRows.value = competitionPageItems(
        await api.fetchParentRegistrations(parentId)
      )
      return true
    } catch (error) {
      registrationRows.value = []
      feedback.error(error?.message || '家长报名记录加载失败')
      return false
    } finally {
      registrationsLoading.value = false
    }
  }

  return {
    loadCompetitionRegistrations,
    openParentRegistrations,
    openRegistrations,
    registrationCompetition,
    registrationDialogTitle,
    registrationKeyword,
    registrationPage,
    registrationPageSize,
    registrationRows,
    registrationsDialogVisible,
    registrationsLoading,
    registrationTotal
  }
}
