import { reactive, ref } from 'vue'

import { countBoundGuardians } from '../../../entities/student/index.js'
import { schoolAdministrationApi } from '../../school-administration/index.js'
import {
  createGuardianBindingForm,
  isFullPhone,
  parentOptionLabel,
  parentSearchQuery
} from '../lib/rosterModel.js'
import { pageItems, schoolIdOf } from '../lib/rosterPresentation.js'

const noop = () => {}

export function useGuardianManagement({
  rows,
  resolveSchoolId,
  api = schoolAdministrationApi,
  confirm = async () => {},
  notify = { success: noop, error: noop }
}) {
  const activeStudent = ref(null)
  const guardianDialog = ref(false)
  const bindGuardianDialog = ref(false)
  const bindingGuardian = ref(false)
  const parentOptionsLoading = ref(false)
  const parentOptions = ref([])
  const bindGuardianForm = reactive(createGuardianBindingForm())
  const guardianLoading = ref(false)
  const guardianError = ref('')
  const guardians = ref([])
  const guardianPhoneRequests = new Map()

  function updateGuardianCount(studentId) {
    const guardianCount = countBoundGuardians(guardians.value)
    rows.value = rows.value.map(row => (
      String(row.id) === String(studentId) ? { ...row, guardianCount } : row
    ))
  }

  async function loadFullGuardianPhone(guardian) {
    const guardianUserId = guardian?.guardianUserId
    const responsePhone = guardian?.guardianPhone
    if (!guardianUserId) return isFullPhone(responsePhone) ? responsePhone : ''

    const cacheKey = String(guardianUserId)
    if (!guardianPhoneRequests.has(cacheKey)) {
      guardianPhoneRequests.set(cacheKey, api.getOpenUser(guardianUserId)
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

  async function openGuardians(student) {
    activeStudent.value = student
    guardianDialog.value = true
    guardianLoading.value = true
    guardianError.value = ''
    try {
      const payload = await api.listOpenStudentGuardians(student.id)
      guardians.value = await withFullGuardianPhones(payload)
      updateGuardianCount(student.id)
    } catch (error) {
      guardians.value = []
      guardianError.value = error.message || '家长数据加载失败'
    } finally {
      guardianLoading.value = false
    }
  }

  async function searchParentOptions(keyword = '') {
    if (!activeStudent.value) return
    parentOptionsLoading.value = true
    const normalizedKeyword = String(keyword || '').trim()
    try {
      const currentSchoolId = await resolveSchoolId(activeStudent.value.schoolId)
      if (!currentSchoolId) throw new Error('当前校方账号未关联学校，无法加载家长')
      const payload = await api.listOpenUsers({
        page: 1,
        pageSize: 100,
        roleCode: 'PARENT',
        schoolId: currentSchoolId,
        status: 'ACTIVE',
        ...parentSearchQuery(normalizedKeyword)
      })
      parentOptions.value = pageItems(payload).filter(parent => (
        !schoolIdOf(parent) || String(schoolIdOf(parent)) === String(currentSchoolId)
      ))
    } catch (error) {
      parentOptions.value = []
      notify.error(error.message || '家长列表加载失败')
    } finally {
      parentOptionsLoading.value = false
    }
  }

  async function openBindGuardian() {
    Object.assign(bindGuardianForm, createGuardianBindingForm())
    parentOptions.value = []
    bindGuardianDialog.value = true
    await searchParentOptions()
  }

  async function submitGuardianBinding() {
    if (!bindGuardianForm.parentId) {
      notify.error('请选择要绑定的家长')
      return
    }

    const parent = parentOptions.value.find(item => String(item.id) === String(bindGuardianForm.parentId))
    try {
      await confirm(
        `确定将家长“${parentOptionLabel(parent || { id: bindGuardianForm.parentId })}”的学生绑定覆盖为“${activeStudent.value.name}”吗？`,
        '确认覆盖绑定',
        { type: 'warning', confirmButtonText: '确认绑定', cancelButtonText: '取消' }
      )
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      notify.error(error.message || '绑定确认失败')
      return
    }

    bindingGuardian.value = true
    try {
      await api.bindOpenUserStudents(
        bindGuardianForm.parentId,
        [activeStudent.value.id],
        bindGuardianForm.relationType || undefined
      )
      guardianPhoneRequests.delete(String(bindGuardianForm.parentId))
      bindGuardianDialog.value = false
      notify.success('家长绑定成功')
      await openGuardians(activeStudent.value)
    } catch (error) {
      notify.error(error.message || '家长绑定失败')
    } finally {
      bindingGuardian.value = false
    }
  }

  async function unbindStudentGuardian(guardian) {
    try {
      await confirm('解除后，该家长将立即失去此学生的访问权限。', '解除家长绑定', {
        confirmButtonText: '确认解绑',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await api.unbindOpenStudentGuardian(activeStudent.value.id, guardian.guardianUserId)
      guardians.value = guardians.value.filter(item => item.guardianUserId !== guardian.guardianUserId)
      updateGuardianCount(activeStudent.value.id)
      notify.success('家长绑定已解除')
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') notify.error(error.message || '解绑失败')
    }
  }

  return {
    activeStudent,
    bindGuardianDialog,
    bindGuardianForm,
    bindingGuardian,
    guardianDialog,
    guardianError,
    guardianLoading,
    guardians,
    openBindGuardian,
    openGuardians,
    parentOptions,
    parentOptionsLoading,
    searchParentOptions,
    submitGuardianBinding,
    unbindStudentGuardian
  }
}
