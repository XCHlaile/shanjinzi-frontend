<template>
  <article class="forum-post">
    <div class="fp-header">
      <img
        v-if="avatarSrc(topic.author)"
        class="fp-avatar fp-avatar-image"
        :src="avatarSrc(topic.author)"
        :alt="`${authorName(topic.author)}的头像`"
        width="38"
        height="38"
        loading="lazy"
        decoding="async"
      />
      <div v-else class="fp-avatar">{{ authorInitial(topic.author) }}</div>
      <div class="fp-meta">
        <strong>{{ authorName(topic.author) }}</strong>
        <span>{{ roleLabel(topic.author?.role) }} · {{ formatTime(topic.createdAt) }}</span>
      </div>
      <span v-if="topic.pinned" class="fp-pinned">置顶</span>
      <span class="fp-tag">#{{ topic.tag }}</span>
      <button
        v-if="topicScope === 'mine'"
        class="edit-link"
        type="button"
        :disabled="updatingTopicId === topic.topicId"
        @click="$emit('start-edit-topic', topic)"
      >
        编辑
      </button>
      <button
        v-if="topicScope === 'mine'"
        class="danger-link"
        type="button"
        :disabled="deletingTopicId === topic.topicId"
        @click="$emit('delete-topic', topic)"
      >
        {{ deletingTopicId === topic.topicId ? '删除中...' : '删除' }}
      </button>
    </div>

    <h4 class="fp-title" @click="$emit('toggle-topic', topic)">{{ topic.title }}</h4>
    <p v-if="topic.contentSummary && expandedTopicId !== topic.topicId" class="fp-summary">
      {{ topic.contentSummary }}
    </p>
    <AppMediaGallery :media="forumMedia(topic)" />

    <form
      v-if="editingTopicId === topic.topicId"
      class="post-form topic-edit-form"
      @submit.prevent="$emit('submit-topic-edit', topic)"
    >
      <h3>编辑话题</h3>
      <select v-model="topicEditForm.tag" class="form-input" required>
        <option disabled value="">选择话题标签</option>
        <option v-for="tag in FORUM_TOPIC_TAGS" :key="tag" :value="tag">#{{ tag }}</option>
      </select>
      <input v-model.trim="topicEditForm.title" class="form-input" placeholder="话题标题" required />
      <textarea v-model.trim="topicEditForm.content" class="form-input form-textarea" rows="5" required></textarea>
      <AppFileUploader
        v-model="topicEditMedia"
        source-type="forum"
        compact-preview
        :disabled="updatingTopicId === topic.topicId"
        @uploading-change="topicEditUploading = $event"
      />
      <div class="form-actions">
        <button class="btn btn-primary btn-sm" type="submit" :disabled="updatingTopicId === topic.topicId || topicEditUploading">
          {{ updatingTopicId === topic.topicId ? '保存中...' : '保存修改' }}
        </button>
        <button class="btn btn-outline btn-sm" type="button" :disabled="updatingTopicId === topic.topicId" @click="$emit('cancel-topic-edit')">取消</button>
      </div>
    </form>

    <ForumReplyThread
      v-if="expandedTopicId === topic.topicId"
      v-model:reply-edit-media="replyEditMedia"
      v-model:reply-edit-text="replyEditText"
      v-model:reply-edit-uploading="replyEditUploading"
      v-model:reply-text="replyTexts[topic.topicId]"
      :avatar-src="avatarSrc"
      :can-load-more="canLoadMoreReplies(topic.topicId)"
      :can-submit="canSubmitReply(topic.topicId)"
      :deleting-reply-id="deletingReplyId"
      :editing-reply-id="editingReplyId"
      :is-own-reply="isOwnReply"
      :loading="replyLoading[topic.topicId]"
      :replies="repliesByTopic[topic.topicId] || []"
      :replying="replyingTopicId === topic.topicId"
      :reply-media="replyMediaByTopic[topic.topicId] || []"
      :reporting-target="reportingTarget"
      :topic="topic"
      :topic-detail="topicDetails[topic.topicId]"
      :updating-reply-id="updatingReplyId"
      :uploading="replyUploading[topic.topicId]"
      @cancel-reply-edit="$emit('cancel-reply-edit')"
      @delete-reply="$emit('delete-reply', topic, $event)"
      @load-more="$emit('load-more-replies', topic.topicId)"
      @report-reply="$emit('report-reply', topic, $event)"
      @start-edit-reply="$emit('start-edit-reply', $event)"
      @submit-reply="$emit('submit-reply', topic)"
      @submit-reply-edit="$emit('submit-reply-edit', topic, $event)"
      @update-reply-media="$emit('set-reply-media', topic.topicId, $event)"
      @update-reply-uploading="$emit('set-reply-uploading', topic.topicId, $event)"
    />

    <div class="fp-actions">
      <button
        :class="['fp-btn', { liked: topic.likedByMe }]"
        type="button"
        :disabled="likingTopicId === topic.topicId"
        @click="$emit('toggle-like', topic)"
      >
        {{ topic.likedByMe ? '❤️' : '🤍' }} {{ topic.likesCount ?? 0 }}
      </button>
      <button class="fp-btn" type="button" @click="$emit('toggle-topic', topic)">💬 {{ topic.repliesCount ?? 0 }}</button>
      <button
        v-if="topicScope !== 'mine'"
        class="fp-btn report-button"
        type="button"
        :disabled="reportingTarget === `topic-${topic.topicId}`"
        @click="$emit('report-topic', topic)"
      >
        {{ reportingTarget === `topic-${topic.topicId}` ? '提交中...' : '举报' }}
      </button>
      <span class="fp-views">👁 {{ topic.viewsCount ?? 0 }}</span>
    </div>
  </article>
