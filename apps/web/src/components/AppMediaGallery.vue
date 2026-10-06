<template>
  <div v-if="items.length" :class="['app-media-gallery', { compact }]">
    <template v-for="item in items" :key="item.fileId || item.url">
      <a
        v-if="isImage(item)"
        class="media-image-link"
        :href="mediaUrl(item.url)"
        target="_blank"
        rel="noreferrer"
      >
        <img :src="mediaUrl(item.url)" :alt="mediaLabel(item)" width="640" height="480" loading="lazy" decoding="async" />
      </a>
      <video
        v-else-if="isVideo(item)"
        class="media-video"
        :src="mediaUrl(item.url)"
        controls
        preload="metadata"
      ></video>
      <a
        v-else
        class="media-file-link"
        :href="mediaUrl(item.url)"
        target="_blank"
        rel="noreferrer"
      >
        {{ mediaLabel(item) }}
      </a>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { resolveApiAssetUrl } from '@/shared/api/httpClient.js'

const props = defineProps({
  media: { type: Array, default: () => [] },
  compact: { type: Boolean, default: false }
})

const items = computed(() => props.media.filter(item => item?.url))

function mediaUrl(value) {
  return resolveApiAssetUrl(value)
}

function normalizedType(item = {}) {
  return String(item.mediaType || item.mimeType || '').toLowerCase()
}

function isImage(item) {
  return normalizedType(item).includes('image') || /\.(?:jpe?g|png)(?:$|[?#])/i.test(item?.url || '')
}

function isVideo(item) {
  return normalizedType(item).includes('video') || /\.mp4(?:$|[?#])/i.test(item?.url || '')
}

function mediaLabel(item = {}) {
  if (item.originalName || item.name) return item.originalName || item.name
  if (isImage(item)) return '已上传图片'
  if (isVideo(item)) return '已上传视频'
  return '已上传文件'
}
</script>

<style scoped>
.app-media-gallery { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,220px)); gap:10px; margin:8px 0 12px; }
.app-media-gallery.compact { grid-template-columns:minmax(0,360px); margin:0; }
.media-image-link { display:block; overflow:hidden; border:1px solid var(--border); border-radius:8px; background:#f8fafc; }
.media-image-link img { display:block; width:100%; height:160px; object-fit:cover; }
.compact .media-image-link img { height:180px; }
.media-video { display:block; width:100%; max-height:240px; border-radius:8px; background:#0f172a; }
.media-file-link { color:var(--primary); background:#eff6ff; padding:7px 10px; border-radius:6px; font-size:.78rem; overflow-wrap:anywhere; }
@media (max-width:560px) {
  .app-media-gallery { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .media-image-link img { height:120px; }
}
</style>
