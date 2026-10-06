<template>
  <el-dialog v-model="visible" :title="`${activeStudent?.name || ''} · 家长`" width="680px">
    <div class="guardian-toolbar">
      <span>已绑定家长及联系电话</span>
      <button class="btn btn-primary btn-sm" type="button" :disabled="loading" @click="openBindGuardian">
        + 绑定家长
      </button>
    </div>
    <p v-if="loading" class="dialog-state">正在加载家长...</p>
    <p v-else-if="error" class="dialog-state error-text">{{ error }}</p>
    <div v-else class="detail-list">
      <article v-for="guardian in guardians" :key="guardian.guardianUserId">
        <div><strong>{{ guardian.guardianName || '-' }}</strong><span>{{ guardian.guardianPhone || '-' }}</span></div>
        <p>{{ relationLabel(guardian.relationType) }} · {{ guardian.bindStatus || '-' }}<em v-if="guardian.isPrimary">主要联系人</em></p>
        <button class="danger-link" type="button" @click="unbindStudentGuardian(guardian)">解除绑定</button>
      </article>
      <p v-if="!guardians.length" class="dialog-state">暂无绑定家长</p>
    </div>
  </el-dialog>

  <el-dialog
    v-model="bindVisible"
    :title="`为${activeStudent?.name || ''}绑定家长`"
    width="580px"
    append-to-body
  >
    <el-alert
      title="接口采用覆盖式设置，提交后所选家长将只绑定当前学生。"
      type="warning"
      show-icon
      :closable="false"
      class="bind-warning"
    />
    <el-form label-width="100px">
      <el-form-item label="选择家长" required>
        <el-select
          v-model="bindForm.parentId"
          filterable
          remote
          clearable
          :remote-method="searchParentOptions"
          :loading="parentOptionsLoading"
          placeholder="按家长姓名或手机号搜索"
          style="width: 100%"
        >
          <el-option
            v-for="parent in parentOptions"
            :key="parent.id"
            :label="parentOptionLabel(parent)"
            :value="parent.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="与学生关系">
        <el-select v-model="bindForm.relationType" clearable placeholder="可选" style="width: 100%">
          <el-option
            v-for="(label, value) in guardianRelationLabels"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <button class="btn btn-outline btn-sm" type="button" @click="bindVisible = false">取消</button>
      <button class="btn btn-primary btn-sm" type="button" :disabled="binding" @click="submitGuardianBinding">
        {{ binding ? '绑定中...' : '确认绑定' }}
      </button>
    </template>
  </el-dialog>
</template>

<script setup>
import { parentOptionLabel } from '../lib/rosterModel.js'
import {
  guardianRelationLabels,
  relationLabel
} from '../lib/rosterPresentation.js'

defineProps({
  activeStudent: { type: Object, default: null },
  binding: Boolean,
  error: { type: String, default: '' },
  guardians: { type: Array, default: () => [] },
  loading: Boolean,
  openBindGuardian: { type: Function, required: true },
  parentOptions: { type: Array, default: () => [] },
  parentOptionsLoading: Boolean,
  searchParentOptions: { type: Function, required: true },
  submitGuardianBinding: { type: Function, required: true },
  unbindStudentGuardian: { type: Function, required: true }
})

const visible = defineModel('visible', { type: Boolean })
const bindVisible = defineModel('bindVisible', { type: Boolean })
const bindForm = defineModel('bindForm', { type: Object, required: true })
</script>

<style scoped>
.guardian-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px; }
.guardian-toolbar span { color:var(--text-secondary); font-size:.82rem; }
.bind-warning { margin-bottom:18px; }
.dialog-state { padding:28px; text-align:center; color:var(--text-secondary); }
.error-text { color:#b91c1c; }
.detail-list { display:grid; gap:10px; }
.detail-list article { padding:13px; border:1px solid var(--border); border-radius:8px; }
.detail-list article > div { display:flex; justify-content:space-between; gap:12px; }
.detail-list span, .detail-list p { color:var(--text-secondary); font-size:.82rem; }
.detail-list em { margin-left:8px; color:#0f766e; font-style:normal; }
.detail-list button { border:0; margin-right:8px; background:transparent; cursor:pointer; font:inherit; font-size:.82rem; }
.danger-link { color:#dc2626; }
</style>
