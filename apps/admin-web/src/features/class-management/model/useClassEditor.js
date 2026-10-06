import { reactive, ref } from 'vue'

import {
  classCreatePayload,
  classUpdatePayload,
  upsertClassRows
} from '../../../api/payloads/classPayloads.js'
import {
  classForm,
  emptyClassForm
} from '../lib/classManagementViewModel.js'

export function useClassEditor({
  api,
  feedback,
  filters,
  handleAdminError,
  loadClasses,
  rows
}) {
  const saving = ref(false)
  const formDialogVisible = ref(false)
  const editingId = ref(null)
  const form = reactive(emptyClassForm())

  function openCreate() {
    editingId.value = null
    Object.assign(form, emptyClassForm(filters.schoolId || null))
    formDialogVisible.value = true
  }

  function openEdit(row) {
    editingId.value = row.id
    Object.assign(form, classForm(row))
    formDialogVisible.value = true
  }

  async function saveClass() {
    if (!form.name.trim()) {
      feedback.error('请输入班级名称')
      return false
    }

    const payload = editingId.value
      ? classUpdatePayload(form)
      : classCreatePayload(form)
    saving.value = true
    try {
      const savedClass = editingId.value
        ? await api.updateClass(editingId.value, payload)
        : await api.createClass(payload)
      rows.value = upsertClassRows(rows.value, savedClass)
      feedback.success(editingId.value ? '班级已更新' : '班级已创建')
      formDialogVisible.value = false
      await loadClasses()
      return true
    } catch (error) {
      handleAdminError(
        error,
        editingId.value ? '班级更新失败' : '班级创建失败'
      )
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    editingId,
    form,
    formDialogVisible,
    openCreate,
    openEdit,
    saveClass,
    saving
  }
}
