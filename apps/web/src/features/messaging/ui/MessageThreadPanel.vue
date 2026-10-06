<template>
  <main v-if="activeParticipant" class="conversation-panel">
    <header class="conversation-header">
      <div class="participant-heading">
        <span class="avatar large">
          <img v-if="activeParticipant.avatarUrl" :src="activeParticipant.avatarUrl" alt="" width="46" height="46" decoding="async" /><span v-else>{{ contactInitial(activeParticipant) }}</span>
        </span>
        <div><h2>{{ contactName(activeParticipant) }}</h2><p>{{ contactRoleText(activeParticipant) }}</p></div>
      </div>
      <div v-if="activeConversation" class="conversation-actions">
        <button type="button" :disabled="settingsBusy" @click="$emit('toggle-pinned')">{{ activeConversation.pinned ? '取消置顶' : '置顶' }}</button>
        <button type="button" :disabled="settingsBusy" @click="$emit('toggle-muted')">{{ activeConversation.muted ? '关闭免打扰' : '免打扰' }}</button>
      </div>
    </header>

    <div ref="streamElement" class="message-stream">
      <button
        v-if="messagePage < messageTotalPages"
        class="load-more history-more"
        type="button"
        :disabled="messagesLoading"
        @click="$emit('load-older-messages')"
      >
        {{ messagesLoading ? '加载中...' : '加载更早消息' }}
      </button>
      <p v-if="messageError" class="stream-state error-state">{{ messageError }}<button type="button" @click="$emit('load-messages')">重试</button></p>
      <p v-else-if="messagesLoading && !messages.length" class="stream-state">正在加载消息...</p>
      <p v-else-if="!messages.length" class="stream-state">还没有消息，发送第一条私信开始交流</p>
      <article
        v-for="message in messages"
        v-else
        :key="message.messageId || message.clientMessageId"
        :class="['message-row', { mine: isMine(message) }]"
      >
        <span class="avatar small">
          <img v-if="message.sender?.avatarUrl" :src="message.sender.avatarUrl" alt="" width="32" height="32" loading="lazy" decoding="async" /><span v-else>{{ contactInitial(message.sender) }}</span>
        </span>
        <div class="message-body">
          <span class="sender-name">{{ isMine(message) ? '我' : contactName(message.sender) }}</span>
          <div :class="['message-bubble', { recalled: message.recalledAt }]">
            <p v-if="message.recalledAt">{{ message.recallNotice || '该消息已被撤回' }}</p>
            <template v-else>
              <p v-if="message.content">{{ message.content }}</p>
              <AppMediaGallery
                v-if="messageAttachmentMedia(message).length"
                :class="['message-attachment-gallery', { 'single-media': messageAttachmentMedia(message).length === 1 }]"
                :media="messageAttachmentMedia(message)"
              />
              <p v-else-if="messageAttachmentIds(message).length" class="attachment-unavailable">
                附件暂时无法加载
              </p>
            </template>
          </div>
          <div class="message-meta">
            <time>{{ formatTime(message.createdAt) }}</time>
            <span v-if="isMine(message) && !message.recalledAt">{{ message.readAt ? '已读' : '未读' }}</span>
            <button v-if="canRecall(message)" type="button" @click="$emit('recall-message', message)">撤回</button>
            <button type="button" @click="$emit('hide-message', message)">仅对我删除</button>
          </div>
        </div>
      </article>
    </div>

    <form class="message-composer" @submit.prevent="$emit('submit-message')">
      <textarea
        v-model="draft"
        rows="2"
        maxlength="3000"
        :placeholder="`发消息给 ${contactName(activeParticipant)}`"
        @keydown.ctrl.enter.prevent="$emit('submit-message')"
      ></textarea>
      <AppFileUploader
        v-model="attachments"
        class="message-attachments-uploader"
        source-type="message"
        compact-preview
        :max-files="9"
        label="添加附件"
        :disabled="sending"
        @uploading-change="attachmentUploading = $event"
      />
      <div class="composer-actions">
        <span>{{ draft.length }}/3000 · Ctrl + Enter 发送</span>
        <button class="btn btn-primary btn-sm" type="submit" :disabled="!canSend || sending">{{ sending ? '发送中...' : '发送' }}</button>
      </div>
    </form>
  </main>

  <main v-else class="conversation-panel empty-panel">
    <div class="welcome-state"><span class="welcome-icon">✉</span><h2>选择一个会话</h2><p>查看历史消息，或从联系人列表发起新的私信。</p></div>
  </main>
</template>

<script setup>
import AppFileUploader from '@/components/AppFileUploader.vue'
import AppMediaGallery from '@/components/AppMediaGallery.vue'
import { messageAttachmentIds } from '../lib/messageAttachments.js'
import {
  contactInitial,
  contactName,
  formatTime
} from '../lib/messageViewModel.js'

defineProps({
  activeConversation: { type: Object, default: null },
  activeParticipant: { type: Object, default: null },
  canRecall: { type: Function, required: true },
  canSend: Boolean,
  contactRoleText: { type: Function, required: true },
  isMine: { type: Function, required: true },
  messageAttachmentMedia: { type: Function, required: true },
  messageError: { type: String, default: '' },
  messagePage: { type: Number, default: 1 },
  messages: { type: Array, default: () => [] },
  messagesLoading: Boolean,
  messageTotalPages: { type: Number, default: 1 },
  sending: Boolean,
  settingsBusy: Boolean
})

