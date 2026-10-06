<template>
  <div class="plain-page">
    <section class="section">
      <div class="container">
        <header class="page-heading">
          <div>
            <p>校方管理 · 本校组织</p>
            <h1>班级管理</h1>
            <span>创建和维护本校班级，并为班级分配本校教师和学生。</span>
          </div>
          <button class="btn btn-primary" type="button" :disabled="!schoolId" @click="openCreate">+ 新增班级</button>
        </header>

        <div class="context-card">
          <div>
            <small>当前学校</small>
            <strong>{{ schoolName || (schoolId ? `学校 #${schoolId}` : '未关联学校') }}</strong>
          </div>
          <div>
            <small>班级数量</small>
            <strong>{{ total }}</strong>
          </div>
          <div>
            <small>本校教师</small>
            <strong>{{ teacherOptions.length }}</strong>
          </div>
        </div>

        <div class="toolbar">
          <label class="filter-field">
            <span>班级名称</span>
            <input v-model.trim="filters.name" placeholder="班级名称" @keyup.enter="searchClasses" />
          </label>
          <label class="filter-field">
            <span>年级名称</span>
            <input v-model.trim="filters.gradeName" placeholder="年级名称" @keyup.enter="searchClasses" />
          </label>
          <button class="btn btn-outline btn-sm" type="button" @click="searchClasses">查询</button>
          <button class="btn btn-ghost btn-sm" type="button" @click="resetFilters">重置</button>
        </div>

        <AppStatePanel
          :loading="loading"
          :error="loadError"
          :empty="!loading && !loadError && !rows.length"
          :retry="Boolean(schoolId)"
          empty-title="暂无符合条件的班级"
          empty-text="可调整查询条件，或创建本校第一个班级。"
          loading-text="正在加载本校班级"
          @retry="reloadAll"
        />

        <div v-if="!loading && !loadError && rows.length" class="table-panel">
          <table class="data-table" aria-label="班级目录">
            <colgroup>
              <col class="class-column">
              <col class="grade-column">
              <col class="teacher-column">
              <col class="sort-column">
              <col class="status-column">
              <col class="time-column">
              <col class="action-column">
            </colgroup>
            <thead>
              <tr>
                <th scope="col">班级</th>
                <th scope="col">年级</th>
                <th scope="col">任课教师</th>
                <th scope="col">排序</th>
                <th scope="col">状态</th>
                <th scope="col">更新时间</th>
                <th scope="col">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in rows" :key="item.id">
                <td data-label="班级">
                  <strong class="class-name">{{ item.name || '-' }}</strong>
                </td>
                <td data-label="年级">{{ item.gradeName || '未设置' }}</td>
                <td data-label="任课教师">
                  <div v-if="teachersForClass(item.id).length" class="teacher-tags">
                    <span v-for="teacher in teachersForClass(item.id)" :key="teacher.id">
                      {{ teacherName(teacher) }}
                    </span>
                  </div>
                  <span v-else class="unassigned">暂未分配</span>
                </td>
                <td data-label="排序">{{ item.sortOrder ?? 0 }}</td>
                <td data-label="状态"><span class="status-badge">{{ statusLabel(item.status) }}</span></td>
                <td class="time-cell" data-label="更新时间">{{ formatTime(item.updatedAt || item.createdAt) }}</td>
                <td data-label="操作">
                  <div class="row-actions">
                    <button type="button" @click="openEdit(item)">编辑</button>
                    <button class="primary-action" type="button" @click="openTeacherAssignment(item)">分配教师</button>
                    <button class="student-action" type="button" @click="openStudentAssignment(item)">管理学生</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button type="button" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
          <span>第 {{ page }} / {{ totalPages }} 页，共 {{ total }} 个班级</span>
          <button type="button" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
        </div>
      </div>
    </section>

    <SchoolClassFormDialog
      v-model:visible="classDialogVisible"
      v-model:form="classForm"
      :editing-id="editingId"
      :form-error="formError"
      :save-class="saveClass"
      :saving="saving"
      :school-id="schoolId"
      :school-name="schoolName"
    />

    <ClassTeacherAssignmentDialog
      v-model:visible="teacherDialogVisible"
      v-model:keyword="teacherKeyword"
      v-model:selected-ids="selectedTeacherIds"
      :active-class="activeClass"
      :error="teacherDialogError"
      :loading="teachersLoading"
      :save-teachers="saveTeachers"
      :saving="teachersSaving"
      :teachers="filteredTeachers"
    />

    <ClassStudentAssignmentDialog
      v-model:visible="studentDialogVisible"
      v-model:keyword="studentKeyword"
      v-model:selected-student-id="selectedStudentId"
      :active-class="activeClass"
      :add-selected-student="addSelectedStudent"
      :available-students="availableStudents"
      :current-class-student-count="currentClassStudentCount"
      :current-class-students="currentClassStudents"
      :error="studentDialogError"
      :loading="studentsLoading"
      :remove-student-from-class="removeStudentFromClass"
      :saving-id="studentSavingId"
      :student-option-label="studentOptionLabel"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AppStatePanel from '@/components/AppStatePanel.vue'
