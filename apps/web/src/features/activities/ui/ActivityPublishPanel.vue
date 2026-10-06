<template>
  <form class="publish-panel" @submit.prevent="$emit('submit')">
    <div class="panel-heading">
      <div><strong>发布动态</strong><span>POST /api/app/moments</span></div>
      <button class="btn btn-primary btn-sm" type="submit" :disabled="publishing || uploading || !canPublishMoment">
        {{ publishing ? '发布中...' : '发布' }}
      </button>
    </div>
    <textarea v-model="publishForm.content" maxlength="10000" rows="4" placeholder="填写动态内容，也可以只上传图片或视频..."></textarea>
    <div class="publish-fields">
      <div class="visibility-select-field">
        <select v-if="role === 'school'" v-model="publishForm.visibility" aria-label="动态可见范围">
          <option value="SCHOOL">全校可见</option>
          <option value="CLASS">班级可见</option>
        </select>
        <div class="visibility-notice">
          <strong>{{ visibilityTitle }}</strong>
          <span>{{ visibilityDescription }}</span>
        </div>
      </div>
      <div v-if="publishForm.visibility === 'CLASS'" class="class-select-field">
        <select v-model.number="publishForm.classId" :disabled="classesLoading">
          <option value="" disabled>{{ classPlaceholder }}</option>
          <option v-for="classItem in classOptions" :key="classItem.id" :value="classItem.id">
            {{ classItem.label }}
          </option>
        </select>
        <span v-if="classesError" class="field-error">{{ classesError }}</span>
      </div>
      <div v-if="publishForm.visibility === 'CLASS'" class="student-select-field">
        <el-select
          v-model="publishForm.studentIds"
          multiple
          filterable
          clearable
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="2"
          :loading="studentsLoading"
          :disabled="!publishForm.classId || studentsLoading"
          :placeholder="studentPlaceholder"
        >
          <el-option
            v-for="student in studentOptions"
            :key="student.id"
            :label="student.label"
            :value="student.id"
          />
        </el-select>
        <span v-if="studentsError" class="field-error">{{ studentsError }}</span>
        <span v-else-if="!studentsLoading && !studentOptions.length" class="field-hint">
          {{ publishForm.classId ? '所选班级暂无可关联学生' : '请先选择班级' }}
        </span>
      </div>
      <AppFileUploader
        v-model="media"
        class="media-uploader-field"
        source-type="moment"
        :disabled="publishing"
        @uploading-change="uploading = $event"
      />
    </div>
  </form>
</template>

<script setup>
import AppFileUploader from '@/components/AppFileUploader.vue'

defineProps({
  canPublishMoment: Boolean,
  classOptions: { type: Array, default: () => [] },
  classPlaceholder: { type: String, default: '' },
  classesError: { type: String, default: '' },
  classesLoading: Boolean,
  publishing: Boolean,
  role: { type: String, required: true },
  studentOptions: { type: Array, default: () => [] },
  studentPlaceholder: { type: String, default: '' },
  studentsError: { type: String, default: '' },
  studentsLoading: Boolean,
  visibilityDescription: { type: String, default: '' },
  visibilityTitle: { type: String, default: '' }
})

defineEmits(['submit'])

const media = defineModel('media', { type: Array, default: () => [] })
const publishForm = defineModel('form', { type: Object, required: true })
const uploading = defineModel('uploading', { type: Boolean })
</script>

<style scoped>
.publish-panel { padding:18px; border:1px solid var(--border); border-radius:8px; background:white; }
.panel-heading { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:12px; }
.panel-heading div { display:grid; gap:3px; }
.panel-heading span { color:var(--text-secondary); font-size:.76rem; }
.publish-panel textarea, .publish-fields input, .publish-fields select { width:100%; padding:10px 12px; border:1.5px solid var(--border); border-radius:8px; outline:none; font:inherit; }
.publish-panel textarea:focus, .publish-fields input:focus, .publish-fields select:focus { border-color:var(--primary); }
.publish-fields { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-top:8px; }
.visibility-select-field { display:grid; grid-column:1 / -1; gap:8px; }
.visibility-notice { display:grid; gap:3px; padding:10px 12px; border:1px solid #bfdbfe; border-radius:8px; background:#eff6ff; color:#1e3a5f; }
.visibility-notice span { color:#52647a; font-size:.78rem; }
.class-select-field, .student-select-field { display:grid; gap:4px; }
.student-select-field :deep(.el-select) { width:100%; }
.field-error { color:#b91c1c; font-size:.78rem; }
.field-hint { color:var(--text-secondary); font-size:.78rem; }
.media-uploader-field { grid-column:1 / -1; }
@media (max-width:900px) { .publish-fields { grid-template-columns:1fr; } }
</style>
