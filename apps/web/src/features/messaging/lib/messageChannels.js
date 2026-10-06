function contactRoles(contact = {}) {
  return [
    ...(Array.isArray(contact.roles) ? contact.roles : []),
    contact.role,
    contact.roleCode
  ].filter(Boolean).map(role => String(role).toUpperCase())
}

export function isSuperAdminContact(contact = {}) {
  return contactRoles(contact).includes('SUPER_ADMIN')
}

export function isAdminBroadcastConversation(conversation = {}) {
  const conversationType = String(conversation.conversationType || '').toUpperCase()
  return ['BROADCAST', 'ADMIN_BROADCAST'].includes(conversationType)
    || isSuperAdminContact(conversation.participant)
}

export function splitMessageConversations(items = []) {
  return items.reduce((result, conversation) => {
    const key = isAdminBroadcastConversation(conversation)
      ? 'broadcastConversations'
      : 'privateConversations'
    result[key].push(conversation)
    return result
  }, { privateConversations: [], broadcastConversations: [] })
}

export function adminMessageNotification(message = {}, conversation = {}) {
  const messageId = message.messageId ?? message.clientMessageId
  const hasAttachments = (message.attachmentFileIds || []).length
    || (message.attachments || message.attachmentFiles || []).length
  return {
    notificationId: `admin-broadcast-${messageId}`,
    type: 'ADMIN_BROADCAST',
    title: '平台通知',
    content: message.recalledAt
      ? (message.recallNotice || '该通知已撤回')
      : (message.content || (hasAttachments ? '请查看通知附件' : '平台发布了一条通知')),
    sourceType: 'ADMIN_MESSAGE_BROADCAST',
    sourceId: messageId,
    messageId,
    conversationId: conversation.conversationId ?? message.conversationId,
    readAt: message.readAt || null,
    createdAt: message.createdAt || conversation.lastMessageAt,
    adminBroadcast: true,
    message
  }
}
