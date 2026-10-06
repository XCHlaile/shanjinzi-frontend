import { computed, reactive, ref } from 'vue'

import { activityApi } from '../api/activityApi.js'
import {
  activityFileIds,
  normalizeActivityMoment
} from '../lib/activityViewModel.js'

const noop = () => {}

export function useActivityMutations({
  activityList,
  currentUserId = '',
  api = activityApi,
  confirm = async () => {},
  prompt = async () => ({ value: '' }),
  notify = { success: noop, error: noop }
}) {
  const editingMomentId = ref(null)
  const updatingMomentId = ref(null)
  const deletingMomentId = ref(null)
  const likingMomentId = ref(null)
  const reportingTarget = ref('')
  const editMedia = ref([])
  const editUploading = ref(false)
  const editForm = reactive({ content: '' })

  const canSaveActivity = computed(() => Boolean(
    editForm.content.trim() || activityFileIds(editMedia.value).length
  ))

  function startEditActivity(item) {
    editingMomentId.value = item.id
    editForm.content = item.content || ''
    editMedia.value = [...(item.media || [])]
  }

  function cancelActivityEdit() {
    editingMomentId.value = null
    editForm.content = ''
    editMedia.value = []
  }

  async function saveActivityEdit(item) {
    const content = editForm.content.trim()
    const mediaFileIds = activityFileIds(editMedia.value)
    if ((!content && !mediaFileIds.length)
      || editUploading.value
      || updatingMomentId.value === item.id) return
    updatingMomentId.value = item.id
    try {
      const media = [...editMedia.value]
      const updated = await api.updateActivity(item.id, { content, mediaFileIds })
      Object.assign(item, normalizeActivityMoment({
        ...item,
        ...updated,
        content,
        media: updated?.media || media
      }))
      cancelActivityEdit()
      notify.success('动态已更新')
    } catch (error) {
      notify.error(error.message || '动态更新失败')
    } finally {
      updatingMomentId.value = null
    }
  }

  async function deleteActivity(item) {
    try {
      await confirm('删除后该动态及关联成长档案事件将被隐藏。', '删除动态', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
      deletingMomentId.value = item.id
      await api.removeActivity(item.id)
      activityList.value = activityList.value.filter(entry => entry.id !== item.id)
      notify.success('动态已删除')
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        notify.error(error.message || '动态删除失败')
      }
    } finally {
      deletingMomentId.value = null
    }
  }

  async function toggleActivityLike(item) {
    if (likingMomentId.value === item.id) return
    likingMomentId.value = item.id
    try {
      const result = item.likedByMe
        ? await api.unlikeActivity(item.id)
        : await api.likeActivity(item.id)
      item.likedByMe = Boolean(result?.likedByMe)
      item.likes = Number(result?.likesCount ?? item.likes ?? 0)
    } catch (error) {
      notify.error(error.message || '点赞操作失败')
    } finally {
      likingMomentId.value = null
    }
  }

  function canReportMoment(item) {
    return !currentUserId || String(item.authorUserId ?? '') !== currentUserId
  }

  async function requestReportReason(targetLabel) {
    const { value } = await prompt('请说明举报理由（最多 500 字）。', `举报${targetLabel}`, {
      confirmButtonText: '提交举报',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '填写具体原因',
      inputValidator(input) {
        const reason = String(input || '').trim()
        if (!reason) return '举报理由不能为空'
        if (reason.length > 500) return '举报理由不能超过 500 字'
        return true
      }
    })
    return String(value).trim()
  }

  async function reportActivity(item) {
    const target = `moment-${item.id}`
    try {
      const reason = await requestReportReason('动态')
      reportingTarget.value = target
      const report = await api.reportActivity(item.id, { reason })
      notify.success(`举报已提交${report?.reportId ? `（编号 #${report.reportId}）` : ''}`)
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        notify.error(error.message || '举报提交失败')
      }
    } finally {
      if (reportingTarget.value === target) reportingTarget.value = ''
    }
  }

  async function reportActivityComment(item, comment) {
    const target = `comment-${comment.commentId}`
    try {
      const reason = await requestReportReason('评论')
      reportingTarget.value = target
      const report = await api.reportActivityComment(item.id, comment.commentId, { reason })
      notify.success(`举报已提交${report?.reportId ? `（编号 #${report.reportId}）` : ''}`)
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        notify.error(error.message || '举报提交失败')
      }
    } finally {
      if (reportingTarget.value === target) reportingTarget.value = ''
    }
  }

  return {
    cancelActivityEdit,
    canReportMoment,
    canSaveActivity,
    deleteActivity,
    deletingMomentId,
    editForm,
    editingMomentId,
    editMedia,
    editUploading,
    likingMomentId,
    reportActivity,
    reportActivityComment,
    reportingTarget,
    saveActivityEdit,
    startEditActivity,
    toggleActivityLike,
    updatingMomentId
  }
}
