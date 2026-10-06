<template>
  <div class="plain-page">
    <section class="section">
      <div class="container">
        <div class="page-heading">
          <p>校方管理 · Open API</p>
          <h1>{{ title }}</h1>
          <span>当前页面使用管理端与用户端共享的 <code>/api/open/**</code> 接口。</span>
        </div>

        <SchoolRosterToolbar
          v-model:class-id-filter="classIdFilter"
          v-model:keyword="keyword"
          v-model:status-filter="statusFilter"
          :class-options="classOptions"
          :class-options-loading="classOptionsLoading"
          :exporting="exporting"
          :mode="mode"
          :mode-label="modeLabel"
          @create="openCreate"
          @export="createStudentExport"
          @open-import="openImportBatches"
          @search="submitSearch"
        />

        <AppStatePanel
          :loading="loading"
          :error="loadFailure || loadError"
          :empty="!loading && !loadError && !rows.length"
          :empty-title="`暂无${modeLabel}`"
          empty-text="可调整筛选条件后重新查询，或新增一条记录。"
          loading-text="正在加载本校名册"
          @retry="loadRows"
        />

        <SchoolRosterTable
          v-if="!loading && !loadError && rows.length"
          :mode="mode"
          :mode-label="modeLabel"
          :rows="rows"
          @edit-student="openEditStudent"
          @edit-user="openEditUser"
          @open-guardians="openGuardians"
          @open-profile="openProfile"
          @toggle-student-status="toggleStudentStatus"
          @toggle-user-status="toggleUserStatus"
        />

        <div v-if="totalPages > 1" class="pagination">
          <button type="button" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
          <span>第 {{ page }} / {{ totalPages }} 页，共 {{ total }} 条</span>
          <button type="button" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
        </div>
      </div>
    </section>

    <SchoolRosterRecordDialog
      v-model:visible="recordDialog"
      v-model:student-form="studentForm"
      v-model:user-form="userForm"
      :class-options="classOptions"
      :class-options-loading="classOptionsLoading"
      :editing-id="editingId"
      :form-error="formError"
      :mode="mode"
      :record-label="recordLabel"
      :save-record="saveRecord"
      :saving="saving"
    />

    <StudentGuardianDialogs
      v-model:visible="guardianDialog"
      v-model:bind-visible="bindGuardianDialog"
      v-model:bind-form="bindGuardianForm"
      :active-student="activeStudent"
      :binding="bindingGuardian"
      :error="guardianError"
      :guardians="guardians"
      :loading="guardianLoading"
      :open-bind-guardian="openBindGuardian"
      :parent-options="parentOptions"
      :parent-options-loading="parentOptionsLoading"
      :search-parent-options="searchParentOptions"
      :submit-guardian-binding="submitGuardianBinding"
      :unbind-student-guardian="unbindStudentGuardian"
    />

    <StudentProfileDialog
      v-model:visible="profileDialog"
      :active-student="activeStudent"
      :error="drawerError"
      :events="profileEvents"
      :loading="drawerLoading"
    />

    <StudentImportDialog
      v-model:visible="batchDialog"
      v-model:form="studentImportForm"
      :batches="importBatches"
      :download-student-import-template="downloadStudentImportTemplate"
      :error="batchError"
      :file="studentImportFile"
      :importing="importing"
      :input-key="importInputKey"
      :load-import-batches="loadImportBatches"
      :loading="batchLoading"
      :select-import-file="selectImportFile"
      :submit-student-import="submitStudentImport"
      :template-downloading="templateDownloading"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppStatePanel from '@/components/AppStatePanel.vue'
import { ElMessage, ElMessageBox } from '@/shared/ui/feedback.js'
import {
  SchoolRosterRecordDialog,
  SchoolRosterTable,
  SchoolRosterToolbar,
  StudentGuardianDialogs,
  StudentImportDialog,
  StudentProfileDialog
} from '@/features/school-roster/ui/index.js'
import { useSchoolRosterManagement } from '@/features/school-roster/index.js'

const route = useRoute()
const mode = computed(() => route.meta.rosterMode || 'students')
const {
  activeStudent,
  batchDialog,
  batchError,
  batchLoading,
  bindGuardianDialog,
  bindGuardianForm,
  bindingGuardian,
  changePage,
  classIdFilter,
  classOptions,
  classOptionsLoading,
  createStudentExport,
  downloadStudentImportTemplate,
  drawerError,
  drawerLoading,
  editingId,
  exporting,
  formError,
  guardianDialog,
  guardianError,
  guardianLoading,
  guardians,
  importBatches,
  importing,
  importInputKey,
  keyword,
  loadError,
  loadFailure,
  loadImportBatches,
  loadRows,
  loading,
  modeLabel,
  openBindGuardian,
  openCreate,
  openEditStudent,
  openEditUser,
  openGuardians,
  openImportBatches,
  openProfile,
  page,
  parentOptions,
  parentOptionsLoading,
  profileDialog,
  profileEvents,
  recordLabel,
  recordDialog,
  rows,
  saveRecord,
  saving,
  searchParentOptions,
  selectImportFile,
  statusFilter,
  studentForm,
  studentImportFile,
  studentImportForm,
  submitGuardianBinding,
  submitSearch,
  submitStudentImport,
  templateDownloading,
  title,
  toggleStudentStatus,
  toggleUserStatus,
  total,
  totalPages,
  unbindStudentGuardian,
  userForm
} = useSchoolRosterManagement({
  mode,
  confirm: ElMessageBox.confirm,
  alert: ElMessageBox.alert,
  notify: ElMessage
})
</script>

<style scoped>
.plain-page { padding-top:var(--nav-height, 72px); }
.page-heading { margin-bottom:20px; }
.page-heading p { color:var(--primary); font-weight:700; }
.page-heading h1 { font-size:1.8rem; margin:4px 0 6px; }
.page-heading span { color:var(--text-secondary); }
.page-heading code { color:#0f766e; }
.pagination button { margin-right:8px; border:0; background:transparent; color:var(--primary); cursor:pointer; font:inherit; font-size:.82rem; }
.pagination { display:flex; justify-content:center; align-items:center; gap:16px; margin-top:18px; color:var(--text-secondary); font-size:.84rem; }
.pagination button:disabled { color:#94a3b8; cursor:not-allowed; }

@media (max-width: 700px) {
  .section { padding: 48px 0; }
  .pagination { align-items: stretch; flex-direction: column; text-align: center; }
  .pagination button { min-height: 44px; margin: 0; }
}
</style>
