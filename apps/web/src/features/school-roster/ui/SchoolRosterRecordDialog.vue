<template>
  <el-dialog v-model="visible" :title="editingId ? `编辑${recordLabel}` : `新增${recordLabel}`" width="560px">
    <form class="record-form" @submit.prevent="saveRecord">
      <template v-if="mode === 'students'">
        <label>学生姓名<input v-model.trim="studentForm.name" required /></label>
        <label>学号<input v-model.trim="studentForm.studentNo" /></label>
        <label>性别
          <select v-model="studentForm.gender"><option value="">未设置</option><option value="MALE">男</option><option value="FEMALE">女</option></select>
        </label>
        <label>生日<input v-model="studentForm.birthday" type="date" /></label>
        <label>班级
          <select v-model="studentForm.classId" :disabled="classOptionsLoading">
            <option value="" :disabled="Boolean(editingId)">
              {{ classOptionsLoading ? '正在加载班级...' : editingId ? '请选择班级' : '暂不分班' }}
            </option>
            <option
              v-for="classItem in classOptions"
              :key="classItem.id"
              :value="classItem.id"
              :disabled="isInactiveClass(classItem)"
            >
              {{ classOptionLabel(classItem) }}
            </option>
          </select>
        </label>
        <label v-if="!editingId">手机号
          <input v-model.trim="studentForm.phoneNum" inputmode="numeric" maxlength="11" pattern="\d{11}" required />
        </label>
        <label v-if="editingId">学籍状态
          <select v-model="studentForm.enrollmentStatus">
            <option value="">保持不变</option><option value="ENROLLED">在读</option><option value="GRADUATED">毕业</option><option value="TRANSFERRED">转出</option>
          </select>
        </label>
      </template>
      <template v-else>
        <label>姓名<input v-model.trim="userForm.realName" required /></label>
        <label>手机号<input v-model.trim="userForm.phone" maxlength="11" required /></label>
        <label>昵称<input v-model.trim="userForm.nickname" /></label>
        <label>性别
          <select v-model="userForm.gender"><option value="">未设置</option><option value="MALE">男</option><option value="FEMALE">女</option></select>
        </label>
        <label v-if="mode === 'teachers' && editingId">所带班级
          <el-select
            v-model="userForm.classIds"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            :disabled="classOptionsLoading"
            placeholder="选择本校班级"
            style="width: 100%"
          >
            <el-option
              v-for="classItem in classOptions"
              :key="classItem.id"
              :label="classOptionLabel(classItem)"
              :value="classItem.id"
              :disabled="isInactiveClass(classItem)"
            />
          </el-select>
        </label>
      </template>
      <p v-if="formError" class="form-error">{{ formError }}</p>
      <div class="dialog-actions">
        <button class="btn btn-outline btn-sm" type="button" @click="visible = false">取消</button>
        <button class="btn btn-primary btn-sm" type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
      </div>
    </form>
  </el-dialog>
</template>

<script setup>
import {
  classOptionLabel,
  isInactiveClass
} from '../lib/rosterPresentation.js'

defineProps({
  classOptions: { type: Array, default: () => [] },
  classOptionsLoading: Boolean,
  editingId: { type: [Number, String], default: null },
  formError: { type: String, default: '' },
  mode: { type: String, required: true },
  recordLabel: { type: String, required: true },
  saveRecord: { type: Function, required: true },
  saving: Boolean
})

const visible = defineModel('visible', { type: Boolean })
const studentForm = defineModel('studentForm', { type: Object, required: true })
const userForm = defineModel('userForm', { type: Object, required: true })
</script>

<style scoped>
.record-form { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
.record-form label { display:grid; gap:6px; color:var(--text-secondary); font-size:.82rem; }
.record-form input, .record-form select { border:1.5px solid var(--border); border-radius:8px; padding:9px 12px; background:white; font:inherit; }
.form-error { grid-column:1/-1; color:#b91c1c; }
.dialog-actions { grid-column:1/-1; display:flex; justify-content:flex-end; gap:10px; margin-top:4px; }
@media (max-width:700px) {
  .record-form { grid-template-columns:1fr; }
}
</style>
