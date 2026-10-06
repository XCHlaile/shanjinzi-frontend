<template>
  <section>
    <h1 class="page-title">赛事管理</h1>
    <div class="toolbar">
      <div class="filters">
        <el-input v-model="keyword" placeholder="赛事名称" clearable style="width: 240px" />
        <el-select v-model="status" placeholder="发布状态" clearable style="width: 140px">
          <el-option label="草稿" value="DRAFT" />
          <el-option label="已发布" value="PUBLISHED" />
          <el-option label="已下线" value="OFFLINE" />
          <el-option label="已取消" value="CANCELLED" />
        </el-select>
      </div>
      <div class="filters">
        <el-button :loading="exporting" @click="exportCompetitions">导出</el-button>
        <el-button :disabled="!selectedRow" @click="openRegistrations(selectedRow)">查看报名明细</el-button>
        <el-button @click="openParentRegistrations">按家长查询报名</el-button>
        <el-button type="primary" @click="openCreate">新增赛事</el-button>
      </div>
    </div>

    <div class="panel">
      <el-table
        v-loading="loading"
        :data="filteredRows"
        border
        highlight-current-row
        height="520"
        @current-change="selectedRow = $event"
      >
        <el-table-column prop="title" label="赛事名称" min-width="220" />
        <el-table-column prop="scopeType" label="范围" width="110">
          <template #default="{ row }">{{ competitionScopeLabel(row.scopeType) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="发布状态" width="110">
          <template #default="{ row }">{{ competitionStatusLabel(row.status) }}</template>
        </el-table-column>
        <el-table-column prop="competitionStartAt" label="赛事时间" width="170">
          <template #default="{ row }">{{ shortDate(row.competitionStartAt) }}</template>
        </el-table-column>
        <el-table-column prop="registrationEndAt" label="报名截止" width="170">
          <template #default="{ row }">{{ shortDate(row.registrationEndAt) }}</template>
        </el-table-column>
        <el-table-column label="报名人数" width="130">
          <template #default="{ row }">{{ row.registeredCount || 0 }} / {{ row.maxParticipants || 0 }}</template>
        </el-table-column>
        <el-table-column label="操作" width="360" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link @click="openRegistrations(row)">报名明细</el-button>
            <el-button link @click="setInfoUrl(row)">设链接</el-button>
            <el-button v-if="row.status !== 'PUBLISHED'" link type="success" @click="publishCompetition(row)">发布</el-button>
            <el-button v-else link type="warning" @click="offlineCompetition(row)">下线</el-button>
            <el-button v-if="row.status === 'OFFLINE'" link type="danger" @click="removeCompetition(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <CompetitionFormDialog
      v-model:dialog-visible="dialogVisible"
      v-model:form="form"
      :editing-id="editingId"
      :handle-scope-type-change="handleScopeTypeChange"
      :save-competition="saveCompetition"
      :saving="saving"
      :school-scope-options="schoolScopeOptions"
      :scope-options-loading="scopeOptionsLoading"
    />

    <CompetitionRegistrationDialog
      v-model:registrations-dialog-visible="registrationsDialogVisible"
      v-model:registration-keyword="registrationKeyword"
      :load-competition-registrations="loadCompetitionRegistrations"
      :registration-competition="registrationCompetition"
      :registration-dialog-title="registrationDialogTitle"
      :registration-page="registrationPage"
      :registration-page-size="registrationPageSize"
      :registration-rows="registrationRows"
      :registrations-loading="registrationsLoading"
      :registration-total="registrationTotal"
    />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

import {
  CompetitionFormDialog,
  CompetitionRegistrationDialog,
  competitionScopeLabel,
  competitionStatusLabel,
  shortCompetitionDate,
  useCompetitionManagement
} from '@/features/competition-management/index.js'
import { ElMessage, ElMessageBox } from '@/shared/ui/feedback.js'

const {
  dialogVisible,
  editingId,
  exportCompetitions,
  exporting,
  filteredRows,
  form,
  handleScopeTypeChange,
  initialize,
  keyword,
  loadCompetitionRegistrations,
  loading,
  offlineCompetition,
  openCreate,
  openEdit,
  openParentRegistrations,
  openRegistrations,
  publishCompetition,
  registrationCompetition,
  registrationDialogTitle,
  registrationKeyword,
  registrationPage,
  registrationPageSize,
  registrationRows,
  registrationsDialogVisible,
  registrationsLoading,
  registrationTotal,
  removeCompetition,
  saveCompetition,
  saving,
  schoolScopeOptions,
  scopeOptionsLoading,
  selectedRow,
  setInfoUrl,
  status
} = useCompetitionManagement({
  dialogs: ElMessageBox,
  feedback: ElMessage
})

const shortDate = shortCompetitionDate

onMounted(initialize)
</script>
