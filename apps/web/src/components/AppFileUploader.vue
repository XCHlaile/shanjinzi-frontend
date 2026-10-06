<template>
  <div :class="['app-file-uploader', { 'compact-preview': compactPreview }]">
    <div class="upload-actions">
      <label :class="['upload-button', { disabled: disabled || uploading || atCapacity }]">
        {{ atCapacity ? '已达上限' : uploading ? '上传中...' : label }}
        <input
          type="file"
          :accept="resolvedAccept"
          :multiple="multiple && maxFiles > 1"
          :disabled="disabled || uploading || atCapacity"
          @change="selectFiles"
        />
      </label>
      <span>{{ hint || defaultHint }}</span>
    </div>

    <div v-if="modelValue.length" class="uploaded-files">
      <div v-for="item in modelValue" :key="item.fileId" class="uploaded-file">
        <div v-if="showFileDetails" class="uploaded-file-content">
          <AppMediaGallery v-if="item.url" :media="[item]" compact />
          <span v-else class="uploaded-media-fallback">{{ fileLabel(item) }}</span>
          <small v-if="item.fileSize">{{ formatSize(item.fileSize) }}</small>
        </div>
        <button type="button" :disabled="disabled || uploading" @click="removeFile(item.fileId)">移除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from '@/shared/ui/feedback.js'
import { fileApi } from '@/shared/api/fileApi.js'
import AppMediaGallery from '@/components/AppMediaGallery.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  sourceType: { type: String, required: true },
  label: { type: String, default: '选择图片或视频' },
  hint: { type: String, default: '' },
  accept: { type: String, default: '' },
  multiple: { type: Boolean, default: true },
  maxFiles: { type: Number, default: 9 },
  showFileDetails: { type: Boolean, default: true },
  compactPreview: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'uploading-change'])
const uploading = ref(false)
const isAvatar = computed(() => props.sourceType.toLowerCase() === 'avatar')
const replacesCurrentFile = computed(() => !props.multiple || props.maxFiles === 1)
const atCapacity = computed(() => !replacesCurrentFile.value && props.modelValue.length >= props.maxFiles)
const resolvedAccept = computed(() => props.accept || (isAvatar.value ? 'image/jpeg,image/png' : 'image/jpeg,image/png,video/mp4'))
const defaultHint = computed(() => isAvatar.value
  ? '支持 JPEG、PNG 图片'
  : `支持 JPEG、PNG 图片或不超过 200MB 的 MP4 视频，最多 ${props.maxFiles} 个附件`)

function isSupported(file) {
  const name = String(file?.name || '')
  const type = String(file?.type || '').toLowerCase()
  const image = ['image/jpeg', 'image/png'].includes(type) || /\.(jpe?g|png)$/i.test(name)
  const video = type === 'video/mp4' || /\.mp4$/i.test(name)
  if (isAvatar.value && !image) throw new Error('头像仅支持 JPEG 或 PNG 图片')
  if (!isAvatar.value && !image && !video) throw new Error('仅支持 JPEG、PNG 图片或 MP4 视频')
  if (video && Number(file.size || 0) > 200 * 1024 * 1024) throw new Error('MP4 视频不能超过 200MB')
}

async function selectFiles(event) {
  const input = event.target
  const selected = Array.from(input.files || [])
  input.value = ''
  if (!selected.length || uploading.value || atCapacity.value) return

  const replace = replacesCurrentFile.value
  const current = replace ? [] : [...props.modelValue]
  const capacity = Math.max(0, props.maxFiles - current.length)
  if (!replace && selected.length > capacity) {
    ElMessage.warning(`最多上传 ${props.maxFiles} 个文件`)
  }
  const candidates = selected.slice(0, replace ? 1 : capacity)
  if (!candidates.length) return

  uploading.value = true
  emit('uploading-change', true)
  const uploaded = [...current]
  try {
    for (const file of candidates) {
      isSupported(file)
      const result = await fileApi.uploadFile({ file, sourceType: props.sourceType.toLowerCase() })
      if (!result?.fileId) throw new Error('上传接口未返回文件 ID')
      uploaded.push({ ...result, originalName: result.originalName || file.name })
      emit('update:modelValue', [...uploaded])
    }
    ElMessage.success(candidates.length > 1 ? `${candidates.length} 个文件上传成功` : '文件上传成功')
  } catch (error) {
    ElMessage.error(error.message || '文件上传失败')
  } finally {
    uploading.value = false
    emit('uploading-change', false)
  }
}

function removeFile(fileId) {
  emit('update:modelValue', props.modelValue.filter(item => String(item.fileId) !== String(fileId)))
}

function fileLabel(item = {}) {
  return item.originalName || item.name || '已上传的媒体文件暂时无法预览'
}

function formatSize(bytes) {
  const size = Number(bytes || 0)
  if (!size) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
</script>

<style scoped>
.app-file-uploader { display:grid; gap:8px; min-width:0; }
.upload-actions { display:flex; align-items:center; flex-wrap:wrap; gap:10px; }
.upload-actions > span { color:var(--text-secondary); font-size:.76rem; line-height:1.5; }
.upload-button { display:inline-flex; align-items:center; justify-content:center; border:1px solid var(--primary); border-radius:8px; background:white; color:var(--primary); padding:8px 14px; cursor:pointer; font-size:.82rem; font-weight:700; white-space:nowrap; }
.upload-button:hover { background:var(--primary-light); }
.upload-button.disabled { cursor:not-allowed; opacity:.55; }
.upload-button input { position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; }
.uploaded-files { display:grid; gap:6px; }
.uploaded-file { display:flex; align-items:flex-start; gap:10px; min-width:0; border-radius:7px; background:#f8fafc; padding:9px; font-size:.78rem; }
.uploaded-file-content { min-width:0; flex:1; display:grid; gap:5px; }
.uploaded-file-content small { color:var(--text-secondary); }
.uploaded-media-fallback { color:var(--text-secondary); line-height:1.5; }
.uploaded-file button { flex:0 0 auto; margin-top:4px; border:0; background:transparent; color:#dc2626; cursor:pointer; font:inherit; padding:0; }
.uploaded-file button:disabled { cursor:not-allowed; opacity:.55; }
.compact-preview .uploaded-files { display:flex; gap:8px; overflow-x:auto; overscroll-behavior-inline:contain; padding:2px 0 5px; scrollbar-width:thin; }
.compact-preview .uploaded-file { position:relative; display:block; flex:0 0 148px; padding:7px; }
.compact-preview .uploaded-file-content { gap:3px; }
.compact-preview :deep(.app-media-gallery.compact) { grid-template-columns:minmax(0,1fr); }
.compact-preview :deep(.media-image-link) { display:flex; align-items:center; justify-content:center; height:92px; background:#f8fafc; }
.compact-preview :deep(.media-image-link img) { width:100%; height:100%; object-fit:contain; }
.compact-preview :deep(.media-video) { height:92px; max-height:92px; object-fit:contain; }
.compact-preview .uploaded-file-content small { font-size:.68rem; }
.compact-preview .uploaded-file button { position:absolute; top:10px; right:10px; z-index:1; margin:0; border-radius:99px; background:rgba(255,255,255,.92); padding:3px 7px; box-shadow:0 1px 4px rgba(15,23,42,.18); }
</style>
