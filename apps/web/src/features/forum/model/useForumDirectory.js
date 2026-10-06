import { computed, ref } from 'vue'

import { forumApi } from '../api/forumApi.js'
import {
  FORUM_TOPIC_TAGS,
  forumPageItems,
  mergeForumRecords,
  sortForumReplies
} from '../lib/forumViewModel.js'

export function useForumDirectory({
  topicDetails,
  expandedTopicId,
  repliesByTopic,
  replyPages,
  fetchLatestReplies,
  pageSize = 20,
  api = forumApi
}) {
  const topics = ref([])
  const page = ref(1)
  const total = ref(0)
  const totalPages = ref(0)
  const activeTab = ref('')
  const topicScope = ref('all')
  const loading = ref(false)
  const loadError = ref('')
  const liveRefreshing = ref(false)

  const tabs = computed(() => [
    { key: '', label: '最新' },
    ...FORUM_TOPIC_TAGS.map(tag => ({ key: tag, label: `#${tag}` }))
  ])

  async function fetchTopicPage() {
    return topicScope.value === 'mine'
      ? api.fetchMyForumTopics({ page: page.value, pageSize })
      : api.fetchForumTopics({
          page: page.value,
          pageSize,
          ...(activeTab.value ? { tag: activeTab.value } : {})
        })
  }

  function applyTopicPage(payload) {
    topics.value = forumPageItems(payload)
    total.value = Number(payload?.total ?? topics.value.length)
    totalPages.value = Number(payload?.totalPages ?? (topics.value.length ? 1 : 0))
  }

  async function loadTopics() {
    loading.value = true
    loadError.value = ''
    expandedTopicId.value = null
    try {
      applyTopicPage(await fetchTopicPage())
    } catch (error) {
      topics.value = []
      total.value = 0
      totalPages.value = 0
      loadError.value = error.message || '论坛话题加载失败，请稍后重试'
    } finally {
      loading.value = false
    }
  }

  async function refreshForumLive() {
    if (loading.value || liveRefreshing.value) return
    liveRefreshing.value = true
    try {
      const payload = await fetchTopicPage()
      const currentTopics = new Map(topics.value.map(topic => [String(topic.topicId), topic]))
      topics.value = forumPageItems(payload).map(topic => ({
        ...(currentTopics.get(String(topic.topicId)) || {}),
        ...topic
      }))
      total.value = Number(payload?.total ?? topics.value.length)
      totalPages.value = Number(payload?.totalPages ?? (topics.value.length ? 1 : 0))

      const topicId = expandedTopicId.value
      if (!topicId) return
      const [detail, replyPage] = await Promise.all([
        api.fetchForumTopicDetail(topicId),
        fetchLatestReplies(topicId)
      ])
      topicDetails.value = { ...topicDetails.value, [topicId]: detail }
      repliesByTopic.value = {
        ...repliesByTopic.value,
        [topicId]: sortForumReplies(mergeForumRecords(
          repliesByTopic.value[topicId] || [],
          forumPageItems(replyPage),
          'replyId'
        ))
      }
      const currentReplyPage = replyPages.value[topicId]?.page || 1
      replyPages.value = {
        ...replyPages.value,
        [topicId]: {
          page: currentReplyPage,
          totalPages: Number(replyPage?.totalPages ?? 1)
        }
      }
      const topic = topics.value.find(item => String(item.topicId) === String(topicId))
      if (topic) {
        Object.assign(topic, {
          viewsCount: detail?.viewsCount ?? topic.viewsCount,
          likesCount: detail?.likesCount ?? topic.likesCount,
          repliesCount: detail?.repliesCount ?? topic.repliesCount,
          likedByMe: detail?.likedByMe ?? topic.likedByMe
        })
      }
    } catch {
      // 实时刷新失败时保留现有内容，下一轮或手动刷新会继续重试。
    } finally {
      liveRefreshing.value = false
    }
  }

  async function selectTab(tag) {
    if (activeTab.value === tag && page.value === 1) return
    activeTab.value = tag
    page.value = 1
    await loadTopics()
  }

  async function selectScope(scope) {
    if (topicScope.value === scope && page.value === 1) return
    topicScope.value = scope
    activeTab.value = ''
    page.value = 1
    await loadTopics()
  }

  async function changePage(nextPage) {
    page.value = nextPage
    await loadTopics()
  }

  return {
    activeTab,
    changePage,
    liveRefreshing,
    loadError,
    loading,
    loadTopics,
    page,
    refreshForumLive,
    selectScope,
    selectTab,
    tabs,
    topics,
    topicScope,
    total,
    totalPages
  }
}
