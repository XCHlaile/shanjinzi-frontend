<template>
  <el-dialog
    v-model="registrationsDialogVisible"
    :title="registrationDialogTitle"
    width="820px"
  >
    <div v-if="registrationCompetition?.id" class="registration-filters">
      <el-input
        v-model="registrationKeyword"
        clearable
        placeholder="学生、班级、家长或手机号"
        @keyup.enter="loadCompetitionRegistrations(1)"
      />
      <el-button
        type="primary"
        :loading="registrationsLoading"
        @click="loadCompetitionRegistrations(1)"
      >
        筛选
      </el-button>
    </div>
    <el-table v-loading="registrationsLoading" :data="registrationRows" border max-height="420">
      <el-table-column label="学生姓名" min-width="150">
        <template #default="{ row }">{{ registrationStudentName(row) }}</template>
      </el-table-column>
      <el-table-column label="班级" min-width="150">
        <template #default="{ row }">{{ registrationClassName(row) }}</template>
      </el-table-column>
      <el-table-column label="家长姓名" min-width="150">
        <template #default="{ row }">{{ registrationGuardianName(row) }}</template>
      </el-table-column>
      <el-table-column label="家长电话" min-width="180">
        <template #default="{ row }">{{ registrationGuardianPhone(row) }}</template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="registrationCompetition?.id && registrationTotal > registrationPageSize"
      class="registration-pagination"
      layout="prev, pager, next, total"
      :current-page="registrationPage"
      :page-size="registrationPageSize"
      :total="registrationTotal"
      @current-change="loadCompetitionRegistrations"
    />
  </el-dialog>
</template>

<script setup>
import {
  registrationClassName,
  registrationGuardianName,
  registrationGuardianPhone,
  registrationStudentName
} from '../lib/competitionManagementViewModel.js'

defineProps({
  loadCompetitionRegistrations: { type: Function, required: true },
  registrationCompetition: { type: Object, default: null },
  registrationDialogTitle: { type: String, required: true },
  registrationPage: { type: Number, required: true },
  registrationPageSize: { type: Number, required: true },
  registrationRows: { type: Array, default: () => [] },
  registrationsLoading: Boolean,
  registrationTotal: { type: Number, required: true }
})

const registrationsDialogVisible = defineModel('registrationsDialogVisible', {
  type: Boolean
})
const registrationKeyword = defineModel('registrationKeyword', {
  type: String,
  default: ''
})
</script>

<style scoped>
.registration-filters {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto;
  gap: 10px;
  margin-bottom: 12px;
}

.registration-pagination {
  justify-content: flex-end;
  margin-top: 14px;
}
</style>
