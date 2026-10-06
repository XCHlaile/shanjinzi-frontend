<template>
  <aside class="conversation-list">
    <div class="sidebar-heading">
      <div><strong>最近会话</strong><span v-if="privateUnreadCount">{{ privateUnreadCount }} 条未读</span></div>
      <button class="new-chat-button" type="button" @click="$emit('toggle-contacts')">
        {{ showContacts ? '返回会话' : '+ 发起私信' }}
      </button>
    </div>

    <template v-if="showContacts">
      <form class="contact-search" @submit.prevent="$emit('load-contacts')">
        <input v-model.trim="contactKeyword" aria-label="搜索联系人" placeholder="姓名或昵称" />
        <button type="submit" :disabled="contactsLoading">搜索</button>
      </form>
      <p class="scope-tip">仅显示当前账号按业务关系允许联系的用户。</p>
      <div v-if="contactsError" class="sidebar-state error-state">
        <span>{{ contactsError }}</span><button type="button" @click="$emit('load-contacts')">重试</button>
      </div>
      <p v-else-if="contactsLoading" class="sidebar-state">正在加载联系人...</p>
      <AppVirtualList
        v-else-if="contacts.length"
        class="sidebar-virtual-list"
        aria-label="联系人列表"
        :items="contacts"
        :item-height="67"
      >
        <template #default="{ item: contact }">
          <button class="contact-item" type="button" @click="$emit('select-contact', contact)">
            <span class="avatar">
              <img v-if="contact.avatarUrl" :src="contact.avatarUrl" alt="" width="42" height="42" loading="lazy" decoding="async" /><span v-else>{{ contactInitial(contact) }}</span>
            </span>
            <span class="contact-copy"><strong>{{ contactName(contact) }}</strong><small>{{ contactRoleText(contact) }}</small></span>
          </button>
        </template>
      </AppVirtualList>
      <p v-if="!contactsLoading && !contactsError && !contacts.length" class="sidebar-state">暂无可联系用户</p>
    </template>

    <template v-else>
      <div v-if="conversationError" class="sidebar-state error-state">
        <span>{{ conversationError }}</span><button type="button" @click="$emit('load-conversations')">重试</button>
      </div>
      <p v-else-if="conversationLoading && !conversations.length" class="sidebar-state">正在加载会话...</p>
      <AppVirtualList
        v-else-if="conversations.length"
        class="sidebar-virtual-list"
        aria-label="最近会话列表"
        item-key="conversationId"
        :items="conversations"
        :item-height="70"
      >
        <template #default="{ item: conversation }">
          <button
            :class="['conversation-item', { active: activeConversation?.conversationId === conversation.conversationId }]"
            type="button"
            @click="$emit('select-conversation', conversation)"
          >
            <span class="avatar">
              <img v-if="conversation.participant?.avatarUrl" :src="conversation.participant.avatarUrl" alt="" width="42" height="42" loading="lazy" decoding="async" />
              <span v-else>{{ contactInitial(conversation.participant) }}</span>
            </span>
            <span class="conversation-copy">
              <span class="conversation-line"><strong>{{ contactName(conversation.participant) }}</strong><time>{{ formatShortTime(conversation.lastMessageAt) }}</time></span>
              <span class="conversation-line preview-line">
                <small>{{ conversation.lastMessagePreview || '暂无消息内容' }}</small>
                <span class="conversation-marks">
                  <i v-if="conversation.pinned">置顶</i><i v-if="conversation.muted">静音</i>
                  <b v-if="conversation.unreadCount">{{ displayUnread(conversation.unreadCount) }}</b>
                </span>
              </span>
            </span>
          </button>
        </template>
      </AppVirtualList>
      <p v-if="!conversationLoading && !conversationError && !conversations.length" class="sidebar-state">
        暂无会话，点击“发起私信”查找联系人
      </p>
      <button
        v-if="conversationPage < conversationTotalPages"
        class="load-more"
        type="button"
        :disabled="conversationLoading"
        @click="$emit('load-more-conversations')"
      >
        {{ conversationLoading ? '加载中...' : '加载更多会话' }}
      </button>
    </template>
  </aside>
</template>

<script setup>
import AppVirtualList from '@/components/AppVirtualList.vue'
import {
  contactInitial,
  contactName,
  displayUnread,
  formatShortTime
} from '../lib/messageViewModel.js'

