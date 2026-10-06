import { reactive, ref } from 'vue'

import { schoolAdministrationApi } from '../../school-administration/index.js'
import { competitionApi } from '../api/competitionApi.js'
import {
  competitionPageItems,
  isAvailableCompetitionTeacher,
  isPositiveCompetitionId
} from '../lib/competitionViewModel.js'

export function useCompetitionRegistrationManagement({
  role,
  actionMessage,
  api = competitionApi,
  schoolApi = schoolAdministrationApi
}) {
  const registrationCompetition = ref(null)
  const registrationRows = ref([])
  const registrationsLoading = ref(false)
  const registrationsError = ref('')
  const leadTeacherId = ref('')
  const leadTeacherSaving = ref(false)
  const teacherOptions = ref([])
  const teachersLoading = ref(false)
  const teachersError = ref('')
  const registrationFilters = reactive({
    classId: '',
    startTime: '',
    endTime: ''
  })

  async function openRegistrations(item) {
    if (role !== 'school') return
    registrationCompetition.value = item
    registrationRows.value = []
    registrationsError.value = ''
    leadTeacherId.value = String(item.leadTeacherId || '')
    Object.assign(registrationFilters, {
      classId: '',
      startTime: '',
      endTime: ''
    })
    await Promise.all([loadTeachers(), loadCompetitionRegistrations()])
  }

  async function loadTeachers() {
    if (role !== 'school' || teachersLoading.value) return
    teachersLoading.value = true
    teachersError.value = ''
    try {
      const rows = competitionPageItems(await schoolApi.listOpenUsers({
        roleCode: 'TEACHER',
        page: 1,
        pageSize: 100
      }))
      teacherOptions.value = rows.filter(isAvailableCompetitionTeacher)
    } catch (error) {
      teacherOptions.value = []
      teachersError.value = error.message || '教师列表加载失败'
    } finally {
      teachersLoading.value = false
    }
  }

  async function loadCompetitionRegistrations() {
    if (!registrationCompetition.value || role !== 'school') return
    if (
      registrationFilters.classId
      && !isPositiveCompetitionId(registrationFilters.classId)
    ) {
      registrationsError.value = '班级 ID 必须是正整数'
      return
    }

    registrationsLoading.value = true
    try {
      registrationRows.value = competitionPageItems(
        await api.fetchCompetitionRegistrations(
          registrationCompetition.value.id,
          {
            classId: registrationFilters.classId || undefined,
            startTime: registrationFilters.startTime || undefined,
            endTime: registrationFilters.endTime || undefined
          }
        )
      )
      registrationsError.value = ''
    } catch (error) {
      registrationsError.value = `报名名单加载失败：${error.message || '请求失败'}`
    } finally {
      registrationsLoading.value = false
    }
  }

  async function saveLeadTeacher() {
    if (!registrationCompetition.value || leadTeacherSaving.value) return
    if (!leadTeacherId.value) {
      registrationsError.value = '请选择带队教师'
      return
    }
    if (!isPositiveCompetitionId(leadTeacherId.value)) {
      registrationsError.value = '请选择有效的带队教师'
      return
    }

    leadTeacherSaving.value = true
    try {
      await api.setCompetitionLeadTeacher(
        registrationCompetition.value.id,
        leadTeacherId.value
      )
      registrationCompetition.value.leadTeacherId = Number(leadTeacherId.value)
      actionMessage.value = `赛事“${registrationCompetition.value.name}”的带队教师已更新`
    } catch (error) {
      registrationsError.value = `带队教师设置失败：${error.message || '请求失败'}`
    } finally {
      leadTeacherSaving.value = false
    }
  }

  function closeRegistrations() {
    registrationCompetition.value = null
    registrationRows.value = []
    registrationsError.value = ''
    leadTeacherId.value = ''
    teachersError.value = ''
  }

  return {
    closeRegistrations,
    leadTeacherId,
    leadTeacherSaving,
    loadCompetitionRegistrations,
    loadTeachers,
    openRegistrations,
    registrationCompetition,
    registrationFilters,
    registrationRows,
    registrationsError,
    registrationsLoading,
    saveLeadTeacher,
    teacherOptions,
    teachersError,
    teachersLoading
  }
}
