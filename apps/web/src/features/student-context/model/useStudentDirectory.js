import { ref } from 'vue'

import { studentApi } from '../api/studentApi.js'
import {
  isActiveStudentBinding,
  mergeBoundStudents,
  normalizeContextStudent,
  studentContextList
} from '../lib/studentContextViewModel.js'
import {
  clearCurrentStudent,
  getCurrentStudent,
  setCurrentStudent
} from './currentStudent.js'

export function useStudentDirectory({
  api = studentApi,
  readCurrentStudent = getCurrentStudent,
  persistCurrentStudent = setCurrentStudent,
  removeCurrentStudent = clearCurrentStudent
} = {}) {
  const students = ref([])
  const current = ref(readCurrentStudent())
  const loading = ref(true)
  const error = ref('')

  function setCurrentFromList(list) {
    if (!list.length) {
      current.value = null
      removeCurrentStudent()
      return
    }
    const storedId = current.value?.id
      || current.value?.studentId
      || current.value?.currentStudentId
    const storedKey = storedId ? String(storedId) : ''
    const next = list.find(student => String(student.id) === storedKey) || list[0]
    current.value = next
    persistCurrentStudent(next)
  }

  function applyStudentPayloads([studentPayload, bindingPayload]) {
    const studentList = studentContextList(studentPayload, ['items', 'students'])
    const bindingList = studentContextList(bindingPayload, ['items', 'bindings'])
    students.value = mergeBoundStudents(studentList, bindingList)
    setCurrentFromList(students.value)
  }

  async function loadStudents() {
    loading.value = true
    error.value = ''
    const studentRequest = api.fetchStudents()
    const bindingRequest = api.fetchGuardianBindings()
    try {
      applyStudentPayloads(await Promise.all([studentRequest, bindingRequest]))
    } catch (loadError) {
      students.value = []
      setCurrentFromList([])
      error.value = loadError.message || '绑定学生加载失败'
    } finally {
      loading.value = false
    }
  }

  async function selectStudent(student) {
    if (!isActiveStudentBinding(student)) return false
    try {
      const result = await api.switchCurrentStudent(student.id)
      const selected = normalizeContextStudent(result?.student || student)
      persistCurrentStudent(selected)
      current.value = selected
      return true
    } catch (selectionError) {
      error.value = selectionError.message || '学生上下文切换失败'
      return false
    }
  }

  return {
    applyStudentPayloads,
    current,
    error,
    loadStudents,
    loading,
    selectStudent,
    setCurrentFromList,
    students
  }
}
