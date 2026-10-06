import { computed, ref } from 'vue'
import { mapWithConcurrency } from '../../../../../../config/asyncRuntime.mjs'

import {
  collectAllPages,
  sameIdSet,
  schoolIdOf,
  teacherBelongsToClass,
  teacherMatchesKeyword
} from '../lib/classManagementViewModel.js'

export function useClassTeacherMembership({
  activeClass,
  api,
  notify,
  schoolId
}) {
  const teacherOptions = ref([])
  const teacherDialogVisible = ref(false)
  const teachersLoading = ref(false)
  const teachersSaving = ref(false)
  const teacherKeyword = ref('')
  const selectedTeacherIds = ref([])
  const teacherDialogError = ref('')

  const filteredTeachers = computed(() => teacherOptions.value.filter(teacher => (
    teacherMatchesKeyword(teacher, teacherKeyword.value)
  )))

  function teachersForClass(classId) {
    return teacherOptions.value.filter(
      teacher => teacherBelongsToClass(teacher, classId)
    )
  }

  async function loadTeacherOptions() {
    if (!schoolId.value) return []
    const teacherRows = await collectAllPages(currentPage => api.listOpenUsers({
      roleCode: 'TEACHER',
      schoolId: schoolId.value,
      page: currentPage,
      pageSize: 100
    }))
    const details = await mapWithConcurrency(teacherRows, async teacher => {
      try {
        return { ...teacher, ...await api.getOpenUser(teacher.id) }
      } catch {
        return teacher
      }
    }, 5)
    teacherOptions.value = details.filter(teacher => (
      String(schoolIdOf(teacher)) === String(schoolId.value)
    ))
    return teacherOptions.value
  }

  async function openTeacherAssignment(item) {
    if (String(item.schoolId) !== String(schoolId.value)) return
    activeClass.value = item
    teacherKeyword.value = ''
    teacherDialogError.value = ''
    teacherDialogVisible.value = true
    teachersLoading.value = true
    try {
      const teachers = await loadTeacherOptions()
      selectedTeacherIds.value = teachers
        .filter(teacher => teacherBelongsToClass(teacher, item.id))
        .map(teacher => teacher.id)
    } catch (error) {
      teacherDialogError.value = error.message || '本校教师加载失败'
    } finally {
      teachersLoading.value = false
    }
  }

  async function saveTeachers() {
    if (!activeClass.value?.id || teachersSaving.value) return
    teachersSaving.value = true
    teacherDialogError.value = ''
    try {
      const expected = [...selectedTeacherIds.value]
      if (String(activeClass.value.schoolId) !== String(schoolId.value)) {
        throw new Error('无权修改其他学校班级')
      }
      const allowedTeacherIds = new Set(teacherOptions.value.map(teacher => String(teacher.id)))
      if (expected.some(id => !allowedTeacherIds.has(String(id)))) {
        throw new Error('所选教师不属于当前学校')
      }
      await api.assignPublicClassTeachers(activeClass.value.id, expected)
      const refreshedTeachers = await loadTeacherOptions()
      const actual = refreshedTeachers
        .filter(teacher => teacherBelongsToClass(teacher, activeClass.value.id))
        .map(teacher => teacher.id)
      if (!sameIdSet(expected, actual)) {
        throw new Error('接口返回成功，但重新查询后教师分配尚未生效，请联系后端检查。')
      }
      notify.success('班级教师分配已保存')
      teacherDialogVisible.value = false
    } catch (error) {
      teacherDialogError.value = error.message || '班级教师分配失败'
    } finally {
      teachersSaving.value = false
    }
  }

  return {
    filteredTeachers,
    loadTeacherOptions,
    openTeacherAssignment,
    saveTeachers,
    selectedTeacherIds,
    teacherDialogError,
    teacherDialogVisible,
    teacherKeyword,
    teacherOptions,
    teachersForClass,
    teachersLoading,
    teachersSaving
  }
}
