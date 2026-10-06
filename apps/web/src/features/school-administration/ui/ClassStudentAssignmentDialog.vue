<template>
  <el-dialog
    v-model="visible"
    class="student-assignment-dialog"
    :title="`学生分班 · ${activeClass?.name || ''}`"
    width="min(760px, 94vw)"
  >
    <div class="student-dialog">
      <div class="scope-note">
        <strong>仅显示当前班级学生</strong>
        <span>从下拉框选择本校其他学生加入当前班级；学生已有班级时将执行转班。</span>
      </div>
      <p v-if="loading" class="dialog-state">正在加载本校学生...</p>
      <template v-else>
        <div class="student-add-panel">
          <el-select
            v-model="selectedStudentId"
            filterable
            clearable
            :disabled="savingId !== null"
            placeholder="选择要加入本班的学生"
            style="width: 100%"
          >
            <el-option
              v-for="student in availableStudents"
              :key="student.id"
              :label="studentOptionLabel(student)"
              :value="student.id"
            />
          </el-select>
          <button
            class="btn btn-primary btn-sm"
            type="button"
            :disabled="!selectedStudentId || savingId !== null"
            @click="addSelectedStudent"
          >
            {{ savingId !== null ? '加入中...' : '加入班级' }}
          </button>
        </div>

        <input
          v-model.trim="keyword"
          class="student-search"
          placeholder="筛选本班学生姓名或学号"
        />

        <section class="student-class-column active-class">
          <header>
            <div>
              <strong>{{ activeClass?.name || '当前班级' }}</strong>
              <small>{{ activeClass?.gradeName || '未设置年级' }}</small>
            </div>
            <span>{{ currentClassStudentCount }} 人</span>
          </header>
          <div class="student-card-list current-class-list">
            <article v-for="student in currentClassStudents" :key="student.id" class="student-card">
              <div>
                <strong>{{ studentName(student) }}</strong>
                <small v-if="studentIdentity(student)">{{ studentIdentity(student) }}</small>
              </div>
              <button
                class="remove-student-btn"
                type="button"
                :disabled="savingId !== null"
                @click="removeStudentFromClass(student)"
              >
                {{ String(savingId) === String(student.id) ? '移出中...' : '移出班级' }}
              </button>
            </article>
            <p v-if="!currentClassStudents.length" class="empty-board-state">
              {{ keyword ? '暂无符合筛选条件的本班学生' : '当前班级暂无学生' }}
            </p>
          </div>
        </section>
      </template>
      <p v-if="error" class="form-error">{{ error }}</p>
      <div class="student-footer">
        <span>本班共 {{ currentClassStudentCount }} 名学生，可选择 {{ availableStudents.length }} 名本校其他学生</span>
        <button class="btn btn-ghost btn-sm" type="button" @click="visible = false">关闭</button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import {
  studentDisplayName as studentName,
  studentIdentity
} from '../lib/classManagementViewModel.js'

defineProps({
  activeClass: { type: Object, default: null },
  addSelectedStudent: { type: Function, required: true },
  availableStudents: { type: Array, default: () => [] },
  currentClassStudentCount: { type: Number, default: 0 },
  currentClassStudents: { type: Array, default: () => [] },
  error: { type: String, default: '' },
  loading: Boolean,
  removeStudentFromClass: { type: Function, required: true },
  savingId: { type: [Number, String], default: null },
  studentOptionLabel: { type: Function, required: true }
})

const visible = defineModel('visible', { type: Boolean })
const keyword = defineModel('keyword', { type: String, default: '' })
const selectedStudentId = defineModel('selectedStudentId', {
  type: [Number, String],
  default: null
})
</script>

<style scoped>
.student-dialog { display:grid; gap:14px; }
.scope-note { display:grid; gap:3px; padding:12px 14px; border:1px solid #dbeafe; border-radius:9px; background:#f0f7ff; color:#52647a; font-size:.82rem; }
.scope-note strong { color:#1d4ed8; }
.dialog-state { padding:28px; text-align:center; color:#718096; }
.student-add-panel { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:10px; padding:12px; border:1px solid #dbeafe; border-radius:10px; background:#f8fbff; }
.student-add-panel .btn { white-space:nowrap; }
.student-search { width:100%; border:1.5px solid var(--border); border-radius:8px; padding:10px 12px; background:white; font:inherit; }
.student-class-column { min-height:190px; overflow:hidden; border:1px solid #dbe4ef; border-radius:12px; background:#f8fafc; }
.student-class-column > header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 14px; border-bottom:1px solid #e2e8f0; background:white; }
.student-class-column > header div { display:grid; gap:2px; }
.student-class-column header strong { color:#1e293b; }
.student-class-column header small { color:#718096; font-size:.74rem; }
.student-class-column header > span { flex:none; padding:3px 8px; border-radius:999px; background:#eef4ff; color:#3564a8; font-size:.72rem; font-weight:700; }
.student-class-column.active-class { border-color:#60a5fa; box-shadow:0 0 0 2px rgba(59,130,246,.1); }
.student-card-list { display:grid; align-content:start; gap:8px; min-height:128px; max-height:430px; overflow:auto; padding:10px; }
.student-card-list.current-class-list { grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); }
.student-card { display:grid; gap:8px; padding:10px 11px; border:1px solid #e2e8f0; border-radius:9px; background:white; box-shadow:0 3px 10px rgba(15,23,42,.04); }
.student-card > div { display:grid; gap:2px; min-width:0; }
.student-card strong { overflow:hidden; color:#1e293b; font-size:.88rem; text-overflow:ellipsis; white-space:nowrap; }
.student-card small { color:#718096; font-size:.72rem; }
.remove-student-btn { justify-self:start; border:0; background:transparent; color:#b45309; cursor:pointer; font:inherit; font-size:.72rem; font-weight:700; }
.remove-student-btn:hover:not(:disabled) { color:#92400e; text-decoration:underline; }
.remove-student-btn:disabled { cursor:not-allowed; opacity:.55; }
.empty-board-state { align-self:center; padding:18px 8px; text-align:center; color:#94a3b8; font-size:.78rem; }
.form-error { color:#b91c1c; font-size:.82rem; }
.student-footer { display:flex; align-items:center; justify-content:space-between; gap:16px; padding-top:12px; border-top:1px solid #e2e8f0; color:#52647a; font-size:.82rem; }
.btn-ghost { border:1px solid var(--border); background:white; color:var(--text-secondary); }
.btn-ghost:hover { border-color:#bfdbfe; background:#f8fbff; color:var(--primary); }
@media (max-width:700px) {
  .student-footer { align-items:flex-start; flex-direction:column; }
  .student-add-panel { grid-template-columns:1fr; }
}
</style>
