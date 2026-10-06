<template>
  <section>
    <div class="page-heading">
      <div>
        <h1 class="page-title">学生监管</h1>
        <p class="page-description">按最新 OpenAPI 管理学生、家长绑定、成长档案和名单导入。</p>
      </div>
      <div class="heading-actions">
        <el-button :loading="exporting" :disabled="loading" @click="exportStudents">导出</el-button>
        <el-button :loading="templateDownloading" @click="downloadStudentImportTemplate">下载模板</el-button>
        <el-button type="primary" plain @click="openStudentImport">导入学生名单</el-button>
        <el-button @click="openImportBatches">导入批次</el-button>
        <el-button type="primary" @click="openCreate">新增学生</el-button>
      </div>
    </div>

    <AdminStatePanel :error="loadFailure || loadError" @retry="loadStudents" />

    <StudentDirectoryPanel
      v-model:filters="filters"
      v-model:pagination="pagination"
      :loading="loading"
      :rows="rows"
      @load="loadStudents"
      @open-bind-guardian="openBindGuardian"
      @open-detail="openDetail"
      @open-edit="openEdit"
      @open-guardians="openGuardians"
      @open-profile="openProfile"
      @page-size-change="handlePageSizeChange"
      @reset="resetFilters"
      @search="searchStudents"
      @toggle-status="toggleStudentStatus"
    />

    <StudentRecordDialogs
      v-model:form-dialog-visible="formDialogVisible"
      v-model:detail-dialog-visible="detailDialogVisible"
      :editing-id="editingId"
      :form="form"
      :schools="schools"
      :form-classes-loading="formClassesLoading"
      :form-class-options="formClassOptions"
      :change-student-school="changeStudentSchool"
      :update-student-form="updateStudentForm"
      :saving="saving"
      :save-student="saveStudent"
      :student-detail="studentDetail"
    />

    <StudentRelationshipDialogs
      v-model:guardians-dialog-visible="guardiansDialogVisible"
      v-model:bind-guardian-dialog-visible="bindGuardianDialogVisible"
      v-model:profile-dialog-visible="profileDialogVisible"
      :active-student="activeStudent"
      :guardians-loading="guardiansLoading"
      :guardians="guardians"
      :relation-label="relationLabel"
      :unbind-guardian="unbindGuardian"
      :bind-guardian-form="bindGuardianForm"
      :parent-options-loading="parentOptionsLoading"
      :search-parent-options="searchParentOptions"
      :parent-options="parentOptions"
      :parent-option-label="parentOptionLabel"
      :relation-labels="relationLabels"
      :binding-guardian="bindingGuardian"
      :submit-guardian-binding="submitGuardianBinding"
      :profile-loading="profileLoading"
      :profile-events="profileEvents"
      :short-date="shortDate"
      :update-guardian-binding="updateGuardianBinding"
    />

    <StudentImportDialogs
      ref="importUploadRef"
      v-model:import-dialog-visible="importDialogVisible"
      v-model:batches-dialog-visible="batchesDialogVisible"
      v-model:batch-detail-dialog-visible="batchDetailDialogVisible"
      :schools="schools"
      :import-options="importOptions"
      :importing="importing"
      :select-import-file="selectImportFile"
      :remove-import-file="removeImportFile"
      :submit-student-import="submitStudentImport"
      :batches-loading="batchesLoading"
      :change-import-batch-page="changeImportBatchPage"
      :import-batches="importBatches"
      :batch-pagination="batchPagination"
      :load-import-batches="loadImportBatches"
      :open-import-batch-detail="openImportBatchDetail"
      :import-batch-detail="importBatchDetail"
      :short-date="shortDate"
      :update-import-option="updateImportOption"
    />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { ElMessage, ElMessageBox } from '@/shared/ui/feedback.js'
import AdminStatePanel from '@/components/AdminStatePanel.vue'
import {
  parentOptionLabel,
  StudentDirectoryPanel,
  StudentImportDialogs,
  StudentRecordDialogs,
  StudentRelationshipDialogs,
  studentRelationLabels,
  useStudentManagement
} from '@/features/student-management/index.js'
import { relationLabel, shortDate } from '@/entities/student/index.js'

const relationLabels = studentRelationLabels
const {
  activeStudent,
  batchDetailDialogVisible,
  batchPagination,
  batchesDialogVisible,
  batchesLoading,
  bindGuardianDialogVisible,
  bindGuardianForm,
  bindingGuardian,
  changeImportBatchPage,
  changeStudentSchool,
  detailDialogVisible,
  downloadStudentImportTemplate,
  editingId,
  exportStudents,
  exporting,
  filters,
  form,
  formClassesLoading,
  formClassOptions,
  formDialogVisible,
  guardians,
  guardiansDialogVisible,
  guardiansLoading,
  handlePageSizeChange,
  importBatchDetail,
  importBatches,
  importDialogVisible,
  importing,
  importOptions,
  importUploadRef,
  loadImportBatches,
  loadSchools,
  loadStudents,
  loading,
  loadError,
  loadFailure,
  openBindGuardian,
  openCreate,
  openDetail,
  openEdit,
  openGuardians,
  openImportBatchDetail,
  openImportBatches,
  openProfile,
  openStudentImport,
  pagination,
  parentOptions,
  parentOptionsLoading,
  profileDialogVisible,
  profileEvents,
  profileLoading,
  removeImportFile,
  resetFilters,
  rows,
  saveStudent,
  saving,
  schools,
  searchParentOptions,
  searchStudents,
  selectImportFile,
  studentDetail,
  submitGuardianBinding,
  submitStudentImport,
  templateDownloading,
  toggleStudentStatus,
  unbindGuardian,
  updateGuardianBinding,
  updateImportOption,
  updateStudentForm
} = useStudentManagement({
  dialogs: ElMessageBox,
  feedback: ElMessage
})

onMounted(() => {
  loadSchools()
  loadStudents()
})
</script>

<style scoped>
.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.page-title {
  margin-bottom: 4px;
}

.page-description {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

.heading-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 1100px) {
  .page-heading {
    flex-direction: column;
  }
}
</style>
