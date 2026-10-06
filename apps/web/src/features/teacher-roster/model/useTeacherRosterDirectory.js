import { computed, ref } from 'vue'

import { studentApi } from '../../student-context/index.js'
import {
  matchesTeacherRosterStudent,
  normalizeTeacherRosterClass,
  normalizeTeacherRosterStudent,
  studentBelongsToTeacherClasses,
  teacherRosterItems
} from '../lib/teacherRosterViewModel.js'

export function useTeacherRosterDirectory({ api = studentApi } = {}) {
  const keyword = ref('')
  const students = ref([])
  const teacherClasses = ref([])
  const activeClassId = ref('')
  const loading = ref(false)
  const loadError = ref('')

  const selectedClass = computed(() => teacherClasses.value
    .find(item => item.id === activeClassId.value))
  const totalStudentCount = computed(() => teacherClasses.value
    .reduce((total, item) => total + item.studentCount, 0))
  const emptyStudentMessage = computed(() => selectedClass.value
    ? `${selectedClass.value.name}暂无学生`
    : '当前教师所带班级暂无学生')
  const filteredStudents = computed(() => students.value.filter(student => (
    matchesTeacherRosterStudent(student, {
      activeClassId: activeClassId.value,
      keyword: keyword.value
    })
  )))

  async function loadRoster() {
    loading.value = true
    loadError.value = ''
    try {
      const [classPayload, studentPayload] = await Promise.all([
        api.fetchTeacherClasses(),
        api.fetchStudents()
      ])
      const classList = teacherRosterItems(classPayload, 'classes')
      const studentList = teacherRosterItems(studentPayload, 'students')
      teacherClasses.value = classList.map(normalizeTeacherRosterClass)
      const assignedClassIds = teacherClasses.value.map(item => item.id)
      students.value = studentList
        .map(normalizeTeacherRosterStudent)
        .filter(student => studentBelongsToTeacherClasses(student, assignedClassIds))
      if (
        activeClassId.value !== ''
        && !teacherClasses.value.some(item => item.id === activeClassId.value)
      ) {
        activeClassId.value = ''
      }
    } catch (error) {
      teacherClasses.value = []
      students.value = []
      loadError.value = error.message || '教师班级与学生加载失败'
    } finally {
      loading.value = false
    }
  }

  return {
    activeClassId,
    emptyStudentMessage,
    filteredStudents,
    keyword,
    loadError,
    loading,
    loadRoster,
    students,
    teacherClasses,
    totalStudentCount
  }
}
