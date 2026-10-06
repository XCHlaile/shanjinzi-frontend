import { computed, reactive, ref } from 'vue'

import { normalizeAdminUser } from '../../../api/payloads/userPayloads.js'
import { pageCount, pageItems, pageTotal } from '../../../shared/lib/pagePayload.js'
import { handleAdminAuthorizationError } from '../../../shared/lib/adminAuthorization.js'
import {
  activeSchoolItems,
  userDirectoryQuery,
  userExportFilter
} from '../lib/userManagementViewModel.js'

export function useUserDirectory({
  api,
  feedback,
  onUnauthorized,
  saveFile
}) {
  const keyword = ref('')
  const role = ref('')
  const status = ref('')
  const rows = ref([])
  const schools = ref([])
  const loading = ref(false)
  const loadError = ref('')
  const exporting = ref(false)
  const pagination = reactive({ page: 1, pageSize: 20, total: 0, totalPages: 0 })

  const filteredRows = computed(() => rows.value)

  function handleAdminActionError(error) {
    return handleAdminAuthorizationError(error, { feedback, onUnauthorized })
  }

  function reportActionError(error, fallbackMessage) {
    if (handleAdminActionError(error)) return
    feedback.error(error?.message || fallbackMessage)
  }

  async function loadSchoolOptions() {
    const firstPage = await api.fetchSchools({ page: 1, pageSize: 100 })
    const allSchools = [...pageItems(firstPage)]
    const totalPages = pageCount(firstPage, {
      pageSize: 100,
      total: pageTotal(firstPage, allSchools)
    })
    for (let page = 2; page <= totalPages; page += 1) {
      allSchools.push(...pageItems(await api.fetchSchools({ page, pageSize: 100 })))
    }
    schools.value = activeSchoolItems(allSchools)
  }

  async function loadUserPage() {
    const payload = await api.fetchUsers(userDirectoryQuery({
      keyword: keyword.value,
      role: role.value,
      status: status.value
    }, pagination))
    const items = pageItems(payload)
    rows.value = items.map(normalizeAdminUser)
    pagination.total = pageTotal(payload, items)
    pagination.totalPages = pageCount(payload, pagination)
  }

  async function loadData({ includeSchools = schools.value.length === 0 } = {}) {
    loading.value = true
    loadError.value = ''
    try {
      const [usersResult, schoolsResult] = await Promise.allSettled([
        loadUserPage(),
        includeSchools ? loadSchoolOptions() : Promise.resolve()
      ])
      if (usersResult.status === 'rejected') throw usersResult.reason

      if (schoolsResult.status === 'rejected') {
        schools.value = []
        feedback.warning('学校选项加载失败，用户列表仍可正常查看')
      }
      return true
    } catch (error) {
      rows.value = []
      pagination.total = 0
      pagination.totalPages = 0
      loadError.value = error?.message || '用户列表加载失败'
      if (!handleAdminActionError(error)) feedback.error(loadError.value)
      return false
    } finally {
      loading.value = false
    }
  }

  async function submitSearch() {
    pagination.page = 1
    return loadData({ includeSchools: false })
  }

  async function resetSearch() {
    keyword.value = ''
    role.value = ''
    status.value = ''
    pagination.page = 1
    return loadData({ includeSchools: false })
  }

  async function changePage(page) {
    const target = Math.max(1, Number(page) || 1)
    if (target === pagination.page) return true
    pagination.page = target
    return loadData({ includeSchools: false })
  }

  async function changePageSize(pageSize) {
    pagination.pageSize = Math.max(1, Number(pageSize) || 20)
    pagination.page = 1
    return loadData({ includeSchools: false })
  }

  async function exportUsers() {
    exporting.value = true
    try {
      saveFile(
        await api.exportUsers(userExportFilter({
          keyword: keyword.value,
          role: role.value,
          status: status.value
        })),
        '用户列表.csv'
      )
      feedback.success('用户数据已导出')
      return true
    } catch (error) {
      reportActionError(error, '用户导出失败')
      return false
    } finally {
      exporting.value = false
    }
  }

  return {
    changePage,
    changePageSize,
    exportUsers,
    exporting,
    filteredRows,
    handleAdminActionError,
    keyword,
    loadData,
    loadError,
    loading,
    pagination,
    reportActionError,
    resetSearch,
    role,
    rows,
    schools,
    status,
    submitSearch
  }
}
