import { validateApiContractMap } from '@shanjinzi/api-contracts'

import {
  cleanObject,
  fillPath,
  numericId,
  pageParams
} from '../../../shared/api/requestUtils.js'
import { httpClient } from '../../../shared/api/httpClient.js'

export const forumContracts = validateApiContractMap({
  forum: {
    topics: { method: 'GET', path: '/api/app/forum-topics' },
    mine: { method: 'GET', path: '/api/app/forum-topics/mine' },
    createTopic: { method: 'POST', path: '/api/app/forum-topics' },
    detail: { method: 'GET', path: '/api/app/forum-topics/{topicId}' },
    updateTopic: { method: 'PUT', path: '/api/app/forum-topics/{topicId}' },
    deleteTopic: { method: 'DELETE', path: '/api/app/forum-topics/{topicId}' },
    reportTopic: { method: 'POST', path: '/api/app/forum-topics/{topicId}/reports' },
    replies: { method: 'GET', path: '/api/app/forum-topics/{topicId}/replies' },
    reply: { method: 'POST', path: '/api/app/forum-topics/{topicId}/replies' },
    updateReply: { method: 'PUT', path: '/api/app/forum-topics/{topicId}/replies/{replyId}' },
    deleteReply: { method: 'DELETE', path: '/api/app/forum-topics/{topicId}/replies/{replyId}' },
    reportReply: { method: 'POST', path: '/api/app/forum-topics/{topicId}/replies/{replyId}/reports' },
    like: { method: 'POST', path: '/api/app/forum-topics/{topicId}/like' },
    unlike: { method: 'DELETE', path: '/api/app/forum-topics/{topicId}/like' }
  }
}, 'forumContracts')

function topicPayload(data = {}) {
  return cleanObject({
    title: data.title,
    content: data.content || data.body || data.summary || data.title,
    tag: data.tag,
    mediaFileIds: Array.isArray(data.mediaFileIds) ? data.mediaFileIds.map(numericId) : undefined
  })
}

function replyPayload(data = {}) {
  const payload = { content: data.content || data.text || data.body || '' }
  if (Array.isArray(data.mediaFileIds)) payload.mediaFileIds = data.mediaFileIds.map(numericId)
  return payload
}

function updateTopicPayload(data = {}) {
  return cleanObject({
    title: data.title,
    content: data.content,
    tag: data.tag,
    mediaFileIds: Array.isArray(data.mediaFileIds) ? data.mediaFileIds.map(numericId) : undefined
  })
}

function updateReplyPayload(data = {}) {
  return cleanObject({
    content: data.content,
    mediaFileIds: Array.isArray(data.mediaFileIds) ? data.mediaFileIds.map(numericId) : undefined
  })
}

function reportPayload(data = {}) {
  return { reason: String(data.reason || '').trim() }
}

export function createForumApi(transport = httpClient) {
  const fetchForumTopics = params => (
    transport.get(forumContracts.forum.topics.path, { query: pageParams(params) })
  )
  const createForumTopic = data => (
    transport.post(forumContracts.forum.createTopic.path, topicPayload(data))
  )
  const likeForumTopic = topicId => (
    transport.post(fillPath(forumContracts.forum.like.path, { topicId }))
  )
  const replyForumTopic = (topicId, data) => (
    transport.post(
      fillPath(forumContracts.forum.reply.path, { topicId }),
      replyPayload(data)
    )
  )

  return Object.freeze({
    fetchTopics: fetchForumTopics,
    createTopic: createForumTopic,
    likeTopic: likeForumTopic,
    replyTopic: replyForumTopic,
    fetchForumTopics,
    fetchMyForumTopics(params) {
      return transport.get(forumContracts.forum.mine.path, {
        query: { page: 1, pageSize: 20, ...params }
      })
    },
    createForumTopic,
    updateForumTopic(topicId, data) {
      return transport.put(
        fillPath(forumContracts.forum.updateTopic.path, { topicId }),
        updateTopicPayload(data)
      )
    },
    reportForumTopic(topicId, data) {
      return transport.post(
        fillPath(forumContracts.forum.reportTopic.path, { topicId }),
        reportPayload(data)
      )
    },
    fetchForumTopicDetail(topicId) {
      return transport.get(fillPath(forumContracts.forum.detail.path, { topicId }))
    },
    fetchForumReplies(topicId, params) {
      return transport.get(
        fillPath(forumContracts.forum.replies.path, { topicId }),
        { query: pageParams(params) }
      )
    },
    replyForumTopic,
    updateForumReply(topicId, replyId, data) {
      return transport.put(
        fillPath(forumContracts.forum.updateReply.path, { topicId, replyId }),
        updateReplyPayload(data)
      )
    },
    reportForumReply(topicId, replyId, data) {
      return transport.post(
        fillPath(forumContracts.forum.reportReply.path, { topicId, replyId }),
        reportPayload(data)
      )
    },
    likeForumTopic,
    unlikeForumTopic(topicId) {
      return transport.delete(fillPath(forumContracts.forum.unlike.path, { topicId }))
    },
    removeForumTopic(topicId) {
      return transport.delete(fillPath(forumContracts.forum.deleteTopic.path, { topicId }))
    },
    removeForumReply(topicId, replyId) {
      return transport.delete(
        fillPath(forumContracts.forum.deleteReply.path, { topicId, replyId })
      )
    }
  })
}

export const forumApi = createForumApi()
