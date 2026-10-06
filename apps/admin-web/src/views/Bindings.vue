<template>
  <section>
    <div class="page-heading">
      <div>
        <h1 class="page-title">班级管理</h1>
        <p class="page-description">创建和维护班级，管理班级状态、任课教师及学生归属。</p>
      </div>
      <div class="heading-actions">
        <el-button :loading="exporting" :disabled="loading || rows.length === 0" @click="exportClasses">
          导出
        </el-button>
        <el-button type="primary" @click="openCreate">新增班级</el-button>
      </div>
    </div>

    <div class="toolbar class-toolbar">
      <el-select
        v-model="filters.schoolId"
        placeholder="所属学校"
        clearable
        filterable
      >
        <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
      </el-select>
      <el-input
        v-model.trim="filters.name"
        placeholder="班级名称"
        clearable
        @keyup.enter="searchClasses"
      />
      <el-input
        v-model.trim="filters.gradeName"
        placeholder="年级名称"
        clearable
        @keyup.enter="searchClasses"
      />
      <el-select v-model="filters.status" placeholder="状态" clearable>
        <el-option label="启用" value="ACTIVE" />
        <el-option label="停用" value="DISABLED" />
      </el-select>
      <el-button type="primary" :loading="loading" @click="searchClasses">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <AdminStatePanel :error="loadError" @retry="loadClasses" />

    <div class="panel">
      <el-table
        v-loading="loading"
        :data="rows"
        height="520"
        border
        empty-text="暂无班级数据"
      >
        <el-table-column prop="id" label="班级 ID" width="100" />
        <el-table-column prop="name" label="班级名称" min-width="150" />
        <el-table-column prop="gradeName" label="年级" min-width="130">
          <template #default="{ row }">{{ row.gradeName || '-' }}</template>
        </el-table-column>
        <el-table-column label="所属学校" min-width="190">
          <template #default="{ row }">{{ schoolName(row.schoolId) }}</template>
        </el-table-column>
        <el-table-column label="任课教师" min-width="180">
          <template #default="{ row }">{{ classTeacherNames(row.id) }}</template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="90">
          <template #default="{ row }">{{ row.sortOrder ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ classStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">{{ shortDate(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="420" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="openTeachers(row)">分配教师</el-button>
            <el-button link type="primary" @click="openStudents(row)">学生管理</el-button>
            <el-button
              link
              :type="row.status === 'ACTIVE' ? 'warning' : 'success'"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'ACTIVE' ? '停用' : '启用' }}
            </el-button>
            <el-button link type="danger" @click="removeClass(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <span>共 {{ pagination.total }} 条</span>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[20, 50, 100]"
          layout="sizes, prev, pager, next"
          :total="pagination.total"
          @current-change="loadClasses"
          @size-change="handlePageSizeChange"
        />
      </div>
    </div>

    <ClassRecordDialogs
      v-model:form-dialog-visible="formDialogVisible"
      v-model:detail-dialog-visible="detailDialogVisible"
      v-model:teachers-dialog-visible="teachersDialogVisible"
      v-model:selected-teacher-ids="selectedTeacherIds"
      v-model:form="form"
      :active-class="activeClass"
      :class-detail="classDetail"
      :detail-loading="detailLoading"
      :editing-id="editingId"
      :save-class="saveClass"
      :save-teachers="saveTeachers"
      :saving="saving"
      :school-name="schoolName"
      :schools="schools"
      :teacher-options="teacherOptions"
      :teachers-loading="teachersLoading"
      :teachers-saving="teachersSaving"
    />

    <ClassStudentDialogs
      v-model:students-dialog-visible="studentsDialogVisible"
      v-model:transfer-dialog-visible="transferDialogVisible"
      v-model:selected-student-id="selectedStudentId"
      v-model:target-class-id="targetClassId"
      :active-class="activeClass"
      :add-student-to-class="addStudentToClass"
      :available-students="availableStudents"
      :class-students="classStudents"
      :open-transfer-student="openTransferStudent"
      :student-saving="studentSaving"
      :students-loading="studentsLoading"
      :transfer-class-options="transferClassOptions"
      :transfer-student="transferStudent"
      :transfer-student-to-class="transferStudentToClass"
    />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminStatePanel from '@/components/AdminStatePanel.vue'

import {
  ClassRecordDialogs,
  ClassStudentDialogs,
  useClassManagement
} from '@/features/class-management/index.js'
import {
  classStatusLabel,
  shortDate
} from '@/entities/student/index.js'
import { ElMessage, ElMessageBox } from '@/shared/ui/feedback.js'

const router = useRouter()
const {
  activeClass,
  addStudentToClass,
  availableStudents,
  classDetail,
  classStudents,
  classTeacherNames,
  detailDialogVisible,
  detailLoading,
  editingId,
  exportClasses,
  exporting,
  filters,
  form,
  formDialogVisible,
  handlePageSizeChange,
  loadClasses,
  loadError,
  loading,
  loadInitialData,
  openCreate,
  openDetail,
  openEdit,
  openStudents,
  openTeachers,
  openTransferStudent,
  pagination,
  removeClass,
  resetFilters,
  rows,
  saveClass,
  saveTeachers,
  saving,
  schoolName,
  schools,
  searchClasses,
  selectedStudentId,
  selectedTeacherIds,
  studentSaving,
  studentsDialogVisible,
  studentsLoading,
  targetClassId,
  teacherOptions,
  teachersDialogVisible,
  teachersLoading,
  teachersSaving,
  toggleStatus,
  transferClassOptions,
  transferDialogVisible,
  transferStudent,
  transferStudentToClass
} = useClassManagement({
  dialogs: ElMessageBox,
  feedback: ElMessage,
  onUnauthorized: () => router.replace('/login')
})

onMounted(loadInitialData)
</script>

<style scoped>
.page-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:16px; }
.page-title { margin-bottom:4px; }
.page-description { margin:0; color:var(--muted); font-size:14px; }
.heading-actions { display:flex; gap:8px; flex-wrap:wrap; }
.class-toolbar { justify-content:flex-start; }
.class-toolbar > :deep(.el-select),
.class-toolbar > :deep(.el-input) { width:180px; }
.pagination-row { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:16px; color:var(--muted); font-size:14px; }
@media (max-width:760px) {
  .page-heading { flex-direction:column; }
  .class-toolbar > :deep(.el-select),
  .class-toolbar > :deep(.el-input) { width:100%; }
  .pagination-row { align-items:flex-start; flex-direction:column; }
}
</style>
