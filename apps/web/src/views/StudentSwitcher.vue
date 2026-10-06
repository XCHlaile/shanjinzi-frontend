<template>
  <div class="plain-page">
    <section class="section">
      <div class="container">
        <div class="page-heading-row">
          <div class="page-heading">
            <p>家长学生上下文</p>
            <h1>选择当前查看的学生</h1>
            <span>切换后，成长档案、动态、赛事报名和私信范围同步变化。</span>
          </div>
          <button class="btn btn-primary btn-sm" type="button" @click="openBindDialog">绑定学生</button>
        </div>

        <div v-if="loading" class="status-panel">正在加载绑定学生...</div>
        <div v-else-if="error" class="status-panel error">{{ error }}</div>
        <div v-else-if="!students.length" class="status-panel empty-binding-panel">
          <div>
            <strong>当前账号暂无已绑定学生</strong>
            <span>{{ bindFeedback || '请使用学校提供的绑定码完成学生绑定。' }}</span>
          </div>
        </div>

        <div v-else class="student-grid">
          <article
            v-for="student in students"
            :key="student.id"
            :class="['student-card', { active: current?.id === student.id }]"
            @click="selectStudent(student)"
          >
            <div class="student-card-head">
              <div>
                <strong>{{ student.name }}</strong>
                <span>{{ student.schoolName }}</span>
              </div>
              <div class="student-card-actions">
                <em>{{ current?.id === student.id ? '当前查看' : '点击切换' }}</em>
                <button
                  v-if="student.bindingId && isActiveBinding(student)"
                  class="unbind-button"
                  type="button"
                  :disabled="unbindingId === student.bindingId"
                  @click.stop="unbindStudent(student)"
                >
                  {{ unbindingId === student.bindingId ? '解绑中...' : '解除绑定' }}
                </button>
              </div>
            </div>
            <dl class="student-info">
              <div>
                <dt>学生信息</dt>
                <dd>{{ student.className }} · {{ student.studentNo || '-' }}</dd>
              </div>
              <div>
                <dt>生日/年龄</dt>
                <dd>{{ student.birthday || '-' }} · {{ student.age }} 岁</dd>
              </div>
              <div>
                <dt>绑定关系</dt>
                <dd>{{ relationLabel(student.relationType) }} · {{ bindStatusLabel(student.bindStatus) }}</dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </section>

    <el-dialog
      v-model="bindDialogVisible"
      title="绑定学生"
      width="min(520px, calc(100vw - 32px))"
      :close-on-click-modal="!binding"
      :close-on-press-escape="!binding"
      :show-close="!binding"
    >
      <el-alert
        title="请填写学校提供的学生信息和绑定码。带 * 的项目为必填项。"
        type="info"
        :closable="false"
        show-icon
        class="binding-alert"
      />
      <el-form label-width="96px" @submit.prevent="submitBinding">
        <el-form-item label="学校" required>
          <div class="binding-control">
            <el-select
              v-model="bindForm.schoolId"
              filterable
              :loading="schoolsLoading"
              :disabled="schoolsLoading || !schoolOptions.length"
              :placeholder="schoolsLoading ? '正在加载学校...' : schoolLoadError ? '学校加载失败' : '请选择学校'"
              style="width: 100%"
            >
              <el-option
                v-for="school in schoolOptions"
                :key="school.id"
                :label="school.name"
                :value="school.id"
              />
            </el-select>
            <span v-if="schoolLoadError" class="binding-field-error">
              {{ schoolLoadError }}
              <el-button link type="primary" :disabled="schoolsLoading" @click="loadSchools">重新加载</el-button>
            </span>
          </div>
        </el-form-item>
        <el-form-item label="学生姓名" required>
          <el-input v-model.trim="bindForm.studentName" maxlength="50" placeholder="请输入学生姓名" clearable />
        </el-form-item>
        <el-form-item label="学生学号">
          <el-input v-model.trim="bindForm.studentNo" maxlength="50" placeholder="选填" clearable />
        </el-form-item>
        <el-form-item label="学生生日">
          <el-date-picker
            v-model="bindForm.birthday"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选填"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="绑定码" required>
          <el-input v-model.trim="bindForm.bindCode" maxlength="100" placeholder="请输入学校提供的绑定码" clearable />
        </el-form-item>
        <el-form-item label="亲属关系" required>
          <el-select v-model="bindForm.relationType" placeholder="请选择亲属关系" style="width: 100%">
            <el-option
              v-for="option in relationOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="binding" @click="bindDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="binding" @click="submitBinding">
          {{ binding ? '绑定中...' : '确认绑定' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ElMessage, ElMessageBox } from '@/shared/ui/feedback.js'
import {
  STUDENT_RELATION_OPTIONS as relationOptions,
  isActiveStudentBinding as isActiveBinding,
  studentBindStatusLabel as bindStatusLabel,
  studentRelationLabel as relationLabel,
  useStudentContextManagement
} from '@/features/student-context/index.js'

const {
  bindDialogVisible,
  bindFeedback,
  bindForm,
  binding,
  current,
  error,
  initialize,
  loadSchools,
  loading,
  openBindDialog,
  schoolLoadError,
  schoolOptions,
  schoolsLoading,
  selectStudent,
  students,
  submitBinding,
  unbindStudent,
  unbindingId
} = useStudentContextManagement({
  confirm: (...args) => ElMessageBox.confirm(...args),
  notify: ElMessage
})

onMounted(initialize)
</script>

<style scoped>
.plain-page { padding-top:64px; }
.page-heading-row { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:20px; }
.page-heading p { color:var(--primary); font-weight:700; }
.page-heading h1 { font-size:1.8rem; margin:4px 0 6px; }
.page-heading span { color:var(--text-secondary); }
.status-panel { background:white; border:1px solid var(--border); border-radius:8px; padding:22px; color:var(--text-secondary); }
.status-panel.error { color:#ef4444; }
.empty-binding-panel { display:flex; align-items:center; justify-content:space-between; gap:18px; }
.empty-binding-panel > div { display:grid; gap:6px; }
.empty-binding-panel strong { color:var(--text); font-size:1rem; }
.empty-binding-panel span { line-height:1.6; }
.binding-alert { margin-bottom:18px; }
.binding-control { display:grid; gap:4px; width:100%; }
.binding-field-error { display:flex; align-items:center; justify-content:space-between; gap:10px; color:#dc2626; font-size:.78rem; line-height:1.5; }
.student-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:16px; }
.student-card { background:white; border:1px solid var(--border); border-radius:8px; padding:18px; cursor:pointer; transition:all .2s; display:grid; gap:14px; }
.student-card.active, .student-card:hover { border-color:var(--primary); box-shadow:var(--shadow-md); }
.student-card-head { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
.student-card-head > div:first-child { display:grid; gap:4px; min-width:0; }
.student-card-actions { flex:0 0 auto; display:grid; justify-items:end; gap:8px; }
.student-card span { color:var(--text-secondary); font-size:0.9rem; line-height:1.6; }
.student-card em { flex:0 0 auto; font-style:normal; color:#0f766e; background:#d9f3ef; border-radius:99px; padding:4px 10px; font-size:0.8rem; }
.unbind-button { border:0; background:transparent; color:#dc2626; cursor:pointer; font:inherit; font-size:.78rem; padding:2px 4px; }
.unbind-button:disabled { cursor:not-allowed; opacity:.55; }
.student-info { display:grid; gap:10px; margin:0; }
.student-info div { display:grid; gap:3px; }
.student-info dt { color:var(--text-secondary); font-size:0.78rem; }
.student-info dd { margin:0; color:var(--text); font-size:0.92rem; line-height:1.5; }
@media (max-width: 640px) {
  .page-heading-row { align-items:flex-start; flex-direction:column; }
  .empty-binding-panel { align-items:flex-start; flex-direction:column; }
}
</style>
