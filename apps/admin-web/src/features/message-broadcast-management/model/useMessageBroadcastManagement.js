import { computed, reactive, ref } from 'vue'

import { saveBrowserFile } from '../../../shared/lib/browserDownload.js'
import { messageBroadcastApi } from '../api/messageBroadcastApi.js'
import {
  activeMessageSchools,
  availableMessageUsers,
  emptyMessageBroadcastForm,
  matchesMessageBroadcast,
  messageBroadcastExportFilter,
  messageBroadcastPageItems,
  messageBroadcastPayload,
  messageBroadcastStatusOptions,
  messageBroadcastTotal,
  messageBroadcastValidation,
  messageRecipientStatusRows
} from '../lib/messageBroadcastViewModel.js'

const silentFeedback = {
  error() {},
  success() {}
}

export function useMessageBroadcastManagement({
  api = messageBroadcastApi,
  feedback = silentFeedback,
  saveFile = saveBrowserFile
} = {}) {
  const keyword = ref('')
  const scope = ref('')
  const status = ref('')
  const rows = ref([])
  const schools = ref([])
  const users = ref([])
  const loading = ref(false)
  const loadError = ref('')
  const exporting = ref(false)
  const creating = ref(false)
  const optionsLoading = ref(false)
  const createVisible = ref(false)
  const detailVisible = ref(false)
  const detailLoading = ref(false)
  const detail = ref(null)
  const page = ref(1)
  const pageSize = ref(20)
  const total = ref(0)
  const form = reactive(emptyMessageBroadcastForm())

  const statusOptions = computed(() => messageBroadcastStatusOptions(rows.value))
  const filteredRows = computed(() => rows.value.filter(row => matchesMessageBroadcast(row, {
    keyword: keyword.value,
    scope: scope.value,
    status: status.value
  })))
  const recipientStatusRows = computed(() => messageRecipientStatusRows(detail.value))

  async function loadData() {
    loading.value = true
    loadError.value = ''
    try {
      const payload = await api.fetchBroadcasts({
        page: page.value,
        pageSize: pageSize.value
      })
      rows.value = messageBroadcastPageItems(payload)
      total.value = messageBroadcastTotal(payload, rows.value)
      return true
    } catch (error) {
      rows.value = []
      total.value = 0
      loadError.value = error.message || '群发任务加载失败'
      feedback.error(loadError.value)
      return false
    } finally {
      loading.value = false
    }
  }

  async function loadOptions() {
    optionsLoading.value = true
    try {
      const [schoolPayload, userPayload] = await Promise.all([
        api.fetchSchools({ page: 1, pageSize: 100 }),
        api.fetchUsers({ page: 1, pageSize: 100 })
      ])
      schools.value = activeMessageSchools(messageBroadcastPageItems(schoolPayload))
      users.value = availableMessageUsers(messageBroadcastPageItems(userPayload))
      return true
    } catch (error) {
      schools.value = []
      users.value = []
      feedback.error(error.message || '接收范围数据加载失败')
      return false
    } finally {
      optionsLoading.value = false
    }
  }

  async function openCreate() {
    Object.assign(form, emptyMessageBroadcastForm())
    createVisible.value = true
    if (!schools.value.length || !users.value.length) return loadOptions()
    return true
  }

  async function createBroadcast() {
    const validationError = messageBroadcastValidation(form)
    if (validationError) {
      feedback.error(validationError)
      return false
    }

    creating.value = true
    try {
      await api.createBroadcast(messageBroadcastPayload(form))
      feedback.success('群发任务已创建')
      createVisible.value = false
      page.value = 1
      await loadData()
      return true
    } catch (error) {
      feedback.error(error.message || '群发任务创建失败')
      return false
    } finally {
      creating.value = false
    }
  }

  async function showDetail(row) {
    detailVisible.value = true
    detailLoading.value = true
    detail.value = null
    try {
      detail.value = await api.fetchBroadcast(row.id)
      return true
    } catch (error) {
      feedback.error(error.message || '群发任务详情加载失败')
      return false
    } finally {
      detailLoading.value = false
    }
  }

  async function retryBroadcast(row) {
    try {
      await api.retryBroadcast(row.id)
      feedback.success('失败消息已重新提交')
      await loadData()
      return true
    } catch (error) {
      feedback.error(error.message || '失败消息重试失败')
      return false
    }
  }

  async function exportMessages() {
    exporting.value = true
    try {
      saveFile(
        await api.exportBroadcasts(messageBroadcastExportFilter({
          keyword: keyword.value,
          scope: scope.value,
          status: status.value
        })),
        '消息列表.csv'
      )
      feedback.success('消息数据已导出')
      return true
    } catch (error) {
      feedback.error(error.message || '消息导出失败')
      return false
    } finally {
      exporting.value = false
    }
  }

  return {
    createBroadcast,
    createVisible,
    creating,
    detail,
    detailLoading,
    detailVisible,
    exportMessages,
    exporting,
    filteredRows,
    form,
    keyword,
    loadData,
    loadError,
    loading,
    loadOptions,
    openCreate,
    optionsLoading,
    page,
    pageSize,
    recipientStatusRows,
    retryBroadcast,
    rows,
    schools,
    scope,
    showDetail,
    status,
    statusOptions,
    total,
    users
  }
}
