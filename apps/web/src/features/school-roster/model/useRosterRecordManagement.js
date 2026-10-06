import { reactive, ref } from 'vue'

import { schoolAdministrationApi } from '../../school-administration/index.js'
import {
  createStudentForm,
  createUserForm,
  sortSchoolClassOptions
} from '../lib/rosterModel.js'
import {
  isEnabled,
  numericList,
  pageItems,
  schoolIdOf
} from '../lib/rosterPresentation.js'

const noop = () => {}

export function useRosterRecordManagement({
  mode,
  roleCode,
  recordLabel,
  resolveSchoolId,
  reloadRows,
  api = schoolAdministrationApi,
  confirm = async () => {},
  alert = async () => {},
  notify = { success: noop, error: noop }
}) {
  const recordDialog = ref(false)
  const editingId = ref(null)
  const saving = ref(false)
  const formError = ref('')
  const studentForm = reactive(createStudentForm())
  const userForm = reactive(createUserForm())
  const originalStudentClassId = ref('')
  const classOptions = ref([])
  const classOptionsLoading = ref(false)
  let classOptionsRequestId = 0

  function resetForms() {
    classOptionsRequestId += 1
    classOptions.value = []
    classOptionsLoading.value = false
    Object.assign(studentForm, createStudentForm())
    Object.assign(userForm, createUserForm())
    originalStudentClassId.value = ''
    formError.value = ''
  }

  async function assertSchoolScope(record, label) {
    const currentSchoolId = await resolveSchoolId()
    const recordSchoolId = schoolIdOf(record)
    if (!recordSchoolId) throw new Error(`${label}缺少学校归属，已停止操作`)
    if (String(recordSchoolId) !== String(currentSchoolId)) {
      throw new Error(`无权操作其他学校的${label}`)
    }
    return currentSchoolId
  }

  async function loadClassOptions(fallbackSchoolId) {
    const requestId = ++classOptionsRequestId
    classOptions.value = []
    classOptionsLoading.value = true
    try {
      const currentSchoolId = await resolveSchoolId(fallbackSchoolId)
      if (!currentSchoolId) throw new Error('当前校方账号未关联学校，无法加载班级')
      const firstPage = await api.fetchPublicClasses({
        schoolId: currentSchoolId,
        page: 1,
        pageSize: 100
      })
      const listedClasses = [...pageItems(firstPage)]
      const pages = Number(firstPage?.totalPages)
        || Math.ceil((Number(firstPage?.total) || listedClasses.length) / 100)
      for (let currentPage = 2; currentPage <= pages; currentPage += 1) {
        const nextPage = await api.fetchPublicClasses({
          schoolId: currentSchoolId,
          page: currentPage,
          pageSize: 100
        })
        listedClasses.push(...pageItems(nextPage))
      }
      if (requestId !== classOptionsRequestId) return
      classOptions.value = sortSchoolClassOptions(listedClasses, currentSchoolId)
    } catch (error) {
      if (requestId !== classOptionsRequestId) return
      classOptions.value = []
      formError.value = error.message || '本校班级加载失败'
    } finally {
      if (requestId === classOptionsRequestId) classOptionsLoading.value = false
    }
  }

  async function openCreate() {
    resetForms()
    editingId.value = null
    const currentSchoolId = await resolveSchoolId()
    studentForm.schoolId = currentSchoolId
    userForm.schoolId = currentSchoolId
    recordDialog.value = true
    if (mode.value === 'students') await loadClassOptions()
  }

  async function openEditStudent(student) {
    resetForms()
    formError.value = ''
    try {
      await assertSchoolScope(student, '学生')
      const detail = await api.getOpenStudent(student.id)
      await assertSchoolScope(detail, '学生详情')
      editingId.value = student.id
      Object.assign(studentForm, createStudentForm(detail))
      originalStudentClassId.value = studentForm.classId
      recordDialog.value = true
      await loadClassOptions(detail.schoolId || student.schoolId)
    } catch (error) {
      notify.error(error.message || '学生详情加载失败')
    }
  }

  async function openEditUser(account) {
    resetForms()
    try {
      await assertSchoolScope(account, '用户')
      const detail = await api.getOpenUser(account.id)
      await assertSchoolScope(detail, '用户详情')
      editingId.value = account.id
      Object.assign(userForm, createUserForm(detail))
      recordDialog.value = true
      if (mode.value === 'teachers') {
        await loadClassOptions(detail.schoolId || account.schoolId)
      }
    } catch (error) {
      notify.error(error.message || '用户详情加载失败')
    }
  }

  async function saveRecord() {
    if (saving.value) return
    saving.value = true
    formError.value = ''
    try {
      const currentSchoolId = await resolveSchoolId()
      if (mode.value === 'students') {
        studentForm.schoolId = currentSchoolId
        if (editingId.value) {
          const classChanged = String(studentForm.classId || '') !== String(originalStudentClassId.value || '')
          if (classChanged) {
            if (!studentForm.classId) throw new Error('调整班级时请选择有效班级')
            if (!classOptions.value.some(item => String(item.id) === String(studentForm.classId))) {
              throw new Error('无权将学生分配到其他学校的班级')
            }
          }
          await api.updateOpenStudent(editingId.value, studentForm)
          if (classChanged) {
            await api.setOpenStudentClass(editingId.value, studentForm.classId)
          }
        } else {
          await api.createOpenStudent(studentForm)
        }
      } else if (editingId.value) {
        userForm.schoolId = currentSchoolId
        let classIds = []
        if (mode.value === 'teachers') {
          classIds = numericList(userForm.classIds)
          if (classIds.some(classId => !classOptions.value.some(item => String(item.id) === String(classId)))) {
            throw new Error('无权为教师分配其他学校的班级')
          }
        }
        await api.updateOpenUser(editingId.value, userForm)
        if (mode.value === 'teachers') {
          await api.updateOpenUserClasses(editingId.value, classIds)
        }
      } else {
        userForm.schoolId = currentSchoolId
        const result = await api.createOpenUser({ ...userForm, roleCode: roleCode.value })
        if (result?.temporaryPassword) {
          await alert(`临时密码：${result.temporaryPassword}`, '用户创建成功', {
            confirmButtonText: '我已记录'
          })
        }
      }
      recordDialog.value = false
      await reloadRows({ refreshDetails: true })
      notify.success(`${recordLabel.value}已保存`)
    } catch (error) {
      formError.value = error.message || '保存失败'
    } finally {
      saving.value = false
    }
  }

  async function toggleStudentStatus(student) {
    const enabling = !isEnabled(student.status)
    try {
      await assertSchoolScope(student, '学生')
      await confirm(`确认${enabling ? '启用' : '停用'}学生“${student.name}”？`, '账号状态', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
      if (enabling) await api.enableOpenStudent(student.id)
      else await api.disableOpenStudent(student.id)
      await reloadRows({ refreshDetails: true })
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        notify.error(error.message || '状态更新失败')
      }
    }
  }

  async function toggleUserStatus(account) {
    const enabling = !isEnabled(account.status)
    try {
      await assertSchoolScope(account, '用户')
      await confirm(`确认${enabling ? '启用' : '停用'}用户“${account.realName}”？`, '账号状态', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
      if (enabling) await api.enableOpenUser(account.id)
      else await api.disableOpenUser(account.id)
      await reloadRows()
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        notify.error(error.message || '状态更新失败')
      }
    }
  }

  return {
    classOptions,
    classOptionsLoading,
    editingId,
    formError,
    loadClassOptions,
    openCreate,
    openEditStudent,
    openEditUser,
    recordDialog,
    resetForms,
    saveRecord,
    saving,
    studentForm,
    toggleStudentStatus,
    toggleUserStatus,
    userForm
  }
}
