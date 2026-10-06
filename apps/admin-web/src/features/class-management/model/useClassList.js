import { computed, reactive, ref } from 'vue'

import { pageItems, pageTotal } from '../../../entities/student/index.js'
import {
  activeSchools,
  classExportFilter,
  classListParams,
  resolveSchoolName,
  schoolNameMap
} from '../lib/classManagementViewModel.js'

export function useClassList({
  api,
  feedback,
  handleAdminError,
  onRowsLoaded,
  saveFile
}) {
  const rows = ref([])
  const schools = ref([])
  const loading = ref(false)
  const loadError = ref('')
  const exporting = ref(false)
  const filters = reactive({
    schoolId: null,
    name: '',
    gradeName: '',
    status: ''
  })
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const schoolNames = computed(() => schoolNameMap(schools.value))

  function schoolName(schoolId) {
    return resolveSchoolName(schoolNames.value, schoolId)
  }

  function loadInitialData() {
    return Promise.all([loadSchools(), loadClasses()])
  }

  async function loadSchools() {
    try {
      schools.value = activeSchools(
        await api.fetchSchools({
          status: 'ACTIVE',
          page: 1,
          pageSize: 100
        })
      )
      return true
    } catch (error) {
      schools.value = []
      handleAdminError(error, '学校列表加载失败')
      return false
    }
  }

  async function loadClasses() {
    loading.value = true
    loadError.value = ''
    try {
      const payload = await api.fetchClasses(classListParams(filters, pagination))
      const items = pageItems(payload)
      rows.value = items
      pagination.total = pageTotal(payload, items)
      onRowsLoaded(items)
      return true
    } catch (error) {
      rows.value = []
      pagination.total = 0
      loadError.value = error?.message || '班级列表加载失败'
      handleAdminError(error, '班级列表加载失败')
      return false
    } finally {
      loading.value = false
    }
  }

  function searchClasses() {
    pagination.page = 1
    return loadClasses()
  }

  function resetFilters() {
    Object.assign(filters, {
      schoolId: null,
      name: '',
      gradeName: '',
      status: ''
    })
    pagination.page = 1
    return loadClasses()
  }

  function handlePageSizeChange() {
    pagination.page = 1
    return loadClasses()
  }

  async function exportClasses() {
    exporting.value = true
    try {
      saveFile(
        await api.exportClasses(classExportFilter(filters)),
        '班级列表.csv'
      )
      feedback.success('班级数据已导出')
      return true
    } catch (error) {
      handleAdminError(error, '班级导出失败')
      return false
    } finally {
      exporting.value = false
    }
  }

  return {
    exportClasses,
    exporting,
    filters,
    handlePageSizeChange,
    loadClasses,
    loadError,
    loading,
    loadInitialData,
    loadSchools,
    pagination,
    resetFilters,
    rows,
    schoolName,
    schools,
    searchClasses
  }
}
