import {
  forumPageItems,
  mergeForumRecords
} from '../lib/forumViewModel.js'

export function useForumReplyDirectory({
  api,
  notify,
  state,
  topicDetails
}) {
  async function fetchLatestReplies(topicId) {
    const firstPage = await api.fetchForumReplies(
      topicId,
      { page: 1, pageSize: 20 }
    )
    const lastPageNumber = Number(firstPage?.totalPages ?? 1)
    if (lastPageNumber <= 1) return firstPage
    const lastPage = await api.fetchForumReplies(
      topicId,
      { page: lastPageNumber, pageSize: 20 }
    )
    return {
      ...lastPage,
      items: mergeForumRecords(
        forumPageItems(firstPage),
        forumPageItems(lastPage),
        'replyId'
      ),
      page: lastPageNumber,
      totalPages: lastPageNumber
    }
  }

  async function toggleTopic(topic) {
    if (state.expandedTopicId.value === topic.topicId) {
      state.expandedTopicId.value = null
      return
    }
    state.expandedTopicId.value = topic.topicId
    if (
      topicDetails.value[topic.topicId]
      && state.repliesByTopic.value[topic.topicId]
    ) return

    state.replyLoading.value = {
      ...state.replyLoading.value,
      [topic.topicId]: true
    }
    try {
      const [detail, replyPage] = await Promise.all([
        api.fetchForumTopicDetail(topic.topicId),
        api.fetchForumReplies(topic.topicId, { page: 1, pageSize: 20 })
      ])
      topicDetails.value = { ...topicDetails.value, [topic.topicId]: detail }
      state.repliesByTopic.value = {
        ...state.repliesByTopic.value,
        [topic.topicId]: forumPageItems(replyPage)
      }
      state.replyPages.value = {
        ...state.replyPages.value,
        [topic.topicId]: {
          page: Number(replyPage?.page ?? 1),
          totalPages: Number(replyPage?.totalPages ?? 1)
        }
      }
      Object.assign(topic, {
        viewsCount: detail?.viewsCount ?? topic.viewsCount,
        likesCount: detail?.likesCount ?? topic.likesCount,
        repliesCount: detail?.repliesCount ?? topic.repliesCount,
        likedByMe: detail?.likedByMe ?? topic.likedByMe
      })
    } catch (error) {
      notify.error(error.message || '话题详情加载失败')
    } finally {
      state.replyLoading.value = {
        ...state.replyLoading.value,
        [topic.topicId]: false
      }
    }
  }

  function canLoadMoreReplies(topicId) {
    const meta = state.replyPages.value[topicId]
    return Boolean(meta && meta.page < meta.totalPages)
  }

  async function loadMoreReplies(topicId) {
    const meta = state.replyPages.value[topicId]
    if (
      !meta
      || meta.page >= meta.totalPages
      || state.replyLoading.value[topicId]
    ) return
    state.replyLoading.value = {
      ...state.replyLoading.value,
      [topicId]: true
    }
    try {
      const nextPage = meta.page + 1
      const payload = await api.fetchForumReplies(
        topicId,
        { page: nextPage, pageSize: 20 }
      )
      state.repliesByTopic.value = {
        ...state.repliesByTopic.value,
        [topicId]: [
          ...(state.repliesByTopic.value[topicId] || []),
          ...forumPageItems(payload)
        ]
      }
      state.replyPages.value = {
        ...state.replyPages.value,
        [topicId]: {
          page: nextPage,
          totalPages: Number(payload?.totalPages ?? meta.totalPages)
        }
      }
    } catch (error) {
      notify.error(error.message || '更多回复加载失败')
    } finally {
      state.replyLoading.value = {
        ...state.replyLoading.value,
        [topicId]: false
      }
    }
  }

  return {
    canLoadMoreReplies,
    fetchLatestReplies,
    loadMoreReplies,
    toggleTopic
  }
}
