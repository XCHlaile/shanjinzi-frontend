<template>
  <div class="topic-detail">
    <p class="fp-body">{{ topicDetail?.content || topic.contentSummary }}</p>
    <div class="topic-metrics">
      <span>浏览 {{ topicDetail?.viewsCount ?? topic.viewsCount ?? 0 }}</span>
      <span>回复 {{ topic.repliesCount ?? 0 }}</span>
    </div>

    <div v-if="loading && !replies.length" class="reply-state">正在加载回复...</div>
    <div v-else-if="replies.length" class="fp-replies">
      <div v-for="reply in replies" :key="reply.replyId" class="fp-reply">
        <div class="reply-meta">
          <div class="reply-author">
            <img
              v-if="avatarSrc(reply.author)"
              class="reply-avatar reply-avatar-image"
              :src="avatarSrc(reply.author)"
              :alt="`${authorName(reply.author)}的头像`"
              width="30"
              height="30"
              loading="lazy"
              decoding="async"
            />
            <div v-else class="reply-avatar">{{ authorInitial(reply.author) }}</div>
            <strong>{{ authorName(reply.author) }}</strong>
          </div>
          <span>{{ roleLabel(reply.author?.role) }} · {{ formatTime(reply.createdAt) }}</span>
        </div>
        <form v-if="editingReplyId === reply.replyId" class="reply-edit-form" @submit.prevent="$emit('submit-reply-edit', reply)">
          <textarea v-model.trim="replyEditText" rows="3" required></textarea>
          <AppFileUploader
            v-model="replyEditMedia"
            source-type="forum"
            compact-preview
            :disabled="updatingReplyId === reply.replyId"
            @uploading-change="replyEditUploading = $event"
          />
          <div>
            <button class="btn btn-primary btn-xs" type="submit" :disabled="updatingReplyId === reply.replyId || replyEditUploading">
              {{ updatingReplyId === reply.replyId ? '保存中...' : '保存' }}
            </button>
            <button class="btn btn-outline btn-xs" type="button" :disabled="updatingReplyId === reply.replyId" @click="$emit('cancel-reply-edit')">取消</button>
          </div>
        </form>
        <p v-else>{{ reply.content }}</p>
        <AppMediaGallery :media="reply.media || []" />
        <div class="reply-actions">
          <button v-if="isOwnReply(reply)" class="edit-link" type="button" @click="$emit('start-edit-reply', reply)">编辑回复</button>
          <button
            v-if="isOwnReply(reply)"
            class="danger-link"
            type="button"
            :disabled="deletingReplyId === reply.replyId"
            @click="$emit('delete-reply', reply)"
          >
            {{ deletingReplyId === reply.replyId ? '删除中...' : '删除我的回复' }}
          </button>
          <button
            v-else
            class="report-link"
            type="button"
            :disabled="reportingTarget === `reply-${reply.replyId}`"
            @click="$emit('report-reply', reply)"
          >
            {{ reportingTarget === `reply-${reply.replyId}` ? '提交中...' : '举报回复' }}
          </button>
        </div>
      </div>
      <button v-if="canLoadMore" class="load-more" type="button" :disabled="loading" @click="$emit('load-more')">
        {{ loading ? '加载中...' : '加载更多回复' }}
      </button>
    </div>
    <p v-else class="reply-state">暂无回复，欢迎参与讨论</p>

    <form class="reply-form" @submit.prevent="$emit('submit-reply')">
      <div class="reply-inputs">
        <input v-model.trim="replyText" placeholder="输入回复或仅上传图片、视频..." />
        <AppFileUploader
          :model-value="replyMedia"
          source-type="forum"
          compact-preview
          @update:model-value="$emit('update-reply-media', $event)"
          @uploading-change="$emit('update-reply-uploading', $event)"
        />
      </div>
      <button class="btn btn-primary btn-xs" type="submit" :disabled="!canSubmit || replying || uploading">
        {{ replying ? '提交中...' : '回复' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import AppFileUploader from '@/components/AppFileUploader.vue'
import AppMediaGallery from '@/components/AppMediaGallery.vue'
import {
  forumAuthorInitial as authorInitial,
  forumAuthorName as authorName,
  formatForumTime as formatTime,
  forumRoleLabel as roleLabel
} from '../lib/forumViewModel.js'

defineProps({
  avatarSrc: { type: Function, required: true },
  canLoadMore: Boolean,
  canSubmit: Boolean,
  deletingReplyId: { type: [Number, String], default: null },
  editingReplyId: { type: [Number, String], default: null },
  isOwnReply: { type: Function, required: true },
  loading: Boolean,
  replies: { type: Array, default: () => [] },
  replying: Boolean,
  replyMedia: { type: Array, default: () => [] },
  reportingTarget: { type: String, default: '' },
  topic: { type: Object, required: true },
  topicDetail: { type: Object, default: null },
  updatingReplyId: { type: [Number, String], default: null },
  uploading: Boolean
})

defineEmits([
  'cancel-reply-edit', 'delete-reply', 'load-more', 'report-reply',
  'start-edit-reply', 'submit-reply', 'submit-reply-edit',
  'update-reply-media', 'update-reply-uploading'
])

const replyEditMedia = defineModel('replyEditMedia', { type: Array, default: () => [] })
const replyEditText = defineModel('replyEditText', { type: String, default: '' })
const replyEditUploading = defineModel('replyEditUploading', { type: Boolean })
const replyText = defineModel('replyText', { type: String, default: '' })
</script>

<style scoped>
.topic-detail { margin-top:10px; }
.fp-body { margin-bottom:10px; padding:14px; border-radius:var(--radius); background:var(--bg-muted); color:var(--text-secondary); font-size:.9rem; line-height:1.8; white-space:pre-wrap; }
.topic-metrics { display:flex; gap:16px; margin:8px 0; color:var(--text-secondary); font-size:.78rem; }
.fp-replies { margin-bottom:10px; padding:8px 14px; border-radius:var(--radius); background:var(--bg-muted); }
.fp-reply { padding:10px 0; border-bottom:1px solid var(--border); font-size:.85rem; content-visibility:auto; contain-intrinsic-size:auto 120px; }
.fp-reply:last-of-type { border-bottom:none; }
.fp-reply p { margin:5px 0 0; line-height:1.6; white-space:pre-wrap; }
.reply-meta { display:flex; justify-content:space-between; gap:12px; }
.reply-author { display:flex; align-items:center; gap:8px; min-width:0; }
.reply-avatar { display:grid; place-items:center; flex:0 0 30px; width:30px; height:30px; overflow:hidden; border-radius:50%; background:linear-gradient(135deg,#2563eb,#06b6d4); color:white; font-size:.72rem; font-weight:700; }
.reply-avatar-image { object-fit:cover; }
.reply-meta strong { color:var(--text); }
.reply-meta span { color:var(--text-secondary); font-size:.76rem; }
.reply-edit-form { display:grid; gap:8px; margin-top:8px; }
.reply-edit-form textarea { width:100%; padding:8px 10px; resize:vertical; border:1.5px solid var(--border); border-radius:var(--radius); font:inherit; }
.reply-edit-form div, .reply-actions { display:flex; justify-content:flex-end; gap:8px; }
.reply-actions { margin-top:4px; }
.danger-link, .edit-link, .report-link { border:0; background:transparent; cursor:pointer; font:inherit; font-size:.78rem; }
.danger-link { color:#dc2626; }
.edit-link { color:var(--primary); }
.report-link { color:#b45309; }
.danger-link:disabled, .report-link:disabled { cursor:not-allowed; opacity:.55; }
.reply-state { padding:12px; color:var(--text-secondary); font-size:.85rem; text-align:center; }
.load-more { display:block; margin:8px auto 0; border:0; background:transparent; color:var(--primary); cursor:pointer; }
.reply-form { display:flex; align-items:flex-start; gap:8px; margin:10px 0 12px; }
.reply-inputs { display:grid; flex:1; gap:6px; min-width:0; }
.reply-form input { min-width:0; padding:8px 12px; border:1.5px solid var(--border); border-radius:var(--radius); font-size:.85rem; outline:none; }
.reply-form input:focus { border-color:var(--primary); }
.reply-form > button[type="submit"] { display:flex; align-items:center; justify-content:center; align-self:flex-start; flex:0 0 64px; box-sizing:border-box; width:64px; height:40px; padding:0; }
.btn:disabled { cursor:not-allowed; opacity:.6; }
.btn-xs { padding:6px 14px; font-size:.82rem; }
@media (max-width:640px) { .reply-meta { flex-direction:column; gap:2px; } }
</style>
