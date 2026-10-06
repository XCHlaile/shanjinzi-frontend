import { reactive, ref } from 'vue'

import { schoolAdministrationApi } from '../../school-administration/index.js'
import { studentApi } from '../api/studentApi.js'
import {
  ACTIVE_STUDENT_BINDING_STATUSES,
  DEFAULT_STUDENT_RELATION_TYPE,
  isActiveStudentBinding,
  studentContextList
} from '../lib/studentContextViewModel.js'

const noop = () => {}

function createBindingForm() {
  return {
    schoolId: '',
    studentName: '',
    studentNo: '',
    birthday: '',
    bindCode: '',
    relationType: DEFAULT_STUDENT_RELATION_TYPE
  }
}

export function useStudentBinding({
  reloadStudents = async () => {},
  api = studentApi,
  schoolApi = schoolAdministrationApi,
  confirm = async () => {},
  notify = { success: noop, error: noop, warning: noop }
} = {}) {
  const unbindingId = ref(null)
  const bindDialogVisible = ref(false)
  const binding = ref(false)
  const bindFeedback = ref('')
  const schoolsLoading = ref(false)
  const schoolLoadError = ref('')
  const schoolOptions = ref([])
  const bindForm = reactive(createBindingForm())

  async function loadSchools() {
    schoolsLoading.value = true
    schoolLoadError.value = ''
    try {
      schoolOptions.value = studentContextList(
        await schoolApi.fetchPublicSchools({ page: 1, pageSize: 100 }),
        ['items', 'schools']
      ).filter(school => school?.id && school?.name)
      if (!schoolOptions.value.length) {
        schoolLoadError.value = '暂无可选学校，请联系平台管理员。'
      }
      const schoolIsAvailable = schoolOptions.value.some(
        school => String(school.id) === String(bindForm.schoolId)
      )
      if (!schoolIsAvailable) bindForm.schoolId = ''
    } catch (error) {
      schoolOptions.value = []
      bindForm.schoolId = ''
      schoolLoadError.value = error.message || '学校列表加载失败，请稍后重试。'
    } finally {
      schoolsLoading.value = false
    }
  }

  function resetBindForm() {
    Object.assign(bindForm, createBindingForm())
  }

  async function openBindDialog() {
    resetBindForm()
    bindDialogVisible.value = true
    if (!schoolOptions.value.length && !schoolsLoading.value) {
      await loadSchools()
    }
  }

  async function submitBinding() {
    if (binding.value) return false
    const schoolId = Number(bindForm.schoolId)
    if (!Number.isInteger(schoolId) || schoolId <= 0) {
      notify.warning('请选择学校')
      return false
    }
    if (!bindForm.studentName.trim()) {
      notify.warning('请输入学生姓名')
      return false
    }
    if (!bindForm.bindCode.trim()) {
      notify.warning('请输入绑定码')
      return false
    }
    if (!bindForm.relationType) {
      notify.warning('请选择亲属关系')
      return false
    }

    binding.value = true
    bindFeedback.value = ''
    try {
      const result = await api.bindGuardian({
        schoolId,
        studentName: bindForm.studentName.trim(),
        studentNo: bindForm.studentNo.trim() || undefined,
        birthday: bindForm.birthday || undefined,
        bindCode: bindForm.bindCode.trim(),
        relationType: bindForm.relationType
      })
      const bindStatus = String(result?.bindStatus || result?.status || '').toUpperCase()
      const isActive = ACTIVE_STUDENT_BINDING_STATUSES.has(bindStatus)
      bindDialogVisible.value = false
      bindFeedback.value = isActive
        ? ''
        : '绑定申请已提交，如需学校审核，请审核通过后刷新页面。'
      notify.success(isActive ? '学生绑定成功' : '绑定申请已提交')
      await reloadStudents()
      return true
    } catch (error) {
      notify.error(error.message || '学生绑定失败')
      return false
    } finally {
      binding.value = false
    }
  }

  async function unbindStudent(student) {
    if (
      !student.bindingId
      || !isActiveStudentBinding(student)
      || unbindingId.value
    ) {
      return false
    }
    try {
      await confirm(
        `解除与“${student.name}”的绑定后，将立即失去该学生的档案、动态和报名访问权限。`,
        '确认解除绑定',
        {
          confirmButtonText: '确认解绑',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      unbindingId.value = student.bindingId
      await api.unbindGuardian(student.bindingId)
      notify.success('学生绑定已解除')
      await reloadStudents()
      return true
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        notify.error(error.message || '解除绑定失败')
      }
      return false
    } finally {
      unbindingId.value = null
    }
  }

  return {
    bindDialogVisible,
    bindFeedback,
    bindForm,
    binding,
    loadSchools,
    openBindDialog,
    resetBindForm,
    schoolLoadError,
    schoolOptions,
    schoolsLoading,
    submitBinding,
    unbindStudent,
    unbindingId
  }
}
