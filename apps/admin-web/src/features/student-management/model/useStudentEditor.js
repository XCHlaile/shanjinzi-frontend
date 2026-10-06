import { reactive, ref } from 'vue'

import { buildStudentUpdatePayload } from '../../../api/adminApi.js'
import { pageItems, pageTotal } from '../../../entities/student/index.js'
import {
  emptyStudentForm,
  queryValue,
  studentCreatePayload,
  studentFormValues
} from '../lib/studentManagementViewModel.js'

export function useStudentEditor({
  api,
  feedback,
  loadStudents
}) {
  const formClassOptions = ref([])
  const formClassesLoading = ref(false)
  let formClassRequestId = 0
  const formDialogVisible = ref(false)
  const saving = ref(false)
  const editingId = ref(null)
  const originalStudentForm = ref(null)
  const form = reactive(emptyStudentForm())

  function resetForm() {
    formClassRequestId += 1
    formClassOptions.value = []
    formClassesLoading.value = false
    originalStudentForm.value = null
    Object.assign(form, emptyStudentForm())
  }

  function openCreate() {
    editingId.value = null
    resetForm()
    formDialogVisible.value = true
  }

  async function loadFormClasses(selectedSchoolId) {
    const requestId = ++formClassRequestId
    formClassOptions.value = []
    if (!selectedSchoolId) {
      formClassesLoading.value = false
      return
    }

    formClassesLoading.value = true
    try {
      const firstPage = await api.fetchClasses({
        schoolId: selectedSchoolId,
        page: 1,
        pageSize: 100
      })
      const classRows = [...pageItems(firstPage)]
      const totalPages = Number(firstPage?.totalPages) || Math.ceil(pageTotal(firstPage) / 100)
      for (let page = 2; page <= totalPages; page += 1) {
        classRows.push(...pageItems(await api.fetchClasses({
          schoolId: selectedSchoolId,
          page,
          pageSize: 100
        })))
      }
      if (requestId !== formClassRequestId) return
      formClassOptions.value = classRows
        .filter(classItem => String(classItem.schoolId) === String(selectedSchoolId))
        .sort((left, right) => (Number(left.sortOrder) || 0) - (Number(right.sortOrder) || 0))
    } catch (error) {
      if (requestId !== formClassRequestId) return
      formClassOptions.value = []
      feedback.error(error?.message || '所选学校的班级加载失败')
    } finally {
      if (requestId === formClassRequestId) formClassesLoading.value = false
    }
  }

  function handleFormSchoolChange(selectedSchoolId) {
    form.classId = null
    return loadFormClasses(selectedSchoolId)
  }

  function changeStudentSchool(selectedSchoolId) {
    form.schoolId = selectedSchoolId
    return handleFormSchoolChange(selectedSchoolId)
  }

  function updateStudentForm(field, value) {
    if (Object.hasOwn(form, field)) form[field] = value
  }

  async function openEdit(row) {
    try {
      const detail = await api.fetchStudent(row.id)
      const values = studentFormValues(detail, row)
      editingId.value = detail.id
      Object.assign(form, values)
      originalStudentForm.value = { ...values }
      await loadFormClasses(values.schoolId)
      formDialogVisible.value = true
      return true
    } catch (error) {
      feedback.error(error?.message || '学生详情加载失败')
      return false
    }
  }

  async function saveStudent() {
    if (!form.name.trim()) {
      feedback.error('请输入学生姓名')
      return false
    }
    if (!editingId.value && !/^\d{11}$/.test(form.phoneNum)) {
      feedback.error('请输入 11 位数字手机号')
      return false
    }

    const updatePayload = editingId.value
      ? buildStudentUpdatePayload({
          name: form.name.trim(),
          gender: queryValue(form.gender),
          birthday: queryValue(form.birthday),
          studentNo: queryValue(form.studentNo.trim()),
          enrollmentStatus: queryValue(form.enrollmentStatus.trim())
        }, originalStudentForm.value)
      : null
    const nextClassId = queryValue(form.classId)
    const originalClassId = queryValue(originalStudentForm.value?.classId)
    const classChanged = Boolean(editingId.value)
      && String(nextClassId ?? '') !== String(originalClassId ?? '')

    if (classChanged && !nextClassId) {
      feedback.error('调整班级时请选择有效的班级')
      return false
    }
    if (editingId.value && Object.keys(updatePayload).length === 0 && !classChanged) {
      feedback.info('学生信息未发生变化')
      formDialogVisible.value = false
      return true
    }

    saving.value = true
    try {
      if (editingId.value) {
        if (Object.keys(updatePayload).length) {
          await api.updateStudent(editingId.value, updatePayload)
        }
        if (classChanged) {
          await api.setStudentClass(editingId.value, nextClassId)
        }
      } else {
        await api.createStudent(studentCreatePayload(form))
      }
      feedback.success(editingId.value ? '学生信息已更新' : '学生已新增')
      formDialogVisible.value = false
      await loadStudents({ refreshDetails: true })
      return true
    } catch (error) {
      feedback.error(error?.message || '学生保存失败')
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    changeStudentSchool,
    editingId,
    form,
    formClassesLoading,
    formClassOptions,
    formDialogVisible,
    handleFormSchoolChange,
    openCreate,
    openEdit,
    saveStudent,
    saving,
    updateStudentForm
  }
}
