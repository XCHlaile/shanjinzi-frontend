<template>
  <form class="post-form" @submit.prevent="$emit('submit')">
    <h3>发布新话题</h3>
    <select v-model="topic.tag" class="form-input" required>
      <option disabled value="">选择话题标签</option>
      <option v-for="tag in FORUM_TOPIC_TAGS" :key="tag" :value="tag">#{{ tag }}</option>
    </select>
    <input v-model.trim="topic.title" class="form-input" placeholder="话题标题" required />
    <textarea
      v-model.trim="topic.content"
      class="form-input form-textarea"
      placeholder="话题内容..."
      rows="5"
      required
    ></textarea>
    <AppFileUploader
      v-model="media"
      source-type="forum"
      compact-preview
      :disabled="publishing"
      @uploading-change="uploading = $event"
    />
    <div class="form-actions">
      <button class="btn btn-primary btn-sm" type="submit" :disabled="!canSubmit || publishing || uploading">
        {{ publishing ? '发布中...' : '发布' }}
      </button>
      <button class="btn btn-outline btn-sm" type="button" :disabled="publishing || uploading" @click="$emit('close')">取消</button>
    </div>
  </form>
</template>

<script setup>
import AppFileUploader from '@/components/AppFileUploader.vue'
import { FORUM_TOPIC_TAGS } from '../lib/forumViewModel.js'

defineProps({
  canSubmit: Boolean,
  publishing: Boolean
})

defineEmits(['close', 'submit'])

const media = defineModel('media', { type: Array, default: () => [] })
const topic = defineModel('topic', { type: Object, required: true })
const uploading = defineModel('uploading', { type: Boolean })
</script>

<style scoped>
.post-form { margin-bottom:20px; padding:20px; border:1px solid var(--border); border-radius:var(--radius-lg); background:var(--bg-muted); }
.post-form h3 { margin-bottom:12px; font-size:1rem; }
.form-input { width:100%; margin-bottom:10px; padding:10px 12px; border:1.5px solid var(--border); border-radius:var(--radius); background:white; font-size:.9rem; outline:none; }
.form-input:focus { border-color:var(--primary); }
.form-textarea { min-height:100px; resize:vertical; font-family:inherit; }
.form-actions { display:flex; gap:10px; }
.btn:disabled { cursor:not-allowed; opacity:.6; }
</style>
