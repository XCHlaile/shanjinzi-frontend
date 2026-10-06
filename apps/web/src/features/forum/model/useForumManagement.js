import { ref } from 'vue'

import { useForumDirectory } from './useForumDirectory.js'
import { useForumInteractions } from './useForumInteractions.js'
import { useForumReplies } from './useForumReplies.js'
import { useForumTopicManagement } from './useForumTopicManagement.js'

export function useForumManagement({
  confirm = async () => {},
  prompt = async () => {},
  notify = { success() {}, error() {} },
  createReplies = useForumReplies,
  createDirectory = useForumDirectory,
  createTopicManagement = useForumTopicManagement,
  createInteractions = useForumInteractions
} = {}) {
  const topicDetails = ref({})
  const replies = createReplies({
    topicDetails,
    confirm,
    notify
  })
  const directory = createDirectory({
    topicDetails,
    expandedTopicId: replies.expandedTopicId,
    repliesByTopic: replies.repliesByTopic,
    replyPages: replies.replyPages,
    fetchLatestReplies: replies.fetchLatestReplies
  })
  const topicManagement = createTopicManagement({
    topics: directory.topics,
    total: directory.total,
    topicDetails,
    topicScope: directory.topicScope,
    activeTab: directory.activeTab,
    page: directory.page,
    reloadTopics: directory.loadTopics,
    confirm,
    notify
  })
  const interactions = createInteractions({
    topicDetails,
    prompt,
    notify
  })

  return {
    ...replies,
    ...directory,
    ...topicManagement,
    ...interactions,
    topicDetails
  }
}
