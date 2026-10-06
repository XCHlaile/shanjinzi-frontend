<template>
  <el-dialog v-model="visible" :title="`分配教师 · ${activeClass?.name || ''}`" width="640px">
    <div class="teacher-dialog">
      <div class="scope-note">
        <strong>仅可选择本校教师</strong>
        <span>保存后会覆盖该班级当前的教师分配。</span>
      </div>
      <input v-model.trim="keyword" class="teacher-search" placeholder="按教师姓名或手机号筛选" />
      <p v-if="loading" class="dialog-state">正在加载本校教师...</p>
      <div v-else class="teacher-list">
        <label v-for="teacher in teachers" :key="teacher.id" class="teacher-option">
          <input v-model="selectedIds" type="checkbox" :value="teacher.id" />
          <span>
            <strong>{{ teacherName(teacher) }}</strong>
            <small>{{ teacher.phone || '未设置手机号' }}</small>
          </span>
          <em>{{ teacherClassIds(teacher).length }} 个班级</em>
        </label>
        <p v-if="!teachers.length" class="dialog-state">暂无符合条件的本校教师</p>
      </div>
      <p v-if="error" class="form-error">{{ error }}</p>
      <div class="teacher-footer">
        <span>已选择 {{ selectedIds.length }} 位教师</span>
        <div class="dialog-actions">
          <button class="btn btn-ghost btn-sm" type="button" @click="visible = false">取消</button>
          <button class="btn btn-primary btn-sm" type="button" :disabled="saving || loading" @click="saveTeachers">
            {{ saving ? '保存中...' : '保存分配' }}
          </button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import {
  teacherClassIds,
  teacherDisplayName as teacherName
} from '../lib/classManagementViewModel.js'

defineProps({
  activeClass: { type: Object, default: null },
  error: { type: String, default: '' },
  loading: Boolean,
  saveTeachers: { type: Function, required: true },
  saving: Boolean,
  teachers: { type: Array, default: () => [] }
})

const visible = defineModel('visible', { type: Boolean })
const keyword = defineModel('keyword', { type: String, default: '' })
const selectedIds = defineModel('selectedIds', {
  type: Array,
  default: () => []
})
</script>

<style scoped>
.teacher-dialog { display:grid; gap:14px; }
.scope-note { display:grid; gap:3px; padding:12px 14px; border:1px solid #dbeafe; border-radius:9px; background:#f0f7ff; color:#52647a; font-size:.82rem; }
.scope-note strong { color:#1d4ed8; }
.teacher-search { width:100%; border:1.5px solid var(--border); border-radius:8px; padding:10px 12px; background:white; font:inherit; }
.teacher-list { display:grid; gap:8px; max-height:360px; overflow:auto; }
.teacher-option { display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:12px; padding:12px 14px; border:1px solid #e2e8f0; border-radius:10px; cursor:pointer; transition:.16s ease; }
.teacher-option:has(input:checked) { border-color:#93c5fd; background:#eff6ff; }
.teacher-option input { width:16px; height:16px; accent-color:var(--primary); }
.teacher-option span { display:grid; gap:2px; min-width:0; }
.teacher-option strong { overflow:hidden; color:#1e293b; text-overflow:ellipsis; white-space:nowrap; }
.teacher-option small, .teacher-option em { color:#718096; font-size:.76rem; font-style:normal; }
.dialog-state { padding:28px; text-align:center; color:#718096; }
.form-error { color:#b91c1c; font-size:.82rem; }
.teacher-footer { display:flex; align-items:center; justify-content:space-between; gap:16px; padding-top:12px; border-top:1px solid #e2e8f0; color:#52647a; font-size:.82rem; }
.dialog-actions { display:flex; justify-content:flex-end; gap:10px; }
.btn-ghost { border:1px solid var(--border); background:white; color:var(--text-secondary); }
.btn-ghost:hover { border-color:#bfdbfe; background:#f8fbff; color:var(--primary); }
@media (max-width:700px) {
  .teacher-footer { align-items:flex-start; flex-direction:column; }
  .dialog-actions { width:100%; }
}
</style>
