import { reactive, ref } from 'vue'

import { normalizeRole } from '../../../entities/user/index.js'
import {
  getCurrentUser,
  getRole,
  refreshCurrentUser
} from '../../authentication/index.js'
import { schoolAdministrationApi } from '../api/schoolAdministrationApi.js'
import {
  classPageItems,
  schoolIdOf,
  schoolNameOf
} from '../lib/classManagementViewModel.js'

const noop = () => {}

export function useClassDirectory({
  api = schoolAdministrationApi,
  readRole = getRole,
  readCurrentUser = getCurrentUser,
  refreshUser = refreshCurrentUser,
  notify = { success: noop }
} = {}) {
  const pageSize = 20
  const rows = ref([])
  const page = ref(1)
  const total = ref(0)
  const totalPages = ref(0)
  const loading = ref(false)
  const loadError = ref('')
  const schoolId = ref(null)
  const schoolName = ref('')
  const filters = reactive({ name: '', gradeName: '' })
  const classDialogVisible = ref(false)
  const editingId = ref(null)
  const classForm = reactive({ name: '', gradeName: '', sortOrder: 0 })
  const saving = ref(false)
  const formError = ref('')
  let relatedLoader = async () => {}

  function setRelatedLoader(loader) {
    relatedLoader = typeof loader === 'function' ? loader : async () => {}
  }

  async function loadClasses() {
    if (!schoolId.value) return
    const payload = await api.fetchPublicClasses({
      schoolId: schoolId.value,
      name: filters.name || undefined,
      gradeName: filters.gradeName || undefined,
      page: page.value,
      pageSize
    })
    const listed = classPageItems(payload)
    rows.value = listed.filter(
      item => String(item.schoolId) === String(schoolId.value)
    )
    const responseWasScoped = listed.length === rows.value.length
    total.value = responseWasScoped ? Number(payload?.total ?? rows.value.length) : rows.value.length
    totalPages.value = responseWasScoped
      ? Number(payload?.totalPages ?? (rows.value.length ? 1 : 0))
      : (rows.value.length ? 1 : 0)
  }

  async function reloadAll() {
    loading.value = true
    loadError.value = ''
    try {
      await Promise.all([loadClasses(), relatedLoader()])
      return true
    } catch (error) {
      rows.value = []
      loadError.value = error.message || '本校班级加载失败'
      return false
    } finally {
      loading.value = false
    }
  }

  async function initialize() {
    if (normalizeRole(readRole()) !== 'school') {
      loadError.value = '仅校方管理员可以访问班级管理。'
      return false
    }
    let user = readCurrentUser() || {}
    try {
      user = await refreshUser() || user
    } catch {}
    schoolId.value = schoolIdOf(user)
    schoolName.value = schoolNameOf(user)
    if (!schoolId.value) {
      loadError.value = '当前校方账号未关联学校，无法管理班级。'
      return false
    }
    if (!schoolName.value) {
      try {
        const school = await api.fetchPublicSchoolDetail(schoolId.value)
        schoolName.value = school?.name || school?.schoolName || ''
      } catch {}
    }
    return reloadAll()
  }

  async function searchClasses() {
    page.value = 1
    try {
      await loadClasses()
      return true
    } catch (error) {
      loadError.value = error.message || '班级查询失败'
      return false
    }
  }

  async function resetFilters() {
    filters.name = ''
    filters.gradeName = ''
    page.value = 1
    try {
      await loadClasses()
      return true
    } catch (error) {
      loadError.value = error.message || '班级加载失败'
      return false
    }
  }

  async function changePage(nextPage) {
    page.value = nextPage
    try {
      await loadClasses()
      return true
    } catch (error) {
      loadError.value = error.message || '班级加载失败'
      return false
    }
  }

  function resetClassForm() {
    Object.assign(classForm, { name: '', gradeName: '', sortOrder: 0 })
    formError.value = ''
  }

  function openCreate() {
    editingId.value = null
    resetClassForm()
    classDialogVisible.value = true
  }

  function openEdit(item) {
    if (String(item.schoolId) !== String(schoolId.value)) return false
    editingId.value = item.id
    Object.assign(classForm, {
      name: item.name || '',
      gradeName: item.gradeName || '',
      sortOrder: item.sortOrder ?? 0
    })
    formError.value = ''
    classDialogVisible.value = true
    return true
  }

  async function saveClass() {
    if (!classForm.name.trim() || saving.value) return false
    saving.value = true
    formError.value = ''
    try {
      const payload = {
        name: classForm.name,
        gradeName: classForm.gradeName,
        sortOrder: classForm.sortOrder
      }
      const saved = editingId.value
        ? await api.updatePublicClass(editingId.value, payload)
        : await api.createPublicClass({
          ...payload,
          schoolId: schoolId.value
        })
      const savedId = saved?.id || editingId.value
      if (savedId) {
        const verified = await api.fetchPublicClassDetail(savedId)
        if (String(verified?.schoolId) !== String(schoolId.value)) {
          throw new Error('接口返回的班级不属于当前学校，已停止更新页面。')
        }
      }
      notify.success(editingId.value ? '班级信息已更新' : '班级已创建')
      classDialogVisible.value = false
      await loadClasses()
      return true
    } catch (error) {
      formError.value = error.message || '班级保存失败'
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    changePage,
    classDialogVisible,
    classForm,
    editingId,
    filters,
    formError,
    initialize,
    loadClasses,
    loadError,
    loading,
    openCreate,
    openEdit,
    page,
    reloadAll,
    resetClassForm,
    resetFilters,
    rows,
    saveClass,
    saving,
    schoolId,
    schoolName,
    searchClasses,
    setRelatedLoader,
    total,
    totalPages
  }
}
