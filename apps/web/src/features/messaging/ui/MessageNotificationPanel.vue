<template>
  <div class="notification-panel">
    <header class="notification-toolbar">
      <div>
        <h2>通知</h2>
        <p>平台群发、绑定、动态及赛事等消息统一在此查看。</p>
      </div>
      <div class="notification-actions">
        <select v-model="readStatus" @change="$emit('reload-notifications')">
          <option value="">全部通知</option>
          <option value="UNREAD">仅未读</option>
          <option value="READ">仅已读</option>
        </select>
        <button
          class="btn btn-outline btn-sm"
          type="button"
          :disabled="markingAllRead || !unreadCount"
          @click="$emit('mark-all-read')"
        >
          {{ markingAllRead ? '处理中...' : '全部标为已读' }}
        </button>
      </div>
    </header>

    <div v-if="error" class="notification-state error-state">
      <span>{{ error }}</span>
      <button type="button" @click="$emit('reload-notifications')">重新加载</button>
    </div>
    <p v-else-if="loading && !notifications.length" class="notification-state">正在加载通知...</p>
    <p v-else-if="!notifications.length" class="notification-state">暂无通知</p>
    <div v-else class="notification-list">
      <article
        v-for="notification in notifications"
        :key="notification.notificationId"
        :class="['notification-item', { unread: !notification.readAt }]"
      >
        <span class="notification-dot"></span>
        <div class="notification-copy">
          <div>
            <strong>{{ notification.title || notificationTypeLabel(notification.type) }}</strong>
            <time>{{ formatTime(notification.createdAt) }}</time>
          </div>
          <p>{{ notification.content }}</p>
          <AppMediaGallery
            v-if="notification.adminBroadcast && notificationMedia(notification).length"
            class="notification-media"
            :media="notificationMedia(notification)"
          />
          <small>{{ notificationTypeLabel(notification.type) }}</small>
        </div>
        <button
          v-if="!notification.readAt"
          class="read-button"
          type="button"
          :disabled="markingNotificationId === notification.notificationId"
          @click="$emit('mark-notification-read', notification)"
        >
          {{ markingNotificationId === notification.notificationId ? '处理中...' : '标为已读' }}
        </button>
      </article>
    </div>
    <button
      v-if="page < totalPages"
      class="load-more notification-more"
      type="button"
      :disabled="loading"
      @click="$emit('load-more-notifications')"
    >
      {{ loading ? '加载中...' : '加载更多通知' }}
    </button>
  </div>
</template>

<script setup>
import AppMediaGallery from '@/components/AppMediaGallery.vue'
import {
  formatTime,
  notificationTypeLabel
} from '../lib/messageViewModel.js'

defineProps({
  error: { type: String, default: '' },
  loading: Boolean,
  markingAllRead: Boolean,
  markingNotificationId: { type: [Number, String], default: null },
  notificationMedia: { type: Function, required: true },
  notifications: { type: Array, default: () => [] },
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  unreadCount: { type: Number, default: 0 }
})

defineEmits([
  'load-more-notifications',
  'mark-all-read',
  'mark-notification-read',
  'reload-notifications'
])

const readStatus = defineModel('readStatus', { type: String, default: '' })
</script>

<style scoped>
.notification-panel { padding:22px; border:1px solid var(--border); border-radius:12px; background:white; }
.notification-toolbar { display:flex; align-items:center; justify-content:space-between; gap:18px; padding-bottom:18px; border-bottom:1px solid var(--border); }
.notification-toolbar h2 { margin:0 0 4px; }
.notification-toolbar p { color:var(--text-secondary); font-size:.86rem; }
.notification-actions { display:flex; gap:10px; }
.notification-actions select { padding:8px 12px; border:1px solid var(--border); border-radius:8px; background:white; }
.notification-list { display:grid; }
.notification-item { display:grid; grid-template-columns:8px 1fr auto; align-items:start; gap:13px; padding:18px 4px; border-bottom:1px solid var(--border); }
.notification-item.unread { background:#f8fbff; }
.notification-dot { width:8px; height:8px; margin-top:7px; border-radius:50%; background:#cbd5e1; }
.notification-item.unread .notification-dot { background:#2563eb; }
.notification-copy > div { display:flex; justify-content:space-between; gap:16px; }
.notification-copy time, .notification-copy small { color:var(--text-secondary); font-size:.76rem; }
.notification-copy p { margin:6px 0; color:var(--text-secondary); line-height:1.7; white-space:pre-wrap; }
.notification-media { width:min(520px,100%); margin:10px 0; }
.notification-media:deep(.app-media-gallery) { margin:0; }
.read-button, .notification-state button { border:0; background:transparent; color:var(--primary); cursor:pointer; font:inherit; font-size:.82rem; }
.notification-state { display:flex; align-items:center; justify-content:center; gap:10px; min-height:180px; color:var(--text-secondary); }
.notification-state.error-state { color:#b91c1c; }
.load-more { padding:8px; border:1px solid var(--border); border-radius:8px; background:white; color:var(--color-brand); cursor:pointer; }
.notification-more { display:block; margin:18px auto 0; }
</style>
