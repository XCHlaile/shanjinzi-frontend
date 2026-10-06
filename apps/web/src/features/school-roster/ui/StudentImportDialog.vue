<template>
  <el-dialog v-model="visible" title="学生导入批次" width="760px">
    <form class="import-form" @submit.prevent="submitStudentImport">
      <label>导入文件
        <input :key="inputKey" type="file" accept=".xlsx,.xls,.csv" required @change="selectImportFile" />
      </label>
      <label>备注（可选）<input v-model.trim="form.remark" maxlength="500" /></label>
      <label class="checkbox-field"><input v-model="form.autoCreateClass" type="checkbox" /> 自动创建不存在的班级</label>
      <div class="import-actions">
        <button class="btn btn-outline btn-sm" type="button" :disabled="templateDownloading" @click="downloadStudentImportTemplate">
          {{ templateDownloading ? '下载中...' : '下载导入模板' }}
        </button>
        <button class="btn btn-primary btn-sm" type="submit" :disabled="!file || importing">
          {{ importing ? '上传中...' : '上传并导入' }}
        </button>
        <button class="btn btn-outline btn-sm" type="button" @click="loadImportBatches">刷新批次</button>
      </div>
    </form>
    <p v-if="loading" class="dialog-state">正在加载导入批次...</p>
    <p v-else-if="error" class="dialog-state error-text">{{ error }}</p>
    <div v-else class="detail-list">
      <article v-for="batch in batches" :key="batch.id">
        <div><strong>批次 #{{ batch.id }}</strong><span>{{ formatTime(batch.createdAt) }}</span></div>
        <p>{{ batch.status }} · 成功 {{ batch.successCount ?? 0 }} · 失败 {{ batch.failureCount ?? 0 }}</p>
      </article>
      <p v-if="!batches.length" class="dialog-state">暂无导入批次</p>
    </div>
  </el-dialog>
</template>

<script setup>
import { formatTime } from '../lib/rosterPresentation.js'

defineProps({
  batches: { type: Array, default: () => [] },
  downloadStudentImportTemplate: { type: Function, required: true },
  error: { type: String, default: '' },
  file: { type: [File, Object], default: null },
  importing: Boolean,
  inputKey: { type: Number, required: true },
  loadImportBatches: { type: Function, required: true },
  loading: Boolean,
  selectImportFile: { type: Function, required: true },
  submitStudentImport: { type: Function, required: true },
  templateDownloading: Boolean
})

const visible = defineModel('visible', { type: Boolean })
const form = defineModel('form', { type: Object, required: true })
</script>

<style scoped>
.import-form { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-bottom:16px; padding:14px; border:1px solid var(--border); border-radius:8px; background:#f8fafc; }
.import-form label { display:grid; gap:6px; color:var(--text-secondary); font-size:.82rem; }
.import-form input { min-width:0; padding:8px 10px; border:1.5px solid var(--border); border-radius:8px; background:white; font:inherit; }
.import-form .checkbox-field { display:flex; flex-direction:row; align-items:center; }
.import-form .checkbox-field input { width:auto; }
.import-actions { grid-column:1/-1; display:flex; flex-wrap:wrap; justify-content:flex-end; gap:8px; }
.dialog-state { padding:28px; text-align:center; color:var(--text-secondary); }
.error-text { color:#b91c1c; }
.detail-list { display:grid; gap:10px; }
.detail-list article { padding:13px; border:1px solid var(--border); border-radius:8px; }
.detail-list article > div { display:flex; justify-content:space-between; gap:12px; }
.detail-list span, .detail-list p { color:var(--text-secondary); font-size:.82rem; }
@media (max-width:700px) {
  .import-form { grid-template-columns:1fr; }
  .import-actions { grid-column:auto; }
}
</style>
