<template>
  <div class="message-page">
    <section class="module-hero">
      <div class="container hero-content">
        <div>
          <p class="eyebrow">{{ roleLabel }}</p>
          <h1>消息中心</h1>
          <p>联系人和会话范围由后端根据当前账号的学校、班级及角色权限返回。</p>
        </div>
        <div class="hero-unread">
          <div class="unread-summary"><strong>{{ privateUnreadCount }}</strong><span>条未读私信</span></div>
          <div class="unread-summary"><strong>{{ combinedNotificationUnreadCount }}</strong><span>条通知</span></div>
        </div>
      </div>
    </section>

    <section class="section message-section">
      <div class="container center-tabs">
        <button :class="{ active: activeChannel === 'messages' }" type="button" @click="activeChannel = 'messages'">
          私信 <span v-if="privateUnreadCount">{{ displayUnread(privateUnreadCount) }}</span>
        </button>
        <button :class="{ active: activeChannel === 'notifications' }" type="button" @click="openNotifications">
          通知 <span v-if="combinedNotificationUnreadCount">{{ displayUnread(combinedNotificationUnreadCount) }}</span>
        </button>
      </div>

      <div v-if="activeChannel === 'messages'" class="container message-layout">
        <MessageConversationSidebar
          v-model:contact-keyword="contactKeyword"
          :active-conversation="activeConversation"
          :contact-role-text="contactRoleText"
          :contacts="contacts"
          :contacts-error="contactsError"
          :contacts-loading="contactsLoading"
          :conversation-error="conversationError"
          :conversation-loading="conversationLoading"
          :conversation-page="conversationPage"
          :conversations="conversations"
          :conversation-total-pages="conversationTotalPages"
          :private-unread-count="privateUnreadCount"
          :show-contacts="showContacts"
          @load-contacts="loadContacts"
          @load-conversations="loadConversations"
          @load-more-conversations="loadMoreConversations"
          @select-contact="selectContact"
          @select-conversation="selectConversation"
          @toggle-contacts="toggleContacts"
        />

        <MessageThreadPanel
          v-model:attachment-uploading="attachmentUploading"
          v-model:attachments="messageAttachments"
          v-model:draft="draft"
          v-model:stream-element="streamRef"
          :active-conversation="activeConversation"
          :active-participant="activeParticipant"
          :can-recall="canRecall"
          :can-send="canSend"
          :contact-role-text="contactRoleText"
          :is-mine="isMine"
          :message-attachment-media="messageAttachmentMedia"
          :message-error="messageError"
          :message-page="messagePage"
          :messages="messages"
          :messages-loading="messagesLoading"
          :message-total-pages="messageTotalPages"
          :sending="sending"
          :settings-busy="settingsBusy"
          @hide-message="hideMessage"
          @load-messages="loadMessages"
          @load-older-messages="loadOlderMessages"
          @recall-message="recallMessage"
          @submit-message="submitMessage"
          @toggle-muted="toggleMuted"
          @toggle-pinned="togglePinned"
        />
      </div>

      <MessageNotificationPanel
        v-else
        v-model:read-status="notificationReadStatus"
        class="container"
        :error="notificationError"
        :loading="notificationLoading"
        :marking-all-read="markingAllRead"
        :marking-notification-id="markingNotificationId"
        :notification-media="notificationMessageMedia"
        :notifications="visibleNotifications"
        :page="notificationPage"
        :total-pages="notificationTotalPages"
        :unread-count="combinedNotificationUnreadCount"
        @load-more-notifications="loadMoreNotifications"
        @mark-all-read="markAllNotificationsRead"
        @mark-notification-read="markNotificationRead"
        @reload-notifications="reloadNotifications"
      />
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ElMessage, ElMessageBox } from '@/shared/ui/feedback.js'
import { getRoleLabel, normalizeRole } from '@/entities/user/index.js'
import { getCurrentStudent } from '@/features/student-context/index.js'
import { getCurrentUser } from '@/features/authentication/index.js'
import {
  MessageConversationSidebar,
  MessageNotificationPanel,
  MessageThreadPanel
} from '@/features/messaging/ui/index.js'
import {
  contactRoleText as buildContactRoleText,
  displayUnread,
  useMessageCenterManagement
} from '@/features/messaging/index.js'

