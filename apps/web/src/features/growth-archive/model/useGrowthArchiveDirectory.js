import { computed, ref } from 'vue'

import { schoolAdministrationApi } from '../../school-administration/index.js'
import { studentApi } from '../../student-context/index.js'
import {
  GROWTH_ARCHIVE_FILTERS,
  growthArchiveClassIds,
  growthArchiveItems,
  normalizeGrowthArchiveRecord,
  normalizeGrowthArchiveStudent,
  scopeGrowthArchiveStudentsToClasses
} from '../lib/growthArchiveViewModel.js'

export function useGrowthArchiveDirectory({
  role,
  user = {},
  currentStudent,
  initialStudentId = '',
  studentsApi = studentApi,
  schoolApi = schoolAdministrationApi
}) {
  const selectedStudentId = ref(String(initialStudentId || ''))
  const studentOptions = ref([])
  const studentOptionsLoading = ref(false)
  const studentOptionsError = ref('')
  const activeType = ref('全部')
  const rawRecords = ref([])
  const loading = ref(true)
  const error = ref('')

  const selectedStudent = computed(() => studentOptions.value
    .find(student => student.id === selectedStudentId.value))
  const archiveTitle = computed(() => role === 'parent'
    ? `${currentStudent?.name || '未选择学生'} 的成长时间线`
    : selectedStudentId.value
      ? `${selectedStudent.value?.name || `学生 #${selectedStudentId.value}`} 的成长时间线`
      : '选择学生查看成长档案')
  const archiveSubtitle = computed(() => role === 'parent'
    ? currentStudent
      ? `${currentStudent.schoolName || '-'} · ${currentStudent.className || '-'}`
      : '请先选择已绑定学生'
    : '数据来自共享接口 GET /api/public/students/{id}/profile')
  const studentSelectPlaceholder = computed(() => {
    if (studentOptionsLoading.value) return '正在加载学生...'
    if (!studentOptions.value.length) return '暂无可选学生'
    return '请选择学生'
  })
  const records = computed(() => rawRecords.value
    .map(normalizeGrowthArchiveRecord)
    .filter(record => activeType.value === '全部' || record.type === activeType.value))

  async function loadStudentOptions() {
    studentOptionsLoading.value = true
    studentOptionsError.value = ''
    try {
      let payload
      if (role === 'parent') {
        payload = await studentsApi.fetchStudents()
      } else if (role === 'teacher') {
        const [classPayload, studentPayload] = await Promise.all([
          studentsApi.fetchTeacherClasses(),
          studentsApi.fetchStudents()
        ])
        payload = scopeGrowthArchiveStudentsToClasses(
          growthArchiveItems(studentPayload),
          growthArchiveClassIds(classPayload)
        )
      } else {
        const currentSchoolId = user.schoolId || user.school?.schoolId || user.school?.id
        if (!currentSchoolId) throw new Error('当前校方账号未关联学校')
        const schoolPayload = await schoolApi.listOpenStudents({
          schoolId: currentSchoolId,
          status: 'ACTIVE',
          page: 1,
          pageSize: 100
        })
        payload = growthArchiveItems(schoolPayload).filter(student => {
          const studentSchoolId = student.schoolId || student.school?.id
          return String(studentSchoolId) === String(currentSchoolId)
        })
      }
      studentOptions.value = growthArchiveItems(payload)
        .filter(student => student.id !== undefined || student.studentId !== undefined)
        .map(normalizeGrowthArchiveStudent)
    } catch (loadError) {
      studentOptions.value = []
      studentOptionsError.value = loadError.message || '学生列表加载失败'
    } finally {
      studentOptionsLoading.value = false
    }
  }

  async function loadRecords() {
    const studentId = role === 'parent'
      ? currentStudent?.studentId ?? currentStudent?.id
      : selectedStudentId.value
    if (!studentId) {
      rawRecords.value = []
      error.value = role === 'parent' ? '请先选择已绑定学生' : ''
      loading.value = false
      return
    }
    if (!studentOptions.value.some(student => String(student.id) === String(studentId))) {
      rawRecords.value = []
      error.value = '无权查看该学生的成长档案'
      loading.value = false
      return
    }
    loading.value = true
    error.value = ''
    try {
      const payload = role === 'parent'
        ? await studentsApi.fetchGrowthRecords(studentId, { pageSize: 50 })
        : await schoolApi.getOpenStudentProfile(studentId)
      rawRecords.value = Array.isArray(payload)
        ? payload
        : payload?.items || payload?.records || payload?.growthRecords || []
    } catch (loadError) {
      error.value = loadError.message || '成长档案加载失败'
    } finally {
      loading.value = false
    }
  }

  async function initialize() {
    if (role === 'parent') {
      await loadStudentOptions()
      await loadRecords()
      return
    }
    await loadStudentOptions()
    if (selectedStudentId.value) await loadRecords()
    else loading.value = false
  }

  return {
    activeType,
    archiveSubtitle,
    archiveTitle,
    error,
    filters: GROWTH_ARCHIVE_FILTERS,
    initialize,
    loadRecords,
    loading,
    records,
    selectedStudentId,
    studentOptions,
    studentOptionsError,
    studentOptionsLoading,
    studentSelectPlaceholder
  }
}
