import { computed, ref } from 'vue'

import { activityApi } from '../api/activityApi.js'
import { activityFileIds, activityPageItems } from '../lib/activityViewModel.js'

const noop = () => {}

export function useActivityComments({
  currentUserId,
  api = activityApi,
  confirm = async () => {},
  notify = { success: noop, error: noop }
}) {
  const activeMomentId = ref(null)
  const comments = ref([])
  const commentLoading = ref(false)
  const commentError = ref('')
  const commentText = ref('')
  const commentMedia = ref([])
  const commentUploading = ref(false)
  const commentSubmitting = ref(false)
  const deletingCommentId = ref(null)

  const canSubmitComment = computed(() => Boolean(
    commentText.value.trim() || activityFileIds(commentMedia.value).length
  ))

  function resetCommentDraft() {
    commentText.value = ''
    commentMedia.value = []
  }

  async function toggleComments(item) {
    if (activeMomentId.value === item.id) {
      activeMomentId.value = null
      resetCommentDraft()
      return
    }
    activeMomentId.value = item.id
    comments.value = []
    resetCommentDraft()
    commentLoading.value = true
    commentError.value = ''
    try {
      const payload = await api.fetchActivityComments(item.id, { page: 1, pageSize: 100 })
      comments.value = activityPageItems(payload)
    } catch (error) {
      commentError.value = error.message || '评论加载失败'
    } finally {
      commentLoading.value = false
    }
  }

  function canDeleteComment(comment) {
    return Boolean(currentUserId) && String(comment.userId ?? '') === String(currentUserId)
  }

  async function submitComment(item) {
    const content = commentText.value.trim()
    const mediaFileIds = activityFileIds(commentMedia.value)
    if ((!content && !mediaFileIds.length) || commentSubmitting.value || commentUploading.value) return
    commentSubmitting.value = true
    try {
      const created = await api.commentActivity(item.id, { content, mediaFileIds })
      comments.value.push(created)
      item.comments = Number(item.comments || 0) + 1
      resetCommentDraft()
      notify.success('评论已发布')
    } catch (error) {
      notify.error(error.message || '评论发布失败')
    } finally {
      commentSubmitting.value = false
    }
  }

  async function deleteComment(item, comment) {
    try {
      await confirm('该评论下的回复也会一并删除。', '删除评论', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
      deletingCommentId.value = comment.commentId
      await api.removeActivityComment(item.id, comment.commentId)
      comments.value = comments.value.filter(entry => entry.commentId !== comment.commentId)
      item.comments = Math.max(0, Number(item.comments || 0) - 1)
      notify.success('评论已删除')
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        notify.error(error.message || '评论删除失败')
      }
    } finally {
      deletingCommentId.value = null
    }
  }

  return {
    activeMomentId,
    canDeleteComment,
    canSubmitComment,
    commentError,
    commentLoading,
    commentMedia,
    comments,
    commentSubmitting,
    commentText,
    commentUploading,
    deleteComment,
    deletingCommentId,
    submitComment,
    toggleComments
  }
}
