import { ref } from 'vue'

import { isClassDialogCancel } from '../lib/classManagementViewModel.js'

export function useClassActions({
  api,
  dialogs,
  feedback,
  handleAdminError,
  loadClasses,
  pagination,
  rows
}) {
  const detailDialogVisible = ref(false)
  const detailLoading = ref(false)
  const classDetail = ref(null)

  async function openDetail(row) {
    classDetail.value = null
    detailDialogVisible.value = true
    detailLoading.value = true
    try {
      classDetail.value = await api.fetchClass(row.id)
      return true
    } catch (error) {
      detailDialogVisible.value = false
      handleAdminError(error, '班级详情加载失败')
      return false
    } finally {
      detailLoading.value = false
    }
  }

  async function toggleStatus(row) {
    const disabling = row.status === 'ACTIVE'
    try {
      await dialogs.confirm(
        `确认${disabling ? '停用' : '启用'}班级“${row.name}”吗？`,
        `${disabling ? '停用' : '启用'}班级`,
        {
          type: disabling ? 'warning' : 'info',
          confirmButtonText: '确认',
          cancelButtonText: '取消'
        }
      )
      if (disabling) await api.disableClass(row.id)
      else await api.enableClass(row.id)
      feedback.success(`班级已${disabling ? '停用' : '启用'}`)
      await loadClasses()
      return true
    } catch (error) {
      if (!isClassDialogCancel(error)) {
        handleAdminError(error, `班级${disabling ? '停用' : '启用'}失败`)
      }
      return false
    }
  }

  async function removeClass(row) {
    try {
      await dialogs.confirm(
        `确认删除班级“${row.name}”吗？该操作会按接口规则执行软删除。`,
        '删除班级',
        {
          type: 'warning',
          confirmButtonText: '确认删除',
          cancelButtonText: '取消'
        }
      )
      await api.deleteClass(row.id)
      feedback.success('班级已删除')
      if (rows.value.length === 1 && pagination.page > 1) {
        pagination.page -= 1
      }
      await loadClasses()
      return true
    } catch (error) {
      if (!isClassDialogCancel(error)) {
        handleAdminError(error, '班级删除失败')
      }
      return false
    }
  }

  return {
    classDetail,
    detailDialogVisible,
    detailLoading,
    openDetail,
    removeClass,
    toggleStatus
  }
}
