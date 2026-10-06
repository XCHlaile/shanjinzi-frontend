<template>
  <section v-if="visible" class="admin-state" :role="errorState ? 'alert' : 'status'" aria-live="polite">
    <div v-if="errorState" class="error-state">
      <el-alert
        :title="errorState.title"
        :description="errorState.message"
        :type="alertType"
        show-icon
        :closable="false"
      />
      <el-button v-if="retry && errorState.retryable" class="retry-button" link type="primary" @click="$emit('retry')">
        {{ retryLabel }}
      </el-button>
    </div>
    <div v-else-if="loading" class="loading-state" aria-busy="true">
      <span class="state-spinner" aria-hidden="true"></span>
      <div><strong>{{ loadingText }}</strong><p>请稍候，内容加载完成后会自动显示。</p></div>
    </div>
    <el-empty v-else :description="emptyText">
      <slot name="action"></slot>
    </el-empty>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeErrorState } from '../../../../config/errorState.mjs'

const props = defineProps({
  loading: Boolean,
  error: { type: [String, Object], default: '' },
  empty: Boolean,
  loadingText: { type: String, default: '正在加载数据' },
  emptyText: { type: String, default: '暂无数据' },
  retry: { type: Boolean, default: true },
  retryLabel: { type: String, default: '重新加载' }
})

defineEmits(['retry'])

const errorState = computed(() => normalizeErrorState(props.error))
const visible = computed(() => props.loading || Boolean(errorState.value) || props.empty)
const alertType = computed(() => ['forbidden', 'unauthorized', 'validation'].includes(errorState.value?.kind) ? 'error' : 'warning')
</script>

<style scoped>
.admin-state { margin-bottom:14px; }
.loading-state { display:flex; gap:12px; align-items:center; min-height:88px; padding:18px 20px; border:1px solid var(--line); border-radius:12px; background:var(--panel); color:var(--muted); }
.loading-state strong { color:var(--text); font-size:.9rem; }
.loading-state p { margin:3px 0 0; font-size:.78rem; }
.state-spinner { width:20px; height:20px; border:2px solid var(--brand-soft); border-top-color:var(--brand); border-radius:50%; animation:state-spin .7s linear infinite; }
.retry-button { margin:6px 0 0 12px; padding:0; }
@keyframes state-spin { to { transform:rotate(360deg); } }
@media (prefers-reduced-motion:reduce) { .state-spinner { animation-duration:1.8s; } }
</style>
