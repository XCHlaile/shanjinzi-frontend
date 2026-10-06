<template>
  <article :id="`moment-${item.id}`" :class="['activity-card', { 'source-target': sourceTarget }]">
    <div class="activity-head">
      <div>
        <strong>{{ item.author }}</strong>
        <span>{{ item.className }} · {{ formatTime(item.publishedAt) }}</span>
      </div>
      <div class="head-actions">
        <em>{{ item.mediaType }}</em>
        <button
          v-if="canReport"
          class="secondary-link"
          type="button"
          :disabled="reportingTarget === `moment-${item.id}`"
          @click="$emit('report')"
        >
          {{ reportingTarget === `moment-${item.id}` ? '提交中...' : '举报动态' }}
        </button>
        <button v-if="isOwnList" class="secondary-link" type="button" :disabled="updating" @click="$emit('start-edit')">
          编辑动态
        </button>
        <button v-if="isOwnList" class="danger-link" type="button" :disabled="deleting" @click="$emit('delete')">
          {{ deleting ? '删除中...' : '删除动态' }}
        </button>
      </div>
    </div>
    <form v-if="editing" class="moment-edit-form" @submit.prevent="$emit('save-edit')">
      <textarea v-model.trim="editForm.content" maxlength="10000" rows="4"></textarea>
      <AppFileUploader
        v-model="editMedia"
        source-type="moment"
        :disabled="updating"
        @uploading-change="editUploading = $event"
      />
      <div class="edit-actions">
        <button class="btn btn-primary btn-xs" type="submit" :disabled="updating || editUploading || !canSave">
          {{ updating ? '保存中...' : '保存修改' }}
        </button>
        <button class="btn btn-outline btn-xs" type="button" :disabled="updating" @click="$emit('cancel-edit')">取消</button>
      </div>
    </form>
    <p v-else-if="item.content">{{ item.content }}</p>
    <AppMediaGallery :media="item.media" />
    <div class="activity-metrics">
      <button :class="['like-button', { liked: item.likedByMe }]" type="button" :disabled="liking" @click="$emit('toggle-like')">
        {{ item.likedByMe ? '❤️' : '🤍' }} {{ item.likes }}
      </button>
      <button type="button" @click="$emit('toggle-comments')">
        评论 {{ item.comments }} · {{ commentsActive ? '收起' : '查看' }}
      </button>
    </div>

    <ActivityCommentsPanel
      v-if="commentsActive"
      v-model:media="commentMedia"
      v-model:text="commentText"
      v-model:uploading="commentUploading"
      :can-delete-comment="canDeleteComment"
      :can-submit="canSubmitComment"
      :comments="comments"
      :deleting-comment-id="deletingCommentId"
      :error="commentError"
      :format-time="formatTime"
      :loading="commentLoading"
      :reporting-target="reportingTarget"
      :submitting="commentSubmitting"
      @delete-comment="$emit('delete-comment', $event)"
      @report-comment="$emit('report-comment', $event)"
      @submit-comment="$emit('submit-comment')"
    />
  </article>
</template>

<script setup>
import AppFileUploader from '@/components/AppFileUploader.vue'
import AppMediaGallery from '@/components/AppMediaGallery.vue'
import ActivityCommentsPanel from './ActivityCommentsPanel.vue'

defineProps({
  canDeleteComment: { type: Function, required: true },
  canReport: Boolean,
  canSave: Boolean,
  canSubmitComment: Boolean,
  commentError: { type: String, default: '' },
  commentLoading: Boolean,
  comments: { type: Array, default: () => [] },
  commentsActive: Boolean,
  commentSubmitting: Boolean,
  deleting: Boolean,
  deletingCommentId: { type: [Number, String], default: null },
  editing: Boolean,
  formatTime: { type: Function, required: true },
  isOwnList: Boolean,
  item: { type: Object, required: true },
  liking: Boolean,
  reportingTarget: { type: String, default: '' },
  sourceTarget: Boolean,
  updating: Boolean
})

defineEmits([
  'cancel-edit', 'delete', 'delete-comment', 'report', 'report-comment',
  'save-edit', 'start-edit', 'submit-comment', 'toggle-comments', 'toggle-like'
])

const commentMedia = defineModel('commentMedia', { type: Array, default: () => [] })
const commentText = defineModel('commentText', { type: String, default: '' })
const commentUploading = defineModel('commentUploading', { type: Boolean })
const editForm = defineModel('editForm', { type: Object, required: true })
const editMedia = defineModel('editMedia', { type: Array, default: () => [] })
const editUploading = defineModel('editUploading', { type: Boolean })
</script>

<style scoped>
.activity-card { padding:18px; border:1px solid var(--border); border-radius:8px; background:white; }
.activity-card.source-target { border-color:var(--primary); box-shadow:0 0 0 3px rgba(59,130,246,.16); }
.activity-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:10px; }
.activity-head strong { display:block; }
.activity-head span { color:var(--text-secondary); font-size:.84rem; }
.head-actions { display:grid; justify-items:end; gap:6px; }
.activity-head em { padding:3px 9px; border-radius:99px; background:#d9f3ef; color:#0f766e; font-size:.78rem; font-style:normal; }
.activity-card > p { margin-bottom:12px; line-height:1.8; white-space:pre-wrap; }
.moment-edit-form { display:grid; gap:8px; margin-bottom:12px; }
.moment-edit-form textarea { width:100%; padding:10px 12px; resize:vertical; border:1.5px solid var(--border); border-radius:8px; outline:none; font:inherit; }
.moment-edit-form textarea:focus { border-color:var(--primary); }
.edit-actions { display:flex; gap:8px; }
.activity-metrics { display:flex; gap:16px; padding-top:12px; border-top:1px solid var(--border); color:var(--text-secondary); font-size:.84rem; }
.activity-metrics button { border:0; background:transparent; color:var(--primary); cursor:pointer; font:inherit; }
.activity-metrics button:disabled { cursor:not-allowed; opacity:.55; }
.activity-metrics .like-button { color:var(--text-secondary); }
.activity-metrics .like-button.liked { color:#ef4444; }
.danger-link, .secondary-link { border:0; background:transparent; cursor:pointer; font:inherit; font-size:.78rem; }
.danger-link { color:#dc2626; }
.secondary-link { color:#b45309; }
.danger-link:disabled, .secondary-link:disabled { cursor:not-allowed; opacity:.55; }
.btn-xs { padding:7px 14px; font-size:.8rem; }
</style>
