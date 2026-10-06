<template>
  <div class="comment-panel">
    <p v-if="loading" class="comment-state">正在加载评论...</p>
    <p v-else-if="error" class="comment-state error-text">{{ error }}</p>
    <p v-else-if="!comments.length" class="comment-state">暂无评论</p>
    <div v-for="comment in comments" v-else :key="comment.commentId" class="comment-row">
      <div><strong>{{ comment.authorName || '用户' }}</strong><span>{{ formatTime(comment.createdAt) }}</span></div>
      <p v-if="comment.content">{{ comment.content }}</p>
      <AppMediaGallery :media="comment.media || []" />
      <button
        v-if="canDeleteComment(comment)"
        class="danger-link"
        type="button"
        :disabled="deletingCommentId === comment.commentId"
        @click="$emit('delete-comment', comment)"
      >
        {{ deletingCommentId === comment.commentId ? '删除中...' : '删除我的评论' }}
      </button>
      <button
        v-else
        class="secondary-link"
        type="button"
        :disabled="reportingTarget === `comment-${comment.commentId}`"
        @click="$emit('report-comment', comment)"
      >
        {{ reportingTarget === `comment-${comment.commentId}` ? '提交中...' : '举报评论' }}
      </button>
    </div>
    <form class="comment-form" @submit.prevent="$emit('submit-comment')">
      <div class="comment-inputs">
        <input v-model.trim="text" maxlength="2000" placeholder="输入评论，或仅上传图片、视频..." />
        <AppFileUploader
          v-model="media"
          source-type="moment"
          compact-preview
          :disabled="submitting"
          @uploading-change="uploading = $event"
        />
      </div>
      <button class="btn btn-primary btn-xs" type="submit" :disabled="submitting || uploading || !canSubmit">
        {{ submitting ? '提交中...' : '评论' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import AppFileUploader from '@/components/AppFileUploader.vue'
import AppMediaGallery from '@/components/AppMediaGallery.vue'

defineProps({
  canDeleteComment: { type: Function, required: true },
  canSubmit: Boolean,
  comments: { type: Array, default: () => [] },
  deletingCommentId: { type: [Number, String], default: null },
  error: { type: String, default: '' },
  formatTime: { type: Function, required: true },
  loading: Boolean,
  reportingTarget: { type: String, default: '' },
  submitting: Boolean
})

defineEmits(['delete-comment', 'report-comment', 'submit-comment'])

const media = defineModel('media', { type: Array, default: () => [] })
const text = defineModel('text', { type: String, default: '' })
const uploading = defineModel('uploading', { type: Boolean })
</script>

<style scoped>
.comment-panel { margin-top:14px; padding:12px; border-radius:8px; background:#f8fafc; }
.comment-row { position:relative; padding:10px 0; border-bottom:1px solid var(--border); }
.comment-row > div { display:flex; justify-content:space-between; gap:12px; }
.comment-row span { color:var(--text-secondary); font-size:.75rem; }
.comment-row p { margin:5px 0; white-space:pre-wrap; }
.comment-state { padding:10px; color:var(--text-secondary); text-align:center; }
.error-text { color:#b91c1c; }
.comment-form { display:flex; align-items:flex-start; gap:8px; margin-top:12px; }
.comment-inputs { display:grid; flex:1; gap:8px; min-width:0; }
.comment-form input { width:100%; padding:10px 12px; border:1.5px solid var(--border); border-radius:8px; outline:none; font:inherit; }
.comment-form input:focus { border-color:var(--primary); }
.comment-form > button { min-height:42px; }
.danger-link, .secondary-link { border:0; background:transparent; cursor:pointer; font:inherit; font-size:.78rem; }
.danger-link { color:#dc2626; }
.secondary-link { color:#b45309; }
.danger-link:disabled, .secondary-link:disabled { cursor:not-allowed; opacity:.55; }
.btn-xs { padding:7px 14px; font-size:.8rem; }
</style>
