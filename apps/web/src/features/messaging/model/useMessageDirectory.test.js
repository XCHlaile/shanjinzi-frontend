import assert from 'node:assert/strict'
import test from 'node:test'

import { useMessageDirectory } from './useMessageDirectory.js'

test('message directory splits conversations and synchronizes broadcasts', async () => {
  const calls = []
  const directory = useMessageDirectory({
    api: {
      async fetchConversations(options) {
        calls.push(['conversations', options])
        return {
          items: [
            {
              conversationId: 2,
              lastMessageAt: '2026-07-31T10:00:00.000Z',
              participant: { id: 22, roleCode: 'PARENT' }
            },
            {
              conversationId: 1,
              pinned: true,
              lastMessageAt: '2026-07-31T09:00:00.000Z',
              participant: { id: 21, roleCode: 'TEACHER' }
            },
            {
              conversationId: 3,
              participant: { id: 1, roleCode: 'SUPER_ADMIN' }
            }
          ],
          page: 1,
          totalPages: 2
        }
      }
    }
  })
  directory.onBroadcastConversationsLoaded(items => {
    calls.push(['broadcasts', items.map(item => item.conversationId)])
  })

  await directory.loadConversations()

  assert.deepEqual(calls, [
    ['conversations', { page: 1, pageSize: 20 }],
    ['broadcasts', [3]]
  ])
  assert.deepEqual(
    directory.conversations.value.map(item => item.conversationId),
    [1, 2]
  )
  assert.equal(directory.conversationPage.value, 1)
  assert.equal(directory.conversationTotalPages.value, 2)
  assert.equal(directory.conversationLoading.value, false)
})

test('message directory appends pages and refreshes the active conversation', async () => {
  let request = 0
  const directory = useMessageDirectory({
    api: {
      async fetchConversations(options) {
        request += 1
        if (request === 1) {
          return {
            items: [{
              conversationId: 1,
              participant: { id: 21, roleCode: 'TEACHER' }
            }],
            page: options.page,
            totalPages: 2
          }
        }
        return {
          items: [
            {
              conversationId: 1,
              muted: true,
              participant: { id: 21, roleCode: 'TEACHER' }
            },
            {
              conversationId: 2,
              participant: { id: 22, roleCode: 'PARENT' }
            }
          ],
          page: options.page,
          totalPages: 2
        }
      }
    }
  })

  await directory.loadConversations()
  directory.activeConversation.value = directory.conversations.value[0]
  await directory.loadMoreConversations()

  assert.deepEqual(
    directory.conversations.value.map(item => item.conversationId),
    [1, 2]
  )
  assert.equal(directory.activeConversation.value.muted, true)
  assert.equal(directory.conversationPage.value, 2)
})

test('message directory filters administrator contacts and handles counters', async () => {
  const directory = useMessageDirectory({
    api: {
      async fetchMessageContacts(keyword) {
        assert.equal(keyword, '老师')
        return [
          { id: 1, roleCode: 'SUPER_ADMIN' },
          { id: 2, roleCode: 'TEACHER' }
        ]
      },
      async fetchUnreadCount() {
        return { unreadCount: 4 }
      }
    }
  })
  directory.contactKeyword.value = '老师'

  await directory.toggleContacts()
  await directory.loadUnreadCount()

  assert.equal(directory.showContacts.value, true)
  assert.deepEqual(directory.contacts.value.map(contact => contact.id), [2])
  assert.equal(directory.unreadCount.value, 4)
  assert.equal(directory.contactsLoading.value, false)
})
