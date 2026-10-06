<template>
  <el-dialog v-model="visible" :title="`${activeStudent?.name || ''} · 成长档案`" width="720px">
    <p v-if="loading" class="dialog-state">正在加载成长档案...</p>
    <p v-else-if="error" class="dialog-state error-text">{{ error }}</p>
    <div v-else class="timeline-list">
      <article v-for="event in events" :key="event.id">
        <time>{{ formatTime(event.occurredAt) }}</time>
        <div><strong>{{ event.title || event.eventType }}</strong><p>{{ event.summary || '-' }}</p><small>{{ event.sourceType }}</small></div>
      </article>
      <p v-if="!events.length" class="dialog-state">暂无成长档案事件</p>
    </div>
  </el-dialog>
</template>

<script setup>
import { formatTime } from '../lib/rosterPresentation.js'

defineProps({
  activeStudent: { type: Object, default: null },
  error: { type: String, default: '' },
  events: { type: Array, default: () => [] },
  loading: Boolean
})

const visible = defineModel('visible', { type: Boolean })
</script>

<style scoped>
.dialog-state { padding:28px; text-align:center; color:var(--text-secondary); }
.error-text { color:#b91c1c; }
.timeline-list article { display:grid; grid-template-columns:150px 1fr; gap:14px; padding:12px 0; border-bottom:1px solid var(--border); }
.timeline-list time, .timeline-list small { color:var(--text-secondary); font-size:.78rem; }
.timeline-list p { margin:5px 0; color:var(--text-secondary); }
@media (max-width:700px) {
  .timeline-list article { grid-template-columns:1fr; gap:4px; }
}
</style>
