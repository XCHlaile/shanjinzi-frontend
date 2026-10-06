import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useForumManagement } from './useForumManagement.js'

test('forum facade wires replies, directory, topics and interactions in dependency order', () => {
  const calls = []
  const replies = {
    expandedTopicId: ref(null),
    fetchLatestReplies: async () => {},
    repliesByTopic: ref({}),
    replyPages: ref({})
  }
  const directory = {
    activeTab: ref(''),
    loadTopics: async () => {},
    page: ref(1),
    topics: ref([]),
    topicScope: ref('all'),
    total: ref(0)
  }
  const topicManagement = { showForm: ref(false) }
  const interactions = { likingTopicId: ref(null) }
  let sharedTopicDetails

  const facade = useForumManagement({
    createReplies(options) {
      calls.push('replies')
      sharedTopicDetails = options.topicDetails
      return replies
    },
    createDirectory(options) {
      calls.push('directory')
      assert.equal(options.topicDetails, sharedTopicDetails)
      assert.equal(options.fetchLatestReplies, replies.fetchLatestReplies)
      return directory
    },
    createTopicManagement(options) {
      calls.push('topics')
      assert.equal(options.topics, directory.topics)
      assert.equal(options.reloadTopics, directory.loadTopics)
      assert.equal(options.topicDetails, sharedTopicDetails)
      return topicManagement
    },
    createInteractions(options) {
      calls.push('interactions')
      assert.equal(options.topicDetails, sharedTopicDetails)
      return interactions
    }
  })

  assert.deepEqual(calls, ['replies', 'directory', 'topics', 'interactions'])
  assert.equal(facade.topicDetails, sharedTopicDetails)
  assert.equal(facade.showForm, topicManagement.showForm)
  assert.equal(facade.likingTopicId, interactions.likingTopicId)
})
