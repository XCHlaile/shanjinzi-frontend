import { validateApiContractMap } from '@shanjinzi/api-contracts'

import {
  cleanObject,
  fillPath,
  numericId,
  pageParams
} from '../../../shared/api/requestUtils.js'
import { httpClient } from '../../../shared/api/httpClient.js'

export const activityContracts = validateApiContractMap({
  moments: {
    list: { method: 'GET', path: '/api/app/moments' },
    create: { method: 'POST', path: '/api/app/moments' },
    mine: { method: 'GET', path: '/api/app/moments/mine' },
    detail: { method: 'GET', path: '/api/app/moments/{momentId}' },
    update: { method: 'PUT', path: '/api/app/moments/{momentId}' },
    delete: { method: 'DELETE', path: '/api/app/moments/{momentId}' },
    comments: { method: 'GET', path: '/api/app/moments/{momentId}/comments' },
    comment: { method: 'POST', path: '/api/app/moments/{momentId}/comments' },
    deleteComment: { method: 'DELETE', path: '/api/app/moments/{momentId}/comments/{commentId}' },
    report: { method: 'POST', path: '/api/app/moments/{momentId}/reports' },
    reportComment: { method: 'POST', path: '/api/app/moments/{momentId}/comments/{commentId}/reports' },
    like: { method: 'POST', path: '/api/app/moments/{momentId}/like' },
    unlike: { method: 'DELETE', path: '/api/app/moments/{momentId}/like' }
  }
}, 'activityContracts')

function commentPayload(data = {}) {
  const payload = {
    parentId: data.parentId,
    content: data.content || data.text || data.body || ''
  }
  if (Array.isArray(data.mediaFileIds)) payload.mediaFileIds = data.mediaFileIds.map(numericId)
  return cleanObject(payload)
}

function momentPayload(data = {}) {
  return cleanObject({
    content: data.content,
    classId: data.classId === undefined ? undefined : numericId(data.classId),
    visibility: data.visibility,
    mediaFileIds: Array.isArray(data.mediaFileIds) ? data.mediaFileIds.map(numericId) : undefined,
    studentIds: Array.isArray(data.studentIds) ? data.studentIds.map(numericId) : undefined
  })
}

function updateMomentPayload(data = {}) {
  return {
    content: data.content,
    mediaFileIds: Array.isArray(data.mediaFileIds) ? data.mediaFileIds.map(numericId) : []
  }
}

function reportPayload(data = {}) {
  return { reason: String(data.reason || '').trim() }
}

export function createActivityApi(transport = httpClient) {
  return Object.freeze({
    fetchActivities(params, requestOptions = {}) {
      return transport.get(activityContracts.moments.list.path, {
        ...requestOptions,
        query: pageParams(params)
      })
    },
    fetchActivityDetail(id) {
      return transport.get(fillPath(activityContracts.moments.detail.path, { momentId: id }))
    },
    fetchActivityComments(id, params) {
      return transport.get(
        fillPath(activityContracts.moments.comments.path, { momentId: id }),
        { query: pageParams(params) }
      )
    },
    createActivity(data) {
      return transport.post(activityContracts.moments.create.path, momentPayload(data))
    },
    updateActivity(id, data) {
      return transport.put(
        fillPath(activityContracts.moments.update.path, { momentId: id }),
        updateMomentPayload(data)
      )
    },
    fetchMyActivities(params, requestOptions = {}) {
      return transport.get(activityContracts.moments.mine.path, {
        ...requestOptions,
        query: { page: 1, pageSize: 20, ...params }
      })
    },
    likeActivity(id) {
      return transport.post(fillPath(activityContracts.moments.like.path, { momentId: id }))
    },
    unlikeActivity(id) {
      return transport.delete(fillPath(activityContracts.moments.unlike.path, { momentId: id }))
    },
    commentActivity(id, data) {
      return transport.post(
        fillPath(activityContracts.moments.comment.path, { momentId: id }),
        commentPayload(data)
      )
    },
    removeActivity(id) {
      return transport.delete(fillPath(activityContracts.moments.delete.path, { momentId: id }))
    },
    removeActivityComment(momentId, commentId) {
      return transport.delete(
        fillPath(activityContracts.moments.deleteComment.path, { momentId, commentId })
      )
    },
    reportActivity(momentId, data) {
      return transport.post(
        fillPath(activityContracts.moments.report.path, { momentId }),
        reportPayload(data)
      )
    },
    reportActivityComment(momentId, commentId, data) {
      return transport.post(
        fillPath(activityContracts.moments.reportComment.path, { momentId, commentId }),
        reportPayload(data)
      )
    }
  })
}

export const activityApi = createActivityApi()