defineEmits([
  'hide-message',
  'load-messages',
  'load-older-messages',
  'recall-message',
  'submit-message',
  'toggle-muted',
  'toggle-pinned'
])

const attachmentUploading = defineModel('attachmentUploading', { type: Boolean })
const attachments = defineModel('attachments', { type: Array, default: () => [] })
const draft = defineModel('draft', { type: String, default: '' })
const streamElement = defineModel('streamElement', { default: null })
</script>

<style scoped>
.conversation-panel { display:grid; grid-template-rows:auto minmax(0,1fr) auto; min-height:620px; height:720px; overflow:hidden; border:1px solid var(--border); border-radius:12px; background:white; box-shadow:var(--shadow-xs); }
.conversation-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; border-bottom:1px solid var(--border); }
.participant-heading { display:flex; align-items:center; gap:10px; min-width:0; }
.participant-heading h2 { margin:0; font-size:1rem; }
.participant-heading p { margin:2px 0 0; color:var(--text-secondary); font-size:.75rem; }
.avatar { display:grid; place-items:center; flex:0 0 auto; width:42px; height:42px; overflow:hidden; border-radius:50%; background:linear-gradient(135deg,#dbeafe,#ede9fe); color:#4338ca; font-weight:700; }
.avatar img { width:100%; height:100%; object-fit:cover; }
.avatar.large { width:46px; height:46px; }
.avatar.small { width:32px; height:32px; font-size:.75rem; }
.conversation-actions { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:10px; }
.conversation-actions button, .message-meta button { border:0; background:transparent; color:var(--color-brand); cursor:pointer; font:inherit; }
.conversation-actions button { padding:5px 8px; border:1px solid #bfdbfe; border-radius:6px; font-size:.72rem; }
.conversation-actions button:disabled { opacity:.5; cursor:not-allowed; }
.message-stream { display:flex; flex-direction:column; gap:14px; min-height:0; overflow-y:auto; padding:18px; background:#f8fafc; }
.load-more { padding:8px; border:1px solid var(--border); border-radius:8px; background:white; color:var(--color-brand); cursor:pointer; }
.history-more { align-self:center; width:auto; margin:0 auto; padding:6px 12px; font-size:.75rem; }
.stream-state { margin:auto; color:var(--text-secondary); text-align:center; }
.stream-state.error-state { display:grid; gap:8px; color:#b91c1c; }
.stream-state button { border:0; background:transparent; color:var(--color-brand); cursor:pointer; }
.message-row { display:flex; align-items:flex-start; gap:8px; max-width:78%; }
.message-row { content-visibility:auto; contain-intrinsic-size:auto 88px; }
.message-row.mine { align-self:flex-end; flex-direction:row-reverse; }
.message-body { display:grid; gap:4px; min-width:0; }
.message-row.mine .message-body { justify-items:end; }
.sender-name { color:var(--text-muted); font-size:.7rem; }
.message-bubble { max-width:100%; padding:9px 12px; overflow-wrap:anywhere; border:1px solid var(--border); border-radius:4px 12px 12px; background:white; box-shadow:var(--shadow-xs); }
.message-row.mine .message-bubble { border-color:#bfdbfe; border-radius:12px 4px 12px 12px; background:#dbeafe; }
.message-bubble.recalled { background:#f1f5f9; color:var(--text-muted); font-style:italic; }
.message-bubble p { margin:0; white-space:pre-wrap; }
.message-attachment-gallery { min-width:min(420px,62vw); margin:6px 0 0; }
.message-attachment-gallery.single-media { width:min(220px,62vw); min-width:0; grid-template-columns:minmax(0,1fr); }
.message-attachment-gallery:deep(.app-media-gallery) { margin:0; }
.message-attachment-gallery:deep(.media-image-link img) { height:180px; }
.attachment-unavailable { margin-top:6px !important; color:var(--text-muted); font-size:.72rem; }
.message-meta { display:flex; align-items:center; flex-wrap:wrap; gap:8px; color:var(--text-muted); font-size:.66rem; }
.message-meta button { padding:0; font-size:.66rem; }
.message-composer { padding:12px 14px; border-top:1px solid var(--border); background:white; }
.message-composer textarea { width:100%; padding:10px 12px; resize:none; border:1px solid var(--border); border-radius:8px; font:inherit; outline:none; }
.message-composer textarea:focus { border-color:var(--color-brand); box-shadow:0 0 0 3px #dbeafe; }
.message-attachments-uploader { margin-top:8px; }
.composer-actions { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:8px; }
.composer-actions span { color:var(--text-muted); font-size:.7rem; }
.composer-actions button:disabled { opacity:.55; cursor:not-allowed; transform:none; }
.empty-panel { grid-template-rows:1fr; }
.welcome-state { margin:auto; padding:32px; text-align:center; }
.welcome-state h2 { margin:12px 0 4px; }
.welcome-state p { color:var(--text-secondary); }
.welcome-icon { display:grid; place-items:center; width:62px; height:62px; margin:auto; border-radius:50%; background:#e0e7ff; color:#4338ca; font-size:1.7rem; }
@media (max-width:900px) {
  .conversation-panel { min-height:560px; height:70vh; }
}
@media (max-width:560px) {
  .conversation-header { align-items:flex-start; }
  .conversation-actions { display:grid; gap:4px; }
  .message-row { max-width:92%; }
  .composer-actions span { display:none; }
  .composer-actions { justify-content:flex-end; }
}
</style>
