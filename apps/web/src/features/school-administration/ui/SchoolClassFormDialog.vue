<template>
  <el-dialog v-model="visible" :title="editingId ? '编辑班级' : '新增班级'" width="520px">
    <form class="record-form" @submit.prevent="saveClass">
      <label>
        <span>班级名称</span>
        <input v-model.trim="form.name" maxlength="80" placeholder="例如：小一班" required />
      </label>
      <label>
        <span>年级名称</span>
        <input v-model.trim="form.gradeName" maxlength="80" placeholder="例如：小班" />
      </label>
      <label>
        <span>显示排序</span>
        <input v-model.number="form.sortOrder" type="number" step="1" />
      </label>
      <p class="school-lock">所属学校：{{ schoolName || `学校 #${schoolId}` }}（不可更改）</p>
      <p v-if="formError" class="form-error">{{ formError }}</p>
      <div class="dialog-actions">
        <button class="btn btn-ghost btn-sm" type="button" @click="visible = false">取消</button>
        <button class="btn btn-primary btn-sm" type="submit" :disabled="saving">
          {{ saving ? '保存中...' : '保存班级' }}
        </button>
      </div>
    </form>
  </el-dialog>
</template>

<script setup>
defineProps({
  editingId: { type: [Number, String], default: null },
  formError: { type: String, default: '' },
  saveClass: { type: Function, required: true },
  saving: Boolean,
  schoolId: { type: [Number, String], default: null },
  schoolName: { type: String, default: '' }
})

const visible = defineModel('visible', { type: Boolean })
const form = defineModel('form', { type: Object, required: true })
</script>

<style scoped>
.record-form { display:grid; gap:14px; }
.record-form label { display:grid; gap:6px; color:#52647a; font-size:.82rem; }
.record-form input { width:100%; border:1.5px solid var(--border); border-radius:8px; padding:10px 12px; background:white; font:inherit; }
.school-lock { padding:10px 12px; border:1px solid #dbeafe; border-radius:9px; background:#f0f7ff; color:#52647a; font-size:.82rem; }
.form-error { color:#b91c1c; font-size:.82rem; }
.dialog-actions { display:flex; justify-content:flex-end; gap:10px; }
.btn-ghost { border:1px solid var(--border); background:white; color:var(--text-secondary); }
.btn-ghost:hover { border-color:#bfdbfe; background:#f8fbff; color:var(--primary); }
@media (max-width:700px) {
  .dialog-actions { width:100%; }
}
</style>
