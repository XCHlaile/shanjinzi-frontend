import { ref } from 'vue'

import { forumApi } from '../api/forumApi.js'

const noop = () => {}

export function useForumInteractions({
  topicDetails,
  api = forumApi,
  prompt = async () => ({ value: '' }),
  notify = { success: noop, error: noop }
}) {
  const likingTopicId = ref(null)
  const reportingTarget = ref('')

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

  async function reportTopic(topic) {
    const target = `topic-${topic.topicId}`
    try {
      const reason = await requestReportReason('话题')
      reportingTarget.value = target
      const report = await api.reportForumTopic(topic.topicId, { reason })
      notify.success(`举报已提交${report?.reportId ? `（编号 #${report.reportId}）` : ''}`)
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        notify.error(error.message || '举报提交失败')
      }
    } finally {
      if (reportingTarget.value === target) reportingTarget.value = ''
    }
  }

  async function reportReply(topic, reply) {
    const target = `reply-${reply.replyId}`
    try {
      const reason = await requestReportReason('回复')
      reportingTarget.value = target
      const report = await api.reportForumReply(topic.topicId, reply.replyId, { reason })
      notify.success(`举报已提交${report?.reportId ? `（编号 #${report.reportId}）` : ''}`)
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        notify.error(error.message || '举报提交失败')
      }
    } finally {
      if (reportingTarget.value === target) reportingTarget.value = ''
    }
  }

  async function toggleLike(topic) {
    if (likingTopicId.value === topic.topicId) return
    likingTopicId.value = topic.topicId
    try {
      const result = topic.likedByMe
        ? await api.unlikeForumTopic(topic.topicId)
        : await api.likeForumTopic(topic.topicId)
      topic.likedByMe = Boolean(result?.liked)
      topic.likesCount = Number(result?.likesCount ?? topic.likesCount ?? 0)
      if (topicDetails.value[topic.topicId]) {
        topicDetails.value[topic.topicId].likedByMe = topic.likedByMe
        topicDetails.value[topic.topicId].likesCount = topic.likesCount
      }
    } catch (error) {
      notify.error(error.message || '点赞操作失败')
    } finally {
      likingTopicId.value = null
    }
  }

  return {
    likingTopicId,
    reportReply,
    reportingTarget,
    reportTopic,
    toggleLike
  }
}
