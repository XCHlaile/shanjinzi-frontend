import { forumFileIds } from '../lib/forumViewModel.js'

export function useForumReplyComposer({
  api,
  notify,
  state,
  topicDetails
}) {
  async function submitReply(topic) {
    const content = state.replyTexts.value[topic.topicId]?.trim() || ''
    const mediaFileIds = forumFileIds(
      state.replyMediaByTopic.value[topic.topicId]
    )
    if (
      (!content && !mediaFileIds.length)
      || state.replyUploading.value[topic.topicId]
      || state.replyingTopicId.value === topic.topicId
    ) return
    state.replyingTopicId.value = topic.topicId
    try {
      const reply = await api.replyForumTopic(
        topic.topicId,
        { content, mediaFileIds }
      )
      state.repliesByTopic.value = {
        ...state.repliesByTopic.value,
        [topic.topicId]: [
          ...(state.repliesByTopic.value[topic.topicId] || []),
          reply
        ]
      }
      state.replyTexts.value = {
        ...state.replyTexts.value,
        [topic.topicId]: ''
      }
      state.replyMediaByTopic.value = {
        ...state.replyMediaByTopic.value,
        [topic.topicId]: []
      }
      topic.repliesCount = Number(topic.repliesCount || 0) + 1
      if (topicDetails.value[topic.topicId]) {
        topicDetails.value[topic.topicId].repliesCount = topic.repliesCount
      }
      notify.success('回复已提交并保存到后台')
    } catch (error) {
      notify.error(error.message || '回复提交失败')
    } finally {
      state.replyingTopicId.value = null
    }
  }

  return { submitReply }
}