import { ElMessage, ElMessageBox } from '@/shared/ui/feedback.js'
import {
  ClassStudentAssignmentDialog,
  ClassTeacherAssignmentDialog,
  SchoolClassFormDialog
} from '@/features/school-administration/ui/index.js'
import {
  formatSchoolClassTime as formatTime,
  schoolClassStatusLabel as statusLabel,
  teacherDisplayName as teacherName,
  useSchoolClassManagement
} from '@/features/school-administration/index.js'

const {
  activeClass,
  addSelectedStudent,
  availableStudents,
  changePage,
  classDialogVisible,
  classForm,
  currentClassStudentCount,
  currentClassStudents,
  editingId,
  filteredTeachers,
  filters,
  formError,
  initialize,
  loadError,
  loading,
  reloadAll,
  removeStudentFromClass,
  openStudentAssignment,
  openTeacherAssignment,
  openCreate,
  openEdit,
  page,
  resetFilters,
  rows,
  saveClass,
  saveTeachers,
  saving,
  schoolId,
  schoolName,
  searchClasses,
  selectedStudentId,
  selectedTeacherIds,
  studentDialogError,
  studentDialogVisible,
  studentKeyword,
  studentOptionLabel,
  studentSavingId,
  studentsLoading,
  teacherDialogError,
  teacherDialogVisible,
  teacherKeyword,
  teacherOptions,
  teachersForClass,
  teachersLoading,
  teachersSaving,
  total,
  totalPages
} = useSchoolClassManagement({
  confirm: ElMessageBox.confirm,
  notify: ElMessage
})

onMounted(initialize)
</script>

