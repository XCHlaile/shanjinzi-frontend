<template>
  <div
    ref="viewport"
    class="app-virtual-list"
    role="list"
    :aria-label="ariaLabel"
    @scroll="handleScroll"
  >
    <div class="virtual-spacer" :style="{ height: `${range.totalHeight}px` }">
      <div class="virtual-window" :style="{ transform: `translateY(${range.offset}px)` }">
        <div
          v-for="entry in visibleItems"
          :key="itemKeyOf(entry.item, entry.index)"
          class="virtual-item"
          role="listitem"
          :style="{ height: `${itemHeight}px` }"
        >
          <slot :item="entry.item" :index="entry.index"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { virtualListRange } from '@/shared/composables/virtualList.js'

const props = defineProps({
  ariaLabel: { type: String, required: true },
  itemHeight: { type: Number, required: true },
  itemKey: { type: [String, Function], default: 'id' },
  items: { type: Array, default: () => [] },
  overscan: { type: Number, default: 5 }
})

const viewport = ref(null)
const scrollTop = ref(0)
const viewportHeight = ref(0)
let resizeObserver = null

const range = computed(() => virtualListRange({
  itemCount: props.items.length,
  itemHeight: props.itemHeight,
  scrollTop: scrollTop.value,
  viewportHeight: viewportHeight.value,
  overscan: props.overscan
}))
const visibleItems = computed(() => props.items
  .slice(range.value.start, range.value.end)
  .map((item, index) => ({ item, index: range.value.start + index })))

function itemKeyOf(item, index) {
  return typeof props.itemKey === 'function'
    ? props.itemKey(item, index)
    : item?.[props.itemKey] ?? index
}

function measure() {
  viewportHeight.value = viewport.value?.clientHeight || 0
}

function handleScroll(event) {
  scrollTop.value = event.currentTarget.scrollTop
}

watch(() => props.items.length, async () => {
  await nextTick()
  const element = viewport.value
  if (!element) return
  const maximum = Math.max(0, props.items.length * props.itemHeight - element.clientHeight)
  if (element.scrollTop > maximum) element.scrollTop = maximum
  scrollTop.value = element.scrollTop
  measure()
})

onMounted(() => {
  measure()
  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(viewport.value)
  }
})

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<style scoped>
.app-virtual-list { min-height:0; overflow:auto; overscroll-behavior:contain; scrollbar-gutter:stable; }
.virtual-spacer { position:relative; width:100%; }
.virtual-window { position:absolute; inset:0 0 auto; will-change:transform; }
.virtual-item { width:100%; contain:layout paint; }
</style>
