import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useMessageThread } from './useMessageThread.js'

function createThreadModel(apiOverrides = {}) {
  const calls = []
  const successes = []
  const errors = []
  const conversations = ref([])
  const api = {
    async fetchMessageHistory(conversationId, options) {
      calls.push(['history', conversationId, options])
      return { items: [{ messageId: 1, senderId: 8, content: '你好' }], page: 1, totalPages: 1 }
    },
    async markConversationRead(conversationId) {
      calls.push(['read-conversation', conversationId])
    },
    async sendMessage(payload) {
      calls.push(['send', payload])
      return { messageId: 2, conversationId: 10, senderId: 7, content: payload.content }
    },
    async recallMessage(messageId) {
      calls.push(['recall', messageId])
    },
    async hideMessage(messageId) {
      calls.push(['hide', messageId])
    },
    async updateConversationSettings(conversationId, changes) {
      calls.push(['settings', conversationId, changes])
    },
    ...apiOverrides
  }
  const model = useMessageThread({
    conversations,
    showContacts: ref(true),
    currentUserId: '7',
    loadConversations: async () => {
      calls.push(['reload-conversations'])
      conversations.value = [{ conversationId: 10, participant: { id: 9 }, pinned: false }]
    },
    loadUnreadCount: async () => { calls.push(['reload-unread']) },
    api,
    confirm: async (...args) => { calls.push(['confirm', ...args]) },
    notify: {
      success(message) { successes.push(message) },
      error(message) { errors.push(message) },
      warning(message) { errors.push(message) }
    }
  })
  return { calls, conversations, errors, model, successes }
}

test('message thread loads a selected conversation and marks it as read', async () => {
  const { calls, model } = createThreadModel()
  const conversation = { conversationId: 10, participant: { id: 9 }, unreadCount: 2 }

  await model.selectConversation(conversation)

  assert.equal(model.activeConversation.value.conversationId, conversation.conversationId)
  assert.deepEqual(model.messages.value.map(item => item.messageId), [1])
  assert.equal(conversation.unreadCount, 0)
  assert.deepEqual(calls, [
    ['history', 10, { page: 1, pageSize: 50 }],
    ['read-conversation', 10],
    ['reload-unread']
  ])
})

test('message thread sends text and attachments then follows the refreshed conversation', async () => {
  const { calls, model, successes } = createThreadModel()
  await model.selectContact({ id: 9, realName: '家长甲' })
  model.draft.value = '作业提醒'
  model.messageAttachments.value = [{ fileId: 21, url: '/files/21' }]

  await model.submitMessage()

  const sendCall = calls.find(call => call[0] === 'send')
  assert.equal(sendCall[1].receiverId, 9)
  assert.equal(sendCall[1].content, '作业提醒')
  assert.deepEqual(sendCall[1].attachmentFileIds, [21])
  assert.equal(model.activeConversation.value.conversationId, 10)
  assert.equal(model.activeContact.value, null)
  assert.equal(model.draft.value, '')
  assert.deepEqual(model.messageAttachments.value, [])
  assert.deepEqual(successes, ['消息已发送'])
})

test('message thread owns recall, hide, and conversation setting mutations', async () => {
  const { calls, conversations, model, successes } = createThreadModel()
  const conversation = { conversationId: 10, participant: { id: 9 }, pinned: false }
  const message = { messageId: 3, senderId: 7, sentAt: new Date().toISOString() }
  conversations.value = [conversation]
  model.activeConversation.value = conversation
  model.messages.value = [message]

  await model.recallMessage(message)
  await model.hideMessage(message)
  await model.togglePinned()

  assert.ok(message.recalledAt)
  assert.equal(message.recallNotice, '你撤回了一条消息')
  assert.deepEqual(model.messages.value, [])
  assert.equal(model.activeConversation.value.pinned, true)
  assert.deepEqual(calls.filter(call => ['recall', 'hide', 'settings'].includes(call[0])), [
    ['recall', 3],
    ['hide', 3],
    ['settings', 10, { pinned: true }]
  ])
  assert.deepEqual(successes, ['消息已撤回', '消息已从你的记录中隐藏', '会话已置顶'])
})