defineProps({
  activeConversation: { type: Object, default: null },
  contactRoleText: { type: Function, required: true },
  contacts: { type: Array, default: () => [] },
  contactsError: { type: String, default: '' },
  contactsLoading: Boolean,
  conversationError: { type: String, default: '' },
  conversationLoading: Boolean,
  conversationPage: { type: Number, default: 1 },
  conversations: { type: Array, default: () => [] },
  conversationTotalPages: { type: Number, default: 1 },
  privateUnreadCount: { type: Number, default: 0 },
  showContacts: Boolean
})

defineEmits([
  'load-contacts',
  'load-conversations',
  'load-more-conversations',
  'select-contact',
  'select-conversation',
  'toggle-contacts'
])

const contactKeyword = defineModel('contactKeyword', { type: String, default: '' })
</script>

<style scoped>
.conversation-list { display:flex; flex-direction:column; min-height:620px; height:min(720px,calc(100vh - 180px)); overflow:hidden; border:1px solid var(--border); border-radius:12px; background:white; box-shadow:var(--shadow-xs); }
.sidebar-heading { position:sticky; top:0; z-index:2; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px; border-bottom:1px solid var(--border); background:white; }
.sidebar-heading > div { display:grid; gap:2px; }
.sidebar-heading span { color:var(--text-secondary); font-size:.75rem; }
.new-chat-button, .contact-search button, .sidebar-state button { border:0; background:transparent; color:var(--color-brand); cursor:pointer; font:inherit; }
.new-chat-button { font-size:.8rem; font-weight:700; }
.contact-search { display:flex; gap:8px; padding:12px 12px 4px; }
.contact-search input { min-width:0; flex:1; padding:9px 10px; border:1px solid var(--border); border-radius:8px; font:inherit; }
.contact-search input:focus { border-color:var(--color-brand); box-shadow:0 0 0 3px #dbeafe; }
.contact-search button { padding:0 4px; font-size:.82rem; }
.scope-tip { margin:4px 12px 10px; color:var(--text-muted); font-size:.72rem; line-height:1.5; }
.sidebar-state { margin:12px; padding:16px; border-radius:8px; background:#f8fafc; color:var(--text-secondary); font-size:.82rem; line-height:1.6; text-align:center; }
.sidebar-state.error-state { display:grid; gap:6px; background:#fef2f2; color:#b91c1c; }
.contact-item, .conversation-item { display:flex; align-items:center; gap:10px; width:100%; padding:12px; border:0; border-bottom:1px solid var(--border-light); background:white; color:inherit; text-align:left; cursor:pointer; transition:background .15s ease; }
.sidebar-virtual-list { flex:1; }
.contact-item:hover, .conversation-item:hover, .conversation-item.active { background:#eff6ff; }
.contact-item:focus-visible, .conversation-item:focus-visible, .load-more:focus-visible, .new-chat-button:focus-visible { position:relative; z-index:1; outline:3px solid color-mix(in srgb,var(--color-brand) 28%,transparent); outline-offset:-3px; }
.conversation-item.active { box-shadow:inset 3px 0 0 var(--color-brand); }
.avatar { display:grid; place-items:center; flex:0 0 auto; width:42px; height:42px; overflow:hidden; border-radius:50%; background:linear-gradient(135deg,#dbeafe,#ede9fe); color:#4338ca; font-weight:700; }
.avatar img { width:100%; height:100%; object-fit:cover; }
.contact-copy, .conversation-copy { display:grid; flex:1; gap:3px; min-width:0; }
.contact-copy small, .conversation-copy small { overflow:hidden; color:var(--text-secondary); text-overflow:ellipsis; white-space:nowrap; }
.conversation-line { display:flex; align-items:center; justify-content:space-between; gap:8px; min-width:0; }
.conversation-line time { flex:0 0 auto; color:var(--text-muted); font-size:.7rem; }
.preview-line small { min-width:0; }
.conversation-marks { display:flex; align-items:center; flex:0 0 auto; gap:4px; }
.conversation-marks i { padding:1px 4px; border-radius:4px; background:#f1f5f9; color:var(--text-muted); font-size:.62rem; font-style:normal; }
.conversation-marks b { display:grid; place-items:center; min-width:20px; height:20px; padding:0 5px; border-radius:10px; background:#ef4444; color:white; font-size:.65rem; }
.load-more { width:calc(100% - 24px); margin:10px 12px; padding:8px; border:1px solid var(--border); border-radius:8px; background:white; color:var(--color-brand); cursor:pointer; }
@media (max-width:900px) {
  .conversation-list { min-height:220px; height:420px; }
}
</style>
