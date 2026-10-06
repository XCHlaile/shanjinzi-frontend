import { reactive, ref } from 'vue'

import { countBoundGuardians } from '../../../api/payloads/studentPayloads.js'
import { pageItems } from '../../../entities/student/index.js'
import {
  isFullPhone,
  parentOptionLabel,
  queryValue
} from '../lib/studentManagementViewModel.js'

export function useStudentRelationships({
  api,
  dialogs,
  feedback,
  loadStudents,
  rows
}) {
  const activeStudent = ref(null)
  const guardianPhoneRequests = new Map()
  const guardiansDialogVisible = ref(false)
  const guardiansLoading = ref(false)
  const guardians = ref([])
  const bindGuardianDialogVisible = ref(false)
  const bindingGuardian = ref(false)
  const parentOptionsLoading = ref(false)
  const parentOptions = ref([])
  const bindGuardianForm = reactive({ parentId: null, relationType: '' })
  const profileDialogVisible = ref(false)
  const profileLoading = ref(false)
  const profileEvents = ref([])

  async function loadFullGuardianPhone(guardian) {
    const guardianUserId = guardian?.guardianUserId
    const responsePhone = guardian?.guardianPhone
    if (!guardianUserId) return isFullPhone(responsePhone) ? responsePhone : ''

    const cacheKey = String(guardianUserId)
    if (!guardianPhoneRequests.has(cacheKey)) {
      guardianPhoneRequests.set(cacheKey, api.fetchUser(guardianUserId)
        .then(user => {
          const phone = user?.phone || user?.phoneNum || ''
          return isFullPhone(phone) ? phone : ''
        })
        .catch(() => (isFullPhone(responsePhone) ? responsePhone : '')))
    }
    return guardianPhoneRequests.get(cacheKey)
  }

  async function withFullGuardianPhones(payload) {
    return Promise.all(pageItems(payload).map(async guardian => ({
      ...guardian,
      guardianPhone: await loadFullGuardianPhone(guardian)
    })))
  }

  async function openGuardians(row) {
    activeStudent.value = row
    guardians.value = []
    guardiansDialogVisible.value = true
    guardiansLoading.value = true
    try {
      const payload = await api.fetchGuardians(row.id)
      guardians.value = await withFullGuardianPhones(payload)
      const guardianCount = countBoundGuardians(payload)
      rows.value = rows.value.map(student => (
        String(student.id) === String(row.id) ? { ...student, guardianCount } : student
      ))
      return true
    } catch (error) {
      feedback.error(error?.message || '家长信息加载失败')
      return false
    } finally {
      guardiansLoading.value = false
    }
  }

  async function searchParentOptions(keyword = '') {
    if (!activeStudent.value) return
    parentOptionsLoading.value = true
    const normalizedKeyword = String(keyword || '').trim()
    try {
      const payload = await api.fetchParents({
        page: 1,
        pageSize: 100,
        roleCode: 'PARENT',
        schoolId: queryValue(activeStudent.value.schoolId),
        status: 'ACTIVE',
        realName: normalizedKeyword && !/^\d+$/.test(normalizedKeyword)
          ? normalizedKeyword
          : undefined,
        phone: /^\d+$/.test(normalizedKeyword) ? normalizedKeyword : undefined
      })
      parentOptions.value = pageItems(payload).filter(parent => (
        !activeStudent.value.schoolId
        || String(parent.schoolId) === String(activeStudent.value.schoolId)
      ))
    } catch (error) {
      parentOptions.value = []
      feedback.error(error?.message || '家长列表加载失败')
    } finally {
      parentOptionsLoading.value = false
    }
  }

  async function openBindGuardian(row) {
    activeStudent.value = row
    Object.assign(bindGuardianForm, { parentId: null, relationType: '' })
    parentOptions.value = []
    bindGuardianDialogVisible.value = true
    await searchParentOptions()
  }

  function updateGuardianBinding(field, value) {
    if (Object.hasOwn(bindGuardianForm, field)) bindGuardianForm[field] = value
  }

  async function submitGuardianBinding() {
    if (!bindGuardianForm.parentId) {
      feedback.error('请选择要绑定的家长')
      return false
    }

    const parent = parentOptions.value.find(
      item => String(item.id) === String(bindGuardianForm.parentId)
    )
    try {
      await dialogs.confirm(
        `确定将家长“${parentOptionLabel(parent || { id: bindGuardianForm.parentId })}”的学生绑定覆盖为“${activeStudent.value.name}”吗？`,
        '确认覆盖绑定',
        { type: 'warning', confirmButtonText: '确认绑定' }
      )
    } catch {
      return false
    }

    bindingGuardian.value = true
    try {
      await api.bindParentStudents(
        bindGuardianForm.parentId,
        [activeStudent.value.id],
        bindGuardianForm.relationType || undefined
      )
      feedback.success('家长绑定成功')
      bindGuardianDialogVisible.value = false
      await loadStudents({ refreshDetails: true })
      return true
    } catch (error) {
      feedback.error(error?.message || '家长绑定失败')
      return false
    } finally {
      bindingGuardian.value = false
    }
  }

  async function unbindGuardian(guardian) {
    try {
      await dialogs.confirm(
        `确定解除家长“${guardian.guardianName || guardian.guardianPhone || guardian.guardianUserId}”的绑定吗？`,
        '解除家长绑定',
        { type: 'warning' }
      )
    } catch {
      return false
    }

    try {
      await api.unbindGuardian(activeStudent.value.id, guardian.guardianUserId)
      feedback.success('家长绑定已解除')
      await openGuardians(activeStudent.value)
      await loadStudents({ refreshDetails: true })
      return true
    } catch (error) {
      feedback.error(error?.message || '解除家长绑定失败')
      return false
    }
  }

  async function openProfile(row) {
    activeStudent.value = row
    profileEvents.value = []
    profileDialogVisible.value = true
    profileLoading.value = true
    try {
      profileEvents.value = pageItems(await api.fetchProfile(row.id))
      return true
    } catch (error) {
      feedback.error(error?.message || '成长档案加载失败')
      return false
    } finally {
      profileLoading.value = false
    }
  }

  return {
    activeStudent,
    bindGuardianDialogVisible,
    bindGuardianForm,
    bindingGuardian,
    guardians,
    guardiansDialogVisible,
    guardiansLoading,
    loadFullGuardianPhone,
    openBindGuardian,
    openGuardians,
    openProfile,
    parentOptions,
    parentOptionsLoading,
    profileDialogVisible,
    profileEvents,
    profileLoading,
    searchParentOptions,
    submitGuardianBinding,
    unbindGuardian,
    updateGuardianBinding,
    withFullGuardianPhones
  }
}
