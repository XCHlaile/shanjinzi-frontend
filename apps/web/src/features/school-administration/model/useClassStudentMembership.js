import { computed, ref } from 'vue'
import { mapWithConcurrency } from '../../../../../../config/asyncRuntime.mjs'

import {
  collectAllPages,
  studentClassId,
  studentDisplayName,
  studentMatchesKeyword,
  studentOptionLabel as buildStudentOptionLabel
} from '../lib/classManagementViewModel.js'

export function useClassStudentMembership({
  activeClass,
  api,
  confirm,
  notify,
  schoolId
}) {
  const studentOptions = ref([])
  const studentClasses = ref([])
  const studentDialogVisible = ref(false)
  const studentsLoading = ref(false)
  const studentSavingId = ref(null)
  const studentKeyword = ref('')
  const studentDialogError = ref('')
  const selectedStudentId = ref(null)

  const currentClassStudents = computed(() => studentOptions.value.filter(student => (
    String(studentClassId(student)) === String(activeClass.value?.id)
    && studentMatchesKeyword(student, studentKeyword.value)
  )))

  const currentClassStudentCount = computed(() => studentOptions.value.filter(student => (
    String(studentClassId(student)) === String(activeClass.value?.id)
  )).length)

  const availableStudents = computed(() => studentOptions.value.filter(student => (
    String(studentClassId(student)) !== String(activeClass.value?.id)
  )))

  function studentOptionLabel(student = {}) {
    return buildStudentOptionLabel(student, studentClasses.value)
  }

  async function loadStudentBoard() {
    if (!schoolId.value) return
    const [listedStudents, listedClasses] = await Promise.all([
      collectAllPages(currentPage => (
        api.listOpenStudents({ schoolId: schoolId.value, page: currentPage, pageSize: 100 })
      )),
      collectAllPages(currentPage => api.fetchPublicClasses({
        schoolId: schoolId.value,
        page: currentPage,
        pageSize: 100
      }))
    ])
    const schoolStudents = listedStudents.filter(student => (
      String(student.schoolId) === String(schoolId.value)
    ))
    studentClasses.value = listedClasses.filter(classItem => (
      String(classItem.schoolId) === String(schoolId.value)
      && !['DISABLED', 'INACTIVE'].includes(classItem.status)
    ))
    const detailedStudents = await mapWithConcurrency(schoolStudents, async student => {
      try {
        return { ...student, ...await api.getOpenStudent(student.id) }
      } catch {
        return student
      }
    }, 5)
    studentOptions.value = detailedStudents.filter(student => (
      String(student.schoolId) === String(schoolId.value)
    ))
  }

  async function openStudentAssignment(item) {
    if (String(item.schoolId) !== String(schoolId.value)) return
    activeClass.value = item
    studentKeyword.value = ''
    selectedStudentId.value = null
    studentDialogError.value = ''
    studentDialogVisible.value = true
    studentsLoading.value = true
    try {
      await loadStudentBoard()
    } catch (error) {
      studentOptions.value = []
      studentClasses.value = []
      studentDialogError.value = error.message || '本校学生和班级加载失败'
    } finally {
      studentsLoading.value = false
    }
  }

  async function moveStudentToClass(student, targetClass) {
    const currentClassId = studentClassId(student)
    if (!student?.id || !targetClass?.id || studentSavingId.value !== null) return
    if (String(currentClassId) === String(targetClass.id)) return
    if (String(student.schoolId) !== String(schoolId.value)
      || String(targetClass.schoolId) !== String(schoolId.value)
      || !studentClasses.value.some(item => String(item.id) === String(targetClass.id))) {
      studentDialogError.value = '学生或目标班级不属于当前学校'
      return
    }
    const currentClass = studentClasses.value.find(
      item => String(item.id) === String(currentClassId)
    )
    try {
      await confirm(
        `确定将“${studentDisplayName(student)}”${currentClass ? `从“${currentClass.name}”` : ''}调整到“${targetClass.name}”吗？`,
        '确认调整班级',
        {
          confirmButtonText: '确认调整',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    } catch (action) {
      if (action === 'cancel' || action === 'close') return
      studentDialogError.value = action?.message || '班级调整确认失败'
      return
    }

    studentSavingId.value = student.id
    studentDialogError.value = ''
    try {
      await api.setOpenStudentClass(student.id, targetClass.id)
      const detail = await api.getOpenStudent(student.id)
      if (String(detail?.schoolId) !== String(schoolId.value)
        || String(studentClassId(detail)) !== String(targetClass.id)) {
        throw new Error('接口返回成功，但重新查询后学生班级尚未生效，请联系后端检查。')
      }
      studentOptions.value = studentOptions.value.map(item => (
        String(item.id) === String(student.id)
          ? { ...item, classId: null, primaryClass: null, classes: [], ...detail }
          : item
      ))
      selectedStudentId.value = null
      notify.success(`${studentDisplayName(student)}已调整到${targetClass.name}`)
    } catch (error) {
      studentDialogError.value = error.message || '学生班级调整失败'
    } finally {
      studentSavingId.value = null
    }
  }

  async function removeStudentFromClass(student) {
    if (!student?.id || !activeClass.value?.id || studentSavingId.value !== null) return
    if (String(student.schoolId) !== String(schoolId.value)
      || String(activeClass.value.schoolId) !== String(schoolId.value)) {
      studentDialogError.value = '学生或班级不属于当前学校'
      return
    }
    try {
      await confirm(
        `确定将“${studentDisplayName(student)}”移出“${activeClass.value.name}”吗？移出后该学生将处于未分班状态。`,
        '确认移出班级',
        {
          confirmButtonText: '确认移出',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    } catch (action) {
      if (action === 'cancel' || action === 'close') return
      studentDialogError.value = action?.message || '移出班级确认失败'
      return
    }

    studentSavingId.value = student.id
    studentDialogError.value = ''
    try {
      await api.removeOpenStudentClass(student.id)
      const detail = await api.getOpenStudent(student.id)
      if (String(detail?.schoolId) !== String(schoolId.value) || studentClassId(detail) !== null) {
        throw new Error('接口返回成功，但重新查询后学生仍有班级，请联系后端检查。')
      }
      studentOptions.value = studentOptions.value.map(item => (
        String(item.id) === String(student.id) ? { ...item, ...detail } : item
      ))
      notify.success(`${studentDisplayName(student)}已移出${activeClass.value.name}`)
    } catch (error) {
      studentDialogError.value = error.message || '学生移出班级失败'
    } finally {
      studentSavingId.value = null
    }
  }

  function addSelectedStudent() {
    const student = availableStudents.value.find(
      item => String(item.id) === String(selectedStudentId.value)
    )
    if (student && activeClass.value) {
      return moveStudentToClass(student, activeClass.value)
    }
  }

  return {
    addSelectedStudent,
    availableStudents,
    currentClassStudentCount,
    currentClassStudents,
    openStudentAssignment,
    removeStudentFromClass,
    selectedStudentId,
    studentDialogError,
    studentDialogVisible,
    studentKeyword,
    studentOptionLabel,
    studentSavingId,
    studentsLoading
  }
}