</template>

<script setup>
import AppFileUploader from '@/components/AppFileUploader.vue'
import AppMediaGallery from '@/components/AppMediaGallery.vue'
import ForumReplyThread from './ForumReplyThread.vue'
import {
  FORUM_TOPIC_TAGS,
  forumAuthorInitial as authorInitial,
  forumAuthorName as authorName,
  formatForumTime as formatTime,
  forumRoleLabel as roleLabel
} from '../lib/forumViewModel.js'

defineProps({
  avatarSrc: { type: Function, required: true },
  canLoadMoreReplies: { type: Function, required: true },
  canSubmitReply: { type: Function, required: true },
  deletingReplyId: { type: [Number, String], default: null },
  deletingTopicId: { type: [Number, String], default: null },
  editingReplyId: { type: [Number, String], default: null },
  editingTopicId: { type: [Number, String], default: null },
  expandedTopicId: { type: [Number, String], default: null },
  forumMedia: { type: Function, required: true },
  isOwnReply: { type: Function, required: true },
  likingTopicId: { type: [Number, String], default: null },
  repliesByTopic: { type: Object, required: true },
  replyingTopicId: { type: [Number, String], default: null },
  replyLoading: { type: Object, required: true },
  replyMediaByTopic: { type: Object, required: true },
  replyUploading: { type: Object, required: true },
  reportingTarget: { type: String, default: '' },
  topic: { type: Object, required: true },
  topicDetails: { type: Object, required: true },
  topicScope: { type: String, required: true },
  updatingReplyId: { type: [Number, String], default: null },
  updatingTopicId: { type: [Number, String], default: null }
})

defineEmits([
  'cancel-reply-edit',
  'cancel-topic-edit',
  'delete-reply',
  'delete-topic',
  'load-more-replies',
  'report-reply',
  'report-topic',
  'set-reply-media',
  'set-reply-uploading',
  'start-edit-reply',
  'start-edit-topic',
  'submit-reply',
  'submit-reply-edit',
  'submit-topic-edit',
  'toggle-like',
  'toggle-topic'
])

const replyEditMedia = defineModel('replyEditMedia', { type: Array, default: () => [] })
const replyEditText = defineModel('replyEditText', { type: String, default: '' })
const replyEditUploading = defineModel('replyEditUploading', { type: Boolean })
const replyTexts = defineModel('replyTexts', { type: Object, required: true })
const topicEditForm = defineModel('topicEditForm', { type: Object, required: true })
const topicEditMedia = defineModel('topicEditMedia', { type: Array, default: () => [] })
const topicEditUploading = defineModel('topicEditUploading', { type: Boolean })
</script>

<style scoped>
.forum-post { margin-bottom:12px; padding:18px 20px; border:1px solid var(--border); border-radius:var(--radius-lg); background:white; content-visibility:auto; contain-intrinsic-size:auto 360px; }
.fp-header { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
.fp-avatar { display:flex; align-items:center; justify-content:center; flex-shrink:0; width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#2563eb,#06b6d4); color:white; font-size:.9rem; font-weight:600; }
.fp-avatar-image { object-fit:cover; }
.fp-meta { flex:1; min-width:0; }
.fp-meta strong { display:block; font-size:.9rem; }
.fp-meta span { color:var(--text-secondary); font-size:.78rem; }
.fp-tag, .fp-pinned { padding:2px 10px; border-radius:10px; background:var(--bg-muted); color:var(--text-secondary); font-size:.76rem; white-space:nowrap; }
.fp-pinned { background:#fff7ed; color:#ea580c; }
.danger-link, .edit-link, .report-link { border:0; background:transparent; cursor:pointer; font:inherit; font-size:.78rem; }
.danger-link { color:#dc2626; }
.edit-link { color:var(--primary); }
.report-link, .report-button { color:#b45309; }
.danger-link:disabled, .edit-link:disabled, .report-link:disabled { cursor:not-allowed; opacity:.55; }
.fp-title { margin:10px 0 6px; color:var(--text); font-size:1rem; font-weight:600; cursor:pointer; }
.fp-title:hover { color:var(--primary); }
.fp-summary { margin:0 0 10px; color:var(--text-secondary); font-size:.88rem; line-height:1.7; }
.post-form { padding:20px; border:1px solid var(--border); border-radius:var(--radius-lg); background:var(--bg-muted); }
.post-form h3 { margin-bottom:12px; font-size:1rem; }
.topic-edit-form { margin:12px 0; }
.form-input { width:100%; margin-bottom:10px; padding:10px 12px; border:1.5px solid var(--border); border-radius:var(--radius); background:white; font-size:.9rem; outline:none; }
.form-input:focus { border-color:var(--primary); }
.form-textarea { min-height:100px; resize:vertical; font-family:inherit; }
.form-actions { display:flex; gap:10px; }
.fp-actions { display:flex; align-items:center; gap:12px; padding-top:8px; border-top:1px solid var(--border); }
.fp-btn { padding:4px 8px; border:0; border-radius:6px; background:none; color:var(--text-secondary); font-size:.85rem; cursor:pointer; transition:all .2s; }
.fp-btn:hover { background:var(--bg-muted); }
.fp-btn.liked { color:#ef4444; }
.fp-views { margin-left:auto; color:var(--text-secondary); font-size:.82rem; }
.btn:disabled, .fp-btn:disabled { cursor:not-allowed; opacity:.6; }
.btn-sm { padding:8px 18px; font-size:.85rem; }
@media (max-width:640px) {
  .fp-header { flex-wrap:wrap; }
  .fp-meta { min-width:calc(100% - 52px); }
}
</style>
