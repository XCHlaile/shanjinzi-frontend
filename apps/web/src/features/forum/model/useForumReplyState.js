import { ref } from 'vue'

import { forumFileIds } from '../lib/forumViewModel.js'

export function useForumReplyState() {
  const expandedTopicId = ref(null)
  const repliesByTopic = ref({})
  const replyPages = ref({})
  const replyLoading = ref({})
  const replyTexts = ref({})
  const replyMediaByTopic = ref({})
  const replyUploading = ref({})
  const replyingTopicId = ref(null)
  const deletingReplyId = ref(null)
  const editingReplyId = ref(null)
  const updatingReplyId = ref(null)
  const replyEditText = ref('')
  const replyEditMedia = ref([])
  const replyEditUploading = ref(false)

  function setReplyMedia(topicId, media) {
    replyMediaByTopic.value = { ...replyMediaByTopic.value, [topicId]: media }
  }

  function setReplyUploading(topicId, uploading) {
    replyUploading.value = { ...replyUploading.value, [topicId]: uploading }
  }

  function canSubmitReply(topicId) {
    const content = replyTexts.value[topicId]?.trim() || ''
    return Boolean(content || forumFileIds(replyMediaByTopic.value[topicId]).length)
  }

  return {
    canSubmitReply,
    deletingReplyId,
    editingReplyId,
    expandedTopicId,
    repliesByTopic,
    replyingTopicId,
    replyEditMedia,
    replyEditText,
    replyEditUploading,
    replyLoading,
    replyMediaByTopic,
    replyPages,
    replyTexts,
    replyUploading,
    setReplyMedia,
    setReplyUploading,
    updatingReplyId
  }
}
