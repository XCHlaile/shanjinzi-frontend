export const MESSAGE_ATTACHMENT_CACHE_KEY = 'sjz_message_attachment_media_v1'

const DIRECT_MEDIA_FIELDS = ['attachments', 'attachmentFiles', 'attachmentMedia', 'media']
const MAX_CACHED_ATTACHMENTS = 300

function fileId(item) {
  const value = item && typeof item === 'object' ? item.fileId ?? item.id : item
  return value === undefined || value === null || value === '' ? '' : String(value)
}

function mediaItems(message = {}) {
  const direct = DIRECT_MEDIA_FIELDS.flatMap(field => (
    Array.isArray(message[field]) ? message[field] : []
  ))
  const embeddedIds = Array.isArray(message.attachmentFileIds)
    ? message.attachmentFileIds.filter(item => item && typeof item === 'object')
    : []
  return [...direct, ...embeddedIds]
}

function uniqueMedia(items = []) {
  const seen = new Set()
  return items.filter(item => {
    if (!item?.url) return false
    const key = fileId(item) || String(item.url)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function messageAttachmentIds(message = {}) {
  if (!Array.isArray(message.attachmentFileIds)) return []
  return [...new Set(message.attachmentFileIds.map(fileId).filter(Boolean))]
}

export function resolveMessageAttachmentMedia(message = {}, cache = {}) {
  const direct = uniqueMedia(mediaItems(message))
  const ids = messageAttachmentIds(message)
  if (!ids.length) return direct

  const directById = new Map(direct.map(item => [fileId(item), item]).filter(([id]) => id))
  const resolved = ids.map(id => directById.get(id) || cache?.[id]).filter(item => item?.url)
  const unreferenced = direct.filter(item => !fileId(item) || !ids.includes(fileId(item)))
  return uniqueMedia([...resolved, ...unreferenced])
}

export function mergeMessageAttachmentCache(cache = {}, items = []) {
  const next = { ...cache }
  uniqueMedia(items).forEach(item => {
    const id = fileId(item)
    if (!id) return
    next[id] = {
      fileId: item.fileId ?? item.id,
      url: item.url,
      originalName: item.originalName || item.name || '',
      mimeType: item.mimeType || '',
      mediaType: item.mediaType || '',
      fileSize: Number(item.fileSize || 0),
      cachedAt: Date.now()
    }
  })

  const entries = Object.entries(next)
    .sort(([, left], [, right]) => Number(right?.cachedAt || 0) - Number(left?.cachedAt || 0))
    .slice(0, MAX_CACHED_ATTACHMENTS)
  return Object.fromEntries(entries)
}

export function readMessageAttachmentCache(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  try {
    const value = JSON.parse(storage?.getItem(MESSAGE_ATTACHMENT_CACHE_KEY) || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

export function writeMessageAttachmentCache(cache, storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  try {
    storage?.setItem(MESSAGE_ATTACHMENT_CACHE_KEY, JSON.stringify(cache || {}))
  } catch {
    // Rendering should continue even when browser storage is unavailable or full.
  }
}
