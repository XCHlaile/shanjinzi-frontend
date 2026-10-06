import { computed, ref } from 'vue'

import { forumApi } from '../api/forumApi.js'
import { forumFileIds } from '../lib/forumViewModel.js'

const noop = () => {}

export function useForumTopicManagement({
  topics,
  total,
  topicDetails,
  topicScope,
  activeTab,
  page,
  reloadTopics,
  api = forumApi,
  confirm = async () => {},
  notify = { success: noop, error: noop }
}) {
  const showForm = ref(false)
  const publishing = ref(false)
  const newTopic = ref({ title: '', content: '', tag: '' })
  const newTopicMedia = ref([])
  const newTopicUploading = ref(false)
  const deletingTopicId = ref(null)
  const editingTopicId = ref(null)
  const updatingTopicId = ref(null)
  const topicEditForm = ref({ title: '', content: '', tag: '' })
  const topicEditMedia = ref([])
  const topicEditUploading = ref(false)

  const canSubmitTopic = computed(() => (
    Boolean(newTopic.value.title.trim() && newTopic.value.content.trim() && newTopic.value.tag)
  ))

  function closeTopicForm() {
    showForm.value = false
    newTopic.value = { title: '', content: '', tag: '' }
    newTopicMedia.value = []
  }

  async function submitTopic() {
    if (!canSubmitTopic.value || publishing.value || newTopicUploading.value) return
    publishing.value = true
    try {
      await api.createForumTopic({
        title: newTopic.value.title.trim(),
        content: newTopic.value.content.trim(),
        tag: newTopic.value.tag,
        mediaFileIds: forumFileIds(newTopicMedia.value)
      })
      closeTopicForm()
      topicScope.value = 'mine'
      activeTab.value = ''
      page.value = 1
      await reloadTopics()
      notify.success('话题已发布并保存到后台')
    } catch (error) {
      notify.error(error.message || '话题发布失败')
    } finally {
      publishing.value = false
    }
  }

  async function startEditTopic(topic) {
    try {
      const detail = topicDetails.value[topic.topicId]
        || await api.fetchForumTopicDetail(topic.topicId)
      topicDetails.value = { ...topicDetails.value, [topic.topicId]: detail }
      topicEditForm.value = {
        title: detail?.title || topic.title || '',
        content: detail?.content || topic.contentSummary || '',
        tag: detail?.tag || topic.tag || ''
      }
      topicEditMedia.value = [...(detail?.media || topic.media || [])]
      editingTopicId.value = topic.topicId
    } catch (error) {
      notify.error(error.message || '话题内容加载失败')
    }
  }

  function cancelTopicEdit() {
    editingTopicId.value = null
    topicEditForm.value = { title: '', content: '', tag: '' }
    topicEditMedia.value = []
  }

  async function submitTopicEdit(topic) {
    const media = [...topicEditMedia.value]
    const data = {
      title: topicEditForm.value.title.trim(),
      content: topicEditForm.value.content.trim(),
      tag: topicEditForm.value.tag,
      mediaFileIds: forumFileIds(media)
    }
    if (!data.title
      || !data.content
      || !data.tag
      || topicEditUploading.value
      || updatingTopicId.value === topic.topicId) return
    updatingTopicId.value = topic.topicId
    try {
      const updated = await api.updateForumTopic(topic.topicId, data)
      Object.assign(topic, {
        title: updated?.title || data.title,
        contentSummary: updated?.content || data.content,
        tag: updated?.tag || data.tag,
        media: updated?.media || media
      })
      topicDetails.value = {
        ...topicDetails.value,
        [topic.topicId]: {
          ...(topicDetails.value[topic.topicId] || {}),
          ...updated,
          ...data,
          media: updated?.media || media
        }
      }
      cancelTopicEdit()
      notify.success('话题已更新')
    } catch (error) {
      notify.error(error.message || '话题更新失败')
    } finally {
      updatingTopicId.value = null
    }
  }

  async function deleteTopic(topic) {
    try {
      await confirm('删除主题后，该主题下的全部回复也会被隐藏。', '删除话题', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
      deletingTopicId.value = topic.topicId
      await api.removeForumTopic(topic.topicId)
      topics.value = topics.value.filter(item => item.topicId !== topic.topicId)
      total.value = Math.max(0, total.value - 1)
      notify.success('话题已删除')
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        notify.error(error.message || '话题删除失败')
      }
    } finally {
      deletingTopicId.value = null
    }
  }

  return {
    cancelTopicEdit,
    canSubmitTopic,
    closeTopicForm,
    deleteTopic,
    deletingTopicId,
    editingTopicId,
    newTopic,
    newTopicMedia,
    newTopicUploading,
    publishing,
    showForm,
    startEditTopic,
    submitTopic,
    submitTopicEdit,
    topicEditForm,
    topicEditMedia,
    topicEditUploading,
    updatingTopicId
  }
}
