export function createClientMessageId({
  cryptoImpl = globalThis.crypto,
  random = Math.random
} = {}) {
  if (cryptoImpl?.randomUUID) return cryptoImpl.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, character => {
    const randomValue = Math.floor(random() * 16)
    const value = character === 'x'
      ? randomValue
      : (randomValue & 0x3) | 0x8
    return value.toString(16)
  })
}

export function isOwnMessage(message = {}, currentUserId = '') {
  return Boolean(
    currentUserId
    && String(message.sender?.id ?? '') === String(currentUserId)
  )
}

export function canRecallMessage(
  message,
  currentUserId,
  now = Date.now()
) {
  if (!isOwnMessage(message, currentUserId) || message.recalledAt || !message.createdAt) {
    return false
  }
  const createdAt = new Date(message.createdAt).getTime()
  if (Number.isNaN(createdAt)) return false
  const age = now - createdAt
  return age >= 0 && age <= 5 * 60 * 1000
}
