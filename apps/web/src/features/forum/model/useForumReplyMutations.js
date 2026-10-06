import { forumFileIds } from '../lib/forumViewModel.js'

export function useForumReplyMutations({
  api,
  confirm,
  notify,
  state
}) {
  function startEditReply(reply) {
    state.editingReplyId.value = reply.replyId
    state.replyEditText.value = reply.content || ''
    state.replyEditMedia.value = [...(reply.media || [])]
  }

  function cancelReplyEdit() {
    state.editingReplyId.value = null
    state.replyEditText.value = ''
    state.replyEditMedia.value = []
  }

  async function submitReplyEdit(topic, reply) {
    const content = state.replyEditText.value.trim()
    if (
      !content
      || state.replyEditUploading.value
      || state.updatingReplyId.value === reply.replyId
    ) return
    state.updatingReplyId.value = reply.replyId
    try {
      const media = [...state.replyEditMedia.value]
      const updated = await api.updateForumReply(topic.topicId, reply.replyId, {
        content,
        mediaFileIds: forumFileIds(media)
      })
      Object.assign(reply, updated || {}, {
        content: updated?.content || content,
        media: updated?.media || media
      })
      cancelReplyEdit()
      notify.success('回复已更新')
    } catch (error) {
      notify.error(error.message || '回复更新失败')
    } finally {
      state.updatingReplyId.value = null
    }
  }

  async function deleteReply(topic, reply) {
    try {
      await confirm('该回复下的子回复也会一并删除。', '删除回复', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
      state.deletingReplyId.value = reply.replyId
      await api.removeForumReply(topic.topicId, reply.replyId)
      state.repliesByTopic.value = {
        ...state.repliesByTopic.value,
        [topic.topicId]: (state.repliesByTopic.value[topic.topicId] || [])
          .filter(item => item.replyId !== reply.replyId)
      }
      topic.repliesCount = Math.max(0, Number(topic.repliesCount || 0) - 1)
      notify.success('回复已删除')
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        notify.error(error.message || '回复删除失败')
      }
    } finally {
      state.deletingReplyId.value = null
    }
  }

  return {
    cancelReplyEdit,
    deleteReply,
    startEditReply,
    submitReplyEdit
  }
}