<style scoped>
.plain-page { padding-top:var(--nav-height, 72px); }
.page-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:22px; }
.page-heading p { color:var(--primary); font-weight:700; }
.page-heading h1 { margin:4px 0 6px; font-size:1.9rem; }
.page-heading span { color:var(--text-secondary); }
.context-card { display:grid; grid-template-columns:2fr 1fr 1fr; gap:1px; overflow:hidden; margin-bottom:16px; border:1px solid #dbe4ef; border-radius:14px; background:#dbe4ef; box-shadow:0 8px 24px rgba(15,23,42,.04); }
.context-card > div { display:grid; gap:5px; padding:16px 18px; background:white; }
.context-card small { color:#718096; font-size:.76rem; }
.context-card strong { color:#1e3a5f; font-size:1.05rem; }
.toolbar { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px; }
.filter-field { display: flex; flex: 1; min-width: 220px; }
.filter-field > span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.toolbar input { width: 100%; min-height: 42px; border:1.5px solid var(--border); border-radius:8px; padding:9px 12px; background:white; font:inherit; }
.btn-ghost { border:1px solid var(--border); background:white; color:var(--text-secondary); }
.btn-ghost:hover { border-color:#bfdbfe; background:#f8fbff; color:var(--primary); }
.table-panel { overflow:auto; border:1px solid #dbe4ef; border-radius:14px; background:white; box-shadow:0 10px 30px rgba(15,23,42,.05); }
.data-table { width:100%; min-width:1020px; table-layout:fixed; border-collapse:collapse; }
.data-table th, .data-table td { padding:15px 16px; border-bottom:1px solid #e7edf5; text-align:left; vertical-align:middle; }
.data-table th { background:#f7f9fc; color:#52647a; font-size:.78rem; font-weight:700; letter-spacing:.04em; white-space:nowrap; }
.data-table td { color:#334155; font-size:.88rem; }
.data-table tbody tr:hover { background:#f8fbff; }
.data-table small { display:block; margin-top:4px; color:#94a3b8; font-size:.72rem; }
.class-column { width:17%; }
.grade-column { width:12%; }
.teacher-column { width:24%; }
.sort-column { width:8%; }
.status-column { width:9%; }
.time-column { width:15%; }
.action-column { width:15%; }
.class-name { color:#17243a; font-size:.98rem; }
.teacher-tags { display:flex; flex-wrap:wrap; gap:5px; }
.teacher-tags span { padding:3px 8px; border-radius:999px; background:#eef4ff; color:#3564a8; font-size:.73rem; font-weight:600; }
.unassigned { color:#94a3b8; }
.status-badge { display:inline-flex; padding:4px 9px; border-radius:999px; background:#ecfdf5; color:#059669; font-size:.73rem; font-weight:700; }
.time-cell { color:#64748b; white-space:nowrap; }
.row-actions { display:flex; flex-wrap:wrap; gap:7px; }
.row-actions button { padding:5px 9px; border:1px solid #dbeafe; border-radius:6px; background:#f8fbff; color:var(--primary); cursor:pointer; font:inherit; font-size:.76rem; }
.row-actions .primary-action { border-color:#bfdbfe; background:#eff6ff; font-weight:600; }
.row-actions .student-action { border-color:#bbf7d0; background:#f0fdf4; color:#047857; font-weight:600; }
.pagination button { border:0; background:transparent; color:var(--primary); cursor:pointer; font:inherit; }
.pagination { display:flex; justify-content:center; align-items:center; gap:16px; margin-top:18px; color:var(--text-secondary); font-size:.84rem; }
.pagination button:disabled { color:#94a3b8; cursor:not-allowed; }
@media (max-width:700px) {
  .section { padding:48px 0; }
  .page-heading { align-items:stretch; flex-direction:column; }
  .page-heading .btn { min-height: 44px; }
  .context-card { grid-template-columns:1fr 1fr; }
  .context-card > div:first-child { grid-column:1/-1; }
  .toolbar { display: grid; grid-template-columns: 1fr 1fr; }
  .filter-field { min-width: 0; grid-column: 1 / -1; }
  .toolbar .btn { min-height: 44px; }
  .table-panel { overflow: visible; border: 0; background: transparent; box-shadow: none; }
  .data-table, .data-table tbody { display: block; width: 100%; min-width: 0; }
  .data-table colgroup, .data-table thead { display: none; }
  .data-table tbody { display: grid; gap: 12px; }
  .data-table tbody tr { display: block; overflow: hidden; border: 1px solid #dbe4ef; border-radius: 14px; background: #fff; box-shadow: 0 10px 26px rgba(15,23,42,.05); }
  .data-table tbody td { display: grid; grid-template-columns: minmax(5.5rem, .42fr) minmax(0, 1fr); gap: 14px; align-items: center; padding: 11px 14px; border-bottom: 1px solid #edf1f6; text-align: right; }
  .data-table tbody td::before { color: #718096; content: attr(data-label); font-size: .76rem; font-weight: 600; text-align: left; }
  .data-table tbody td:last-child { border-bottom: 0; }
  .teacher-tags, .row-actions { justify-content: flex-end; }
  .row-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); width: 100%; }
  .row-actions button { min-height: 44px; padding: 10px 12px; }
  .time-cell { white-space: normal; }
  .empty-cell { display: block !important; padding: 34px 18px !important; border: 1px solid #dbe4ef !important; text-align: center !important; }
  .empty-cell::before { display: none; }
  .pagination { align-items: stretch; flex-direction: column; text-align: center; }
  .pagination button { min-height: 44px; }
}

@media (max-width:380px) {
  .toolbar, .row-actions { grid-template-columns: 1fr; }
  .data-table tbody td { grid-template-columns: 1fr; gap: 5px; text-align: left; }
  .teacher-tags, .row-actions { justify-content: flex-start; }
}
</style>
