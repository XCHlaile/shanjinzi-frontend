<template>
  <el-dialog
    v-model="studentsDialogVisible"
    :title="`学生管理 · ${activeClass?.name || ''}`"
    width="900px"
  >
    <div v-loading="studentsLoading" class="student-dialog-body">
      <el-alert
        title="按接口规则，添加其他班级的学生会将其转入本班；转出学生时需选择同校的其他启用班级。"
        type="info"
        show-icon
        :closable="false"
      />

      <div class="student-add-row">
        <el-select
          v-model="selectedStudentId"
          filterable
          clearable
          placeholder="选择同校学生"
        >
          <el-option
            v-for="student in availableStudents"
            :key="student.id"
            :label="studentOptionLabel(student)"
            :value="student.id"
          />
        </el-select>
        <el-button
          type="primary"
          :loading="studentSaving"
          :disabled="!selectedStudentId"
          @click="addStudentToClass"
        >
          添加/转入本班
        </el-button>
      </div>

      <el-table :data="classStudents" border max-height="390" empty-text="本班暂无学生">
        <el-table-column prop="name" label="学生姓名" min-width="130" />
        <el-table-column label="学生编号" min-width="130">
          <template #default="{ row }">{{ row.studentNo || row.id || '-' }}</template>
        </el-table-column>
        <el-table-column label="性别" width="90">
          <template #default="{ row }">{{ genderLabel(row.gender) }}</template>
        </el-table-column>
        <el-table-column label="学籍状态" width="110">
          <template #default="{ row }">{{ enrollmentStatusLabel(row.enrollmentStatus) }}</template>
        </el-table-column>
        <el-table-column label="账号状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ studentStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="warning" @click="openTransferStudent(row)">转出本班</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>

  <el-dialog
    v-model="transferDialogVisible"
    :title="`转出学生 · ${transferStudent?.name || ''}`"
    width="520px"
    append-to-body
  >
    <el-alert
      title="当前接口不支持将班级置空，请选择同校的其他启用班级作为转入目标。"
      type="warning"
      show-icon
      :closable="false"
      class="transfer-alert"
    />
    <el-form label-width="96px">
      <el-form-item label="当前班级">
        <span>{{ activeClass?.name || '-' }}</span>
      </el-form-item>
      <el-form-item label="目标班级" required>
        <el-select
          v-model="targetClassId"
          filterable
          placeholder="选择目标班级"
          style="width: 100%"
        >
          <el-option
            v-for="classOption in transferClassOptions"
            :key="classOption.id"
            :label="classOptionLabel(classOption)"
            :value="classOption.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="transferDialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        :loading="studentSaving"
        :disabled="!targetClassId"
        @click="transferStudentToClass"
      >
        确认转出
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {
  enrollmentStatusLabel,
  genderLabel,
  studentStatusLabel
} from '../../../entities/student/index.js'
import {
  classOptionLabel,
  studentOptionLabel
} from '../lib/classManagementViewModel.js'

defineProps({
  activeClass: { type: Object, default: null },
  addStudentToClass: { type: Function, required: true },
  availableStudents: { type: Array, default: () => [] },
  classStudents: { type: Array, default: () => [] },
  openTransferStudent: { type: Function, required: true },
  studentSaving: Boolean,
  studentsLoading: Boolean,
  transferClassOptions: { type: Array, default: () => [] },
  transferStudent: { type: Object, default: null },
  transferStudentToClass: { type: Function, required: true }
})

const studentsDialogVisible = defineModel('studentsDialogVisible', { type: Boolean })
const transferDialogVisible = defineModel('transferDialogVisible', { type: Boolean })
const selectedStudentId = defineModel('selectedStudentId', {
  type: [Number, String],
  default: null
})
const targetClassId = defineModel('targetClassId', {
  type: [Number, String],
  default: null
})
</script>

<style scoped>
.student-dialog-body { min-height:260px; }
.student-dialog-body > .el-alert { margin-bottom:16px; }
.student-add-row { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
.student-add-row :deep(.el-select) { flex:1; }
.transfer-alert { margin-bottom:18px; }

@media (max-width:760px) {
  .student-add-row { align-items:stretch; flex-direction:column; }
}
</style>
