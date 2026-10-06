import { computed, reactive, ref, watch } from 'vue'

import { schoolAdministrationApi } from '../../school-administration/index.js'
import { studentApi } from '../../student-context/index.js'
import { activityApi } from '../api/activityApi.js'
import {
  activityFileIds,
  activityPageItems,
  activityVisibilityDetails,
  availableActivityStudents,
  normalizeActivityClass,
  normalizeActivityStudent,
  retainAvailableStudentIds
} from '../lib/activityViewModel.js'

const noop = () => {}

export function useActivityPublishing({
  role,
  currentSchoolId,
  listMode,
  pagination,
  reloadActivities,
  api = activityApi,
  schoolApi = schoolAdministrationApi,
  studentsApi = studentApi,
  notify = { success: noop, error: noop, warning: noop }
}) {
  const canPublish = role === 'teacher' || role === 'school'
  const publishing = ref(false)
  const publishClassOptions = ref([])
  const publishClassesLoading = ref(false)
  const publishClassesError = ref('')
  const publishStudentOptions = ref([])
  const publishStudentsLoading = ref(false)
  const publishStudentsError = ref('')
  const publishMedia = ref([])
  const publishUploading = ref(false)
  const publishForm = reactive({
    content: '',
    visibility: role === 'school' ? 'SCHOOL' : 'CLASS',
    classId: '',
    studentIds: []
  })

  const visibilityDetails = computed(() => activityVisibilityDetails(publishForm.visibility))
  const publishVisibilityTitle = computed(() => visibilityDetails.value.title)
  const publishVisibilityDescription = computed(() => visibilityDetails.value.description)

  const publishClassPlaceholder = computed(() => {
    if (publishClassesLoading.value) return '正在加载班级...'
    if (!publishClassOptions.value.length) return role === 'teacher' ? '当前账号暂无所带班级' : '暂无可用班级'
    return role === 'teacher' ? '请选择自己所带的班级' : '请选择班级'
  })

  const publishStudentPlaceholder = computed(() => publishForm.classId
    ? '选择该班学生（可多选）'
    : '请先选择班级')

  const availableStudentOptions = computed(() => availableActivityStudents(
    publishStudentOptions.value,
    publishForm.visibility,
    publishForm.classId
  ))

  const canPublishMoment = computed(() => Boolean(
    publishForm.content.trim() || activityFileIds(publishMedia.value).length
  ))

  watch(availableStudentOptions, options => {
    publishForm.studentIds = retainAvailableStudentIds(publishForm.studentIds, options)
  })

  watch(() => publishForm.visibility, visibility => {
    if (visibility !== 'SCHOOL') return
    publishForm.classId = ''
    publishForm.studentIds = []
  })

  function normalizePublishStudent(student = {}) {
    return normalizeActivityStudent(student, { schoolScope: role === 'school' })
  }

  async function loadPublishClasses() {
    if (!canPublish) return
    publishClassesLoading.value = true
    publishClassesError.value = ''
    try {
      if (role === 'school' && !currentSchoolId.value) {
        throw new Error('当前校方账号未关联学校，无法加载班级')
      }
      const payload = role === 'teacher'
        ? await studentsApi.fetchTeacherClasses()
        : await schoolApi.fetchPublicClasses({
            schoolId: currentSchoolId.value,
            status: 'ACTIVE',
            page: 1,
            pageSize: 100
          })
      const listedClasses = role === 'school'
        ? activityPageItems(payload).filter(classItem => String(classItem.schoolId) === String(currentSchoolId.value))
        : activityPageItems(payload)
      publishClassOptions.value = listedClasses.map(normalizeActivityClass)
      if (publishForm.classId && !publishClassOptions.value.some(item => item.id === publishForm.classId)) {
        publishForm.classId = ''
      }
    } catch (error) {
      publishClassOptions.value = []
      publishForm.classId = ''
      publishClassesError.value = error.message || '班级加载失败'
    } finally {
      publishClassesLoading.value = false
    }
  }

  async function loadPublishStudents() {
    if (!canPublish) return
    publishStudentsLoading.value = true
    publishStudentsError.value = ''
    try {
      if (role === 'teacher') {
        publishStudentOptions.value = activityPageItems(await studentsApi.fetchStudents()).map(normalizePublishStudent)
        return
      }

      const firstPage = await schoolApi.listOpenStudents({ status: 'ACTIVE', page: 1, pageSize: 100 })
      const totalPages = Number(firstPage?.totalPages) || 1
      const remainingPages = totalPages > 1
        ? await Promise.all(Array.from({ length: totalPages - 1 }, (_, index) => (
            schoolApi.listOpenStudents({ status: 'ACTIVE', page: index + 2, pageSize: 100 })
          )))
        : []
      if (!currentSchoolId.value) throw new Error('当前校方账号未关联学校，无法加载学生')
      const listedStudents = [firstPage, ...remainingPages]
        .flatMap(activityPageItems)
        .filter(student => String(student.schoolId) === String(currentSchoolId.value))
      const detailedStudents = await Promise.all(listedStudents.map(async student => {
        try {
          return { ...student, ...await schoolApi.getOpenStudent(student.id) }
        } catch {
          return student
        }
      }))
      publishStudentOptions.value = detailedStudents
        .filter(student => student.status === 'ACTIVE')
        .map(normalizePublishStudent)
    } catch (error) {
      publishStudentOptions.value = []
      publishForm.studentIds = []
      publishStudentsError.value = error.message || '学生加载失败'
    } finally {
      publishStudentsLoading.value = false
    }
  }

  async function publishActivity() {
    if (publishing.value || publishUploading.value) return
    const content = publishForm.content.trim()
    const mediaFileIds = activityFileIds(publishMedia.value)
    if (!content && !mediaFileIds.length) {
      notify.warning('请填写动态内容或上传图片、视频')
      return
    }
    const visibility = role === 'school' && publishForm.visibility === 'SCHOOL' ? 'SCHOOL' : 'CLASS'
    if (visibility === 'CLASS' && !publishForm.classId) {
      notify.warning('发布动态必须选择班级')
      return
    }
    if (visibility === 'CLASS' && !publishForm.studentIds.length) {
      notify.warning('请选择关联学生')
      return
    }
    const requestBody = {
      content,
      visibility,
      ...(visibility === 'CLASS'
        ? {
            classId: Number(publishForm.classId),
            studentIds: publishForm.studentIds.map(Number).filter(Number.isFinite)
          }
        : {}),
      mediaFileIds: mediaFileIds.map(Number).filter(Number.isFinite)
    }
    publishing.value = true
    try {
      await api.createActivity(requestBody)
      publishForm.content = ''
      publishForm.studentIds = []
      publishMedia.value = []
      listMode.value = 'mine'
      pagination.page = 1
      await reloadActivities()
      notify.success('动态已发布')
    } catch (error) {
      notify.error(error.message || '动态发布失败')
    } finally {
      publishing.value = false
    }
  }

  return {
    availableStudentOptions,
    canPublish,
    canPublishMoment,
    loadPublishClasses,
    loadPublishStudents,
    publishActivity,
    publishClassesError,
    publishClassesLoading,
    publishClassOptions,
    publishClassPlaceholder,
    publishForm,
    publishing,
    publishMedia,
    publishStudentOptions,
    publishStudentPlaceholder,
    publishStudentsError,
    publishStudentsLoading,
    publishUploading,
    publishVisibilityDescription,
    publishVisibilityTitle
  }
}