const user = getCurrentUser() || { role: 'parent' }
const roleLabel = getRoleLabel(normalizeRole(user.role))
const currentUserId = String(user.id ?? user.userId ?? '')
const currentStudent = getCurrentStudent()

const {
  activeChannel,
  activeConversation,
  activeParticipant,
  attachmentUploading,
  canRecall,
  canSend,
  combinedNotificationUnreadCount,
  contactKeyword,
  contacts,
  contactsError,
  contactsLoading,
  conversationError,
  conversationLoading,
  conversationPage,
  conversations,
  conversationTotalPages,
  draft,
  hideMessage,
  initializeMessageCenter,
  isMine,
  loadContacts,
  loadConversations,
  loadMessages,
  loadMoreConversations,
  loadMoreNotifications,
  loadOlderMessages,
  markAllNotificationsRead,
  markingAllRead,
  markingNotificationId,
  markNotificationRead,
  messageAttachmentMedia,
  messageAttachments,
  messageError,
  messagePage,
  messages,
  messagesLoading,
  messageTotalPages,
  notificationError,
  notificationLoading,
  notificationPage,
  notificationReadStatus,
  notificationTotalPages,
  openNotifications,
  privateUnreadCount,
  recallMessage,
  reloadNotifications,
  selectContact,
  selectConversation,
  sending,
  settingsBusy,
  showContacts,
  streamRef,
  submitMessage,
  toggleContacts,
  toggleMuted,
  togglePinned,
  visibleNotifications
} = useMessageCenterManagement({
  currentUserId,
  confirm: ElMessageBox.confirm,
  notify: ElMessage
})

function notificationMessageMedia(notification) {
  return messageAttachmentMedia(notification.message || {})
}

function contactRoleText(contact = {}) {
  return buildContactRoleText(contact, {
    role: normalizeRole(user.role),
    user,
    currentStudent
  })
}

onMounted(initializeMessageCenter)
</script>

<style scoped>
.module-hero { padding:104px 0 42px; background:linear-gradient(135deg,#0f172a,#1e3a5f); color:white; }
.module-hero h1 { font-size:2rem; margin:6px 0; }
.module-hero p { color:#cbd5e1; }
.eyebrow { color:#93c5fd !important; font-weight:700; }
.hero-content { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; }
.hero-unread { display:flex; gap:10px; }
.unread-summary { min-width:132px; padding:14px 18px; border:1px solid rgba(255,255,255,.2); border-radius:12px; background:rgba(255,255,255,.08); display:grid; }
.unread-summary strong { font-size:1.7rem; }
.unread-summary span { color:#cbd5e1; font-size:.82rem; }
.message-section { padding:36px 0 64px; }
.center-tabs { display:flex; gap:10px; margin-bottom:16px; }
.center-tabs button { border:1px solid var(--border); border-radius:10px; background:white; padding:10px 18px; cursor:pointer; font:inherit; font-weight:600; }
.center-tabs button.active { color:white; background:var(--primary); border-color:var(--primary); }
.center-tabs span { display:inline-flex; min-width:20px; justify-content:center; margin-left:5px; padding:1px 6px; border-radius:99px; color:white; background:#ef4444; font-size:.72rem; }
.message-layout { display:grid; grid-template-columns:330px minmax(0,1fr); gap:16px; align-items:start; }
@media (max-width:900px) {
  .hero-content { align-items:flex-start; }
  .message-layout { grid-template-columns:1fr; }
}
@media (max-width:560px) {
  .hero-content { display:grid; }
  .unread-summary { min-width:0; width:100%; }
}
</style>
