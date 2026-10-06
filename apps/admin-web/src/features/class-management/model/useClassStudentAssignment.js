import { computed, ref } from 'vue'
import { mapWithConcurrency } from '../../../../../../config/asyncRuntime.mjs'

import {
  availableStudents as filterAvailableStudents,
  classStudents as filterClassStudents,
  collectAllPages,
  isClassDialogCancel,
  studentClassIds,
  studentWithClassDetail,
  transferClassOptions as filterTransferClassOptions
} from '../lib/classManagementViewModel.js'

export function useClassStudentAssignment({
  activeClass,
  api,
  dialogs,
  feedback,
  handleAdminError
}) {
  const studentsDialogVisible = ref(false)
  const studentsLoading = ref(false)
  const studentSaving = ref(false)
  const allSchoolStudents = ref([])
  const activeSchoolClasses = ref([])
  const selectedStudentId = ref(null)
  const transferDialogVisible = ref(false)
  const transferStudent = ref(null)
  const targetClassId = ref(null)

  const classStudents = computed(() => filterClassStudents(
    allSchoolStudents.value,
    activeClass.value?.id
  ))
  const availableStudents = computed(() => filterAvailableStudents(
    allSchoolStudents.value,
    activeClass.value?.id
  ))
  const transferClassOptions = computed(() => filterTransferClassOptions(
    activeSchoolClasses.value,
    activeClass.value?.id
  ))

  async function loadStudentClassDetail(student) {
    const detail = await api.fetchStudent(student.id)
    return studentWithClassDetail(student, detail)
  }

  async function loadStudentsForActiveClass() {
    if (!activeClass.value?.id) return false
    const schoolId = activeClass.value.schoolId
    const [students, classOptions] = await Promise.all([
      collectAllPages(page => api.fetchStudents({ page, pageSize: 100 })),
      collectAllPages(page => api.fetchClasses({
        schoolId,
        status: 'ACTIVE',
        page,
        pageSize: 100
      }))
    ])
    const schoolStudents = students.filter(student => (
      String(student.schoolId) === String(schoolId)
    ))
    allSchoolStudents.value = await mapWithConcurrency(schoolStudents, loadStudentClassDetail, 5)
    activeSchoolClasses.value = classOptions.filter(classOption => (
      classOption.status === 'ACTIVE'
      && String(classOption.schoolId) === String(schoolId)
    ))
    return true
  }

  async function openStudents(row) {
    activeClass.value = { ...row }
    selectedStudentId.value = null
    allSchoolStudents.value = []
    activeSchoolClasses.value = []
    studentsDialogVisible.value = true
    studentsLoading.value = true
    try {
      await loadStudentsForActiveClass()
      return true
    } catch (error) {
      studentsDialogVisible.value = false
      handleAdminError(error, '班级学生加载失败')
      return false
    } finally {
      studentsLoading.value = false
    }
  }

  async function assertStudentClassAssignment(studentId, classId) {
    const detail = await api.fetchStudent(studentId)
    const saved = studentClassIds(detail)
      .some(savedClassId => String(savedClassId) === String(classId))
    if (!saved) {
      throw new Error('接口返回成功，但学生班级归属未保存，请检查后端班级设置接口')
    }
  }

  async function addStudentToClass() {
    const student = allSchoolStudents.value.find(item => (
      String(item.id) === String(selectedStudentId.value)
    ))
    if (!student || !activeClass.value?.id) return false
    const actionText = student.classId
      ? `学生“${student.name}”当前在“${student.className || `班级 ${student.classId}`}”，确认转入“${activeClass.value.name}”吗？`
      : `确认将学生“${student.name}”添加到“${activeClass.value.name}”吗？`
    try {
      await dialogs.confirm(actionText, '添加/转入学生', {
        type: 'warning',
        confirmButtonText: '确认转入',
        cancelButtonText: '取消'
      })
      studentSaving.value = true
      await api.setStudentClass(student.id, activeClass.value.id)
      await assertStudentClassAssignment(student.id, activeClass.value.id)
      selectedStudentId.value = null
      await loadStudentsForActiveClass()
      feedback.success('学生已转入本班')
      return true
    } catch (error) {
      if (!isClassDialogCancel(error)) {
        handleAdminError(error, '学生转入失败')
      }
      return false
    } finally {
      studentSaving.value = false
    }
  }

  function openTransferStudent(student) {
    if (!transferClassOptions.value.length) {
      feedback.warning('当前学校没有可转入的其他启用班级')
      return false
    }
    transferStudent.value = student
    targetClassId.value = null
    transferDialogVisible.value = true
    return true
  }

  async function transferStudentToClass() {
    if (!transferStudent.value?.id || !targetClassId.value) return false
    const targetClass = transferClassOptions.value.find(item => (
      String(item.id) === String(targetClassId.value)
    ))
    studentSaving.value = true
    try {
      await api.setStudentClass(
        transferStudent.value.id,
        targetClassId.value
      )
      await assertStudentClassAssignment(
        transferStudent.value.id,
        targetClassId.value
      )
      transferDialogVisible.value = false
      await loadStudentsForActiveClass()
      feedback.success(
        `学生已转入“${targetClass?.name || `班级 ${targetClassId.value}`}”`
      )
      return true
    } catch (error) {
      handleAdminError(error, '学生转出失败')
      return false
    } finally {
      studentSaving.value = false
    }
  }

  return {
    activeSchoolClasses,
    addStudentToClass,
    allSchoolStudents,
    assertStudentClassAssignment,
    availableStudents,
    classStudents,
    loadStudentClassDetail,
    loadStudentsForActiveClass,
    openStudents,
    openTransferStudent,
    selectedStudentId,
    studentSaving,
    studentsDialogVisible,
    studentsLoading,
    targetClassId,
    transferClassOptions,
    transferDialogVisible,
    transferStudent,
    transferStudentToClass
  }
}
