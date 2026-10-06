import { sortConversations } from '../lib/messageViewModel.js'

export function useMessageConversationActions({
  api,
  confirm,
  conversations,
  loadConversations,
  notify,
  state
}) {
  async function recallMessage(message) {
    try {
      await api.recallMessage(message.messageId)
      message.recalledAt = new Date().toISOString()
      message.recallNotice = '你撤回了一条消息'
      notify.success('消息已撤回')
      await loadConversations()
    } catch (error) {
      notify.error(error.message || '消息撤回失败')
    }
  }

  async function hideMessage(message) {
    try {
      await confirm('该消息只会从你的消息记录中隐藏，不影响对方。', '仅对我删除', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await api.hideMessage(message.messageId)
      state.messages.value = state.messages.value.filter(
        item => item.messageId !== message.messageId
      )
      notify.success('消息已从你的记录中隐藏')
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        notify.error(error.message || '删除失败')
      }
    }
  }

  async function updateSettings(changes, successMessage) {
    if (!state.activeConversation.value || state.settingsBusy.value) return
    state.settingsBusy.value = true
    try {
      await api.updateConversationSettings(
        state.activeConversation.value.conversationId,
        changes
      )
      Object.assign(state.activeConversation.value, changes)
      conversations.value = sortConversations(conversations.value)
      notify.success(successMessage)
    } catch (error) {
      notify.error(error.message || '会话设置更新失败')
    } finally {
      state.settingsBusy.value = false
    }
  }

  function togglePinned() {
    const pinned = !state.activeConversation.value?.pinned
    return updateSettings({ pinned }, pinned ? '会话已置顶' : '已取消置顶')
  }

  function toggleMuted() {
    const muted = !state.activeConversation.value?.muted
    return updateSettings({ muted }, muted ? '已开启免打扰' : '已关闭免打扰')
  }

  return {
    hideMessage,
    recallMessage,
    toggleMuted,
    togglePinned
  }
}
