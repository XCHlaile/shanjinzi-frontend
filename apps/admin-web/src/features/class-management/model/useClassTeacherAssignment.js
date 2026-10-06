import { ref } from 'vue'
import { mapWithConcurrency } from '../../../../../../config/asyncRuntime.mjs'

import { normalizeAdminUser } from '../../../api/payloads/userPayloads.js'
import {
  classTeacherNames as formatClassTeacherNames,
  collectAllPages,
  mergeTeachers,
  teacherBelongsToClass
} from '../lib/classManagementViewModel.js'

export function useClassTeacherAssignment({
  activeClass,
  api,
  feedback,
  handleAdminError
}) {
  const teachersDialogVisible = ref(false)
  const teachersLoading = ref(false)
  const teachersSaving = ref(false)
  const teacherOptions = ref([])
  const selectedTeacherIds = ref([])
  const classTeachers = ref({})
  const teacherRequestVersion = ref(0)

  async function loadTeacherDetailsForSchool(schoolId) {
    const teacherRows = await collectAllPages(page => api.fetchTeachers({
      roleCode: 'TEACHER',
      schoolId,
      page,
      pageSize: 100
    }))
    return mapWithConcurrency(teacherRows, async teacherRow => {
      const detail = await api.fetchTeacher(teacherRow.id)
      return normalizeAdminUser({ ...teacherRow, ...detail })
    }, 5)
  }

  async function loadTeacherSummaries(classRows) {
    const requestVersion = teacherRequestVersion.value + 1
    teacherRequestVersion.value = requestVersion
    classTeachers.value = {}
    const schoolIds = [
      ...new Set(classRows.map(classRow => classRow.schoolId).filter(Boolean))
    ]
    const schoolTeachers = await Promise.all(schoolIds.map(async schoolId => {
      try {
        return [String(schoolId), await loadTeacherDetailsForSchool(schoolId)]
      } catch {
        return [String(schoolId), null]
      }
    }))
    if (requestVersion !== teacherRequestVersion.value) return
    const teachersBySchool = Object.fromEntries(schoolTeachers)
    classTeachers.value = Object.fromEntries(classRows.map(classRow => {
      const teachers = teachersBySchool[String(classRow.schoolId)]
      return [
        String(classRow.id),
        teachers === null
          ? null
          : teachers.filter(teacher => (
            teacherBelongsToClass(teacher, classRow.id)
          ))
      ]
    }))
  }

  async function openTeachers(row) {
    activeClass.value = { ...row }
    teacherOptions.value = []
    selectedTeacherIds.value = []
    teachersDialogVisible.value = true
    teachersLoading.value = true
    try {
      const detail = await api.fetchClass(row.id)
      activeClass.value = detail
      const allTeachers = await loadTeacherDetailsForSchool(detail.schoolId)
      const assignedTeachers = allTeachers.filter(teacher => (
        teacherBelongsToClass(teacher, detail.id)
      ))
      teacherOptions.value = mergeTeachers(allTeachers)
      selectedTeacherIds.value = assignedTeachers
        .map(teacher => teacher.id)
        .filter(Boolean)
      return true
    } catch (error) {
      teachersDialogVisible.value = false
      handleAdminError(error, '班级教师加载失败')
      return false
    } finally {
      teachersLoading.value = false
    }
  }

  async function saveTeachers() {
    if (!activeClass.value?.id) return false
    teachersSaving.value = true
    try {
      await api.assignClassTeachers(
        activeClass.value.id,
        selectedTeacherIds.value
      )
      const selectedIds = new Set(selectedTeacherIds.value.map(String))
      classTeachers.value = {
        ...classTeachers.value,
        [String(activeClass.value.id)]: teacherOptions.value.filter(teacher => (
          selectedIds.has(String(teacher.id))
        ))
      }
      feedback.success('班级教师分配已保存')
      teachersDialogVisible.value = false
      return true
    } catch (error) {
      handleAdminError(error, '班级教师分配保存失败')
      return false
    } finally {
      teachersSaving.value = false
    }
  }

  function classTeacherNames(classId) {
    return formatClassTeacherNames(classTeachers.value[String(classId)])
  }

  return {
    classTeacherNames,
    classTeachers,
    loadTeacherDetailsForSchool,
    loadTeacherSummaries,
    openTeachers,
    saveTeachers,
    selectedTeacherIds,
    teacherOptions,
    teacherRequestVersion,
    teachersDialogVisible,
    teachersLoading,
    teachersSaving
  }
}
