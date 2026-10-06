<template>
  <section
    v-if="visible"
    :class="['app-state', `is-${stateKind}`, { 'is-compact': compact }]"
    :role="errorState ? 'alert' : 'status'"
    aria-live="polite"
    :aria-busy="loading ? 'true' : 'false'"
  >
    <span v-if="loading" class="state-spinner" aria-hidden="true"></span>
    <div class="state-copy">
      <strong>{{ stateTitle }}</strong>
      <p v-if="stateMessage">{{ stateMessage }}</p>
      <small v-if="errorState?.hint">{{ errorState.hint }}</small>
    </div>
    <button
      v-if="errorState && retry && errorState.retryable"
      class="state-action"
      type="button"
      @click="$emit('retry')"
    >
      {{ retryLabel }}
    </button>
    <slot v-else-if="empty" name="action"></slot>
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
  emptyTitle: { type: String, default: '暂无数据' },
  emptyText: { type: String, default: '当前没有可展示的内容。' },
  retry: { type: Boolean, default: true },
  retryLabel: { type: String, default: '重新加载' },
  compact: Boolean
})

defineEmits(['retry'])

const errorState = computed(() => normalizeErrorState(props.error))
const visible = computed(() => props.loading || Boolean(errorState.value) || props.empty)
const stateKind = computed(() => props.loading ? 'loading' : errorState.value?.kind || 'empty')
const stateTitle = computed(() => props.loading
  ? props.loadingText
  : errorState.value?.title || props.emptyTitle)
const stateMessage = computed(() => props.loading
  ? '请稍候，内容加载完成后会自动显示。'
  : errorState.value?.message || props.emptyText)
</script>

<style scoped>
.app-state { display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:14px; align-items:center; min-height:132px; padding:24px; border:1px solid var(--border); border-radius:12px; background:var(--surface, #fff); color:var(--text-secondary); }
.app-state.is-compact { min-height:84px; padding:16px 18px; }
.state-copy { min-width:0; }
.state-copy strong { display:block; color:var(--text); font-size:.95rem; line-height:1.4; }
.state-copy p { margin:4px 0 0; overflow-wrap:anywhere; font-size:.88rem; line-height:1.6; }
.state-copy small { display:block; margin-top:5px; color:var(--text-secondary); font-size:.78rem; }
.is-forbidden, .is-unauthorized { border-color:#f4c7c7; background:#fff8f8; }
.is-forbidden .state-copy strong, .is-unauthorized .state-copy strong { color:#9f3030; }
.is-network, .is-timeout, .is-server, .is-rate-limit { border-color:#e8d9b4; background:#fffdf5; }
.is-network .state-copy strong, .is-timeout .state-copy strong, .is-server .state-copy strong, .is-rate-limit .state-copy strong { color:#8a5b15; }
.state-spinner { width:22px; height:22px; border:2px solid var(--brand-soft, #dceef7); border-top-color:var(--primary); border-radius:50%; animation:state-spin .7s linear infinite; }
.state-action { min-height:40px; padding:8px 14px; border:1px solid var(--primary); border-radius:8px; background:transparent; color:var(--primary); cursor:pointer; font:inherit; font-size:.84rem; font-weight:650; }
.state-action:hover { background:var(--brand-wash, #eef6fa); }
.state-action:focus-visible { outline:3px solid color-mix(in srgb, var(--primary) 24%, transparent); outline-offset:2px; }
@keyframes state-spin { to { transform:rotate(360deg); } }
@media (prefers-reduced-motion:reduce) { .state-spinner { animation-duration:1.8s; } }
@media (max-width:640px) { .app-state { grid-template-columns:auto minmax(0,1fr); } .state-action { grid-column:1 / -1; width:100%; min-height:44px; } }
</style>
