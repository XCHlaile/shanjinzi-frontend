import { computed, reactive, ref } from 'vue'

import {
  schoolMatchesPayload,
  schoolPayload,
  upsertSchoolRows
} from '../../../api/payloads/schoolPayloads.js'
import { saveBrowserFile } from '../../../shared/lib/browserDownload.js'
import { pageCount, pageItems, pageTotal } from '../../../shared/lib/pagePayload.js'
import { schoolManagementApi } from '../api/schoolManagementApi.js'
import {
  emptySchoolForm,
  schoolDirectoryQuery,
  schoolExportFilter,
  schoolForm,
  schoolPageItems
} from '../lib/schoolManagementViewModel.js'

const silentFeedback = {
  error() {},
  success() {},
  warning() {}
}

export function useSchoolManagement({
  api = schoolManagementApi,
  feedback = silentFeedback,
  saveFile = saveBrowserFile
} = {}) {
  const keyword = ref('')
  const contactName = ref('')
  const status = ref('')
  const rows = ref([])
  const loading = ref(false)
  const loadError = ref('')
  const exporting = ref(false)
  const saving = ref(false)
  const dialogVisible = ref(false)
  const editingId = ref(null)
  const form = reactive(emptySchoolForm())
  const pagination = reactive({ page: 1, pageSize: 20, total: 0, totalPages: 0 })

  const filteredRows = computed(() => rows.value)

  async function loadData() {
    loading.value = true
    loadError.value = ''
    try {
      const payload = await api.fetchSchools(schoolDirectoryQuery({
        keyword: keyword.value,
        contactName: contactName.value,
        status: status.value
      }, pagination))
      const items = pageItems(payload)
      rows.value = items
      pagination.total = pageTotal(payload, items)
      pagination.totalPages = pageCount(payload, pagination)
      return true
    } catch (error) {
      rows.value = []
      pagination.total = 0
      pagination.totalPages = 0
      loadError.value = error.message || '学校列表加载失败'
      feedback.error(loadError.value)
      return false
    } finally {
      loading.value = false
    }
  }

  async function submitSearch() {
    pagination.page = 1
    return loadData()
  }

  async function resetSearch() {
    keyword.value = ''
    contactName.value = ''
    status.value = ''
    pagination.page = 1
    return loadData()
  }

  async function changePage(page) {
    const target = Math.max(1, Number(page) || 1)
    if (target === pagination.page) return true
    pagination.page = target
    return loadData()
  }

  async function changePageSize(pageSize) {
    pagination.pageSize = Math.max(1, Number(pageSize) || 20)
    pagination.page = 1
    return loadData()
  }

  async function exportSchools() {
    exporting.value = true
    try {
      saveFile(
        await api.exportSchools(schoolExportFilter({
          keyword: keyword.value,
          status: status.value
        })),
        '学校列表.csv'
      )
      feedback.success('学校数据已导出')
      return true
    } catch (error) {
      feedback.error(error.message || '学校导出失败')
      return false
    } finally {
      exporting.value = false
    }
  }

  function openCreate() {
    editingId.value = null
    Object.assign(form, emptySchoolForm())
    dialogVisible.value = true
  }

  function openEdit(row) {
    editingId.value = row.id
    Object.assign(form, schoolForm(row))
    dialogVisible.value = true
  }

  async function recoverSavedSchool(payload, schoolId) {
    try {
      if (schoolId) {
        const school = await api.fetchSchool(schoolId)
        return schoolMatchesPayload(school, payload) ? school : null
      }
      const candidates = schoolPageItems(await api.fetchSchools({
        page: 1,
        pageSize: 100,
        name: payload.name,
        contactName: payload.contactName
      }))
      return candidates.find(school => schoolMatchesPayload(school, payload)) || null
    } catch {
      return null
    }
  }

  async function saveSchool() {
    if (!form.name.trim()) {
      feedback.error('请输入学校名称')
      return false
    }

    const payload = schoolPayload(form)
    saving.value = true
    try {
      const savedSchool = editingId.value
        ? await api.updateSchool(editingId.value, payload)
        : await api.createSchool(payload)
      rows.value = upsertSchoolRows(rows.value, savedSchool)
      feedback.success('学校已保存')
      dialogVisible.value = false
      return true
    } catch (error) {
      const savedSchool = await recoverSavedSchool(payload, editingId.value)
      if (savedSchool) {
        rows.value = upsertSchoolRows(rows.value, savedSchool)
        feedback.success('学校已保存')
        dialogVisible.value = false
        return true
      }
      feedback.error(error.message || '学校保存失败')
      return false
    } finally {
      saving.value = false
    }
  }

  async function toggleStatus(row) {
    try {
      if (row.status === 'ACTIVE') await api.disableSchool(row.id)
      else await api.enableSchool(row.id)
      feedback.success('状态已更新')
      await loadData()
      return true
    } catch (error) {
      feedback.error(error.message || '学校状态更新失败')
      return false
    }
  }

  function removeSchool(row) {
    feedback.warning(`当前接口未提供学校删除能力，无法删除“${row.name}”`)
    return false
  }

  return {
    changePage,
    changePageSize,
    contactName,
    dialogVisible,
    editingId,
    exportSchools,
    exporting,
    filteredRows,
    form,
    keyword,
    loadData,
    loadError,
    loading,
    openCreate,
    openEdit,
    pagination,
    recoverSavedSchool,
    removeSchool,
    resetSearch,
    rows,
    saveSchool,
    saving,
    status,
    submitSearch,
    toggleStatus
  }
}
