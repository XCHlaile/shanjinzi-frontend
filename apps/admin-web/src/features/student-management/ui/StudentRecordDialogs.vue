<template>
  <el-dialog
    v-model="formDialogVisible"
    :title="editingId ? '编辑学生' : '新增学生'"
    width="620px"
  >
    <el-form label-width="100px">
      <el-form-item v-if="!editingId" label="学校">
        <el-select
          :model-value="form.schoolId"
          placeholder="选择学校"
          clearable
          filterable
          style="width: 100%"
          @update:model-value="changeStudentSchool"
        >
          <el-option
            v-for="school in schools"
            :key="school.id"
            :label="school.name"
            :value="school.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学生姓名" required>
        <el-input
          :model-value="form.name"
          maxlength="50"
          show-word-limit
          @update:model-value="value => updateStudentForm('name', value)"
        />
      </el-form-item>
      <el-form-item label="性别">
        <el-select
          :model-value="form.gender"
          placeholder="选择性别"
          clearable
          style="width: 100%"
          @update:model-value="value => updateStudentForm('gender', value)"
        >
          <el-option label="男" value="MALE" />
          <el-option label="女" value="FEMALE" />
        </el-select>
      </el-form-item>
      <el-form-item label="出生日期">
        <el-date-picker
          :model-value="form.birthday"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择出生日期"
          style="width: 100%"
          @update:model-value="value => updateStudentForm('birthday', value)"
        />
      </el-form-item>
      <el-form-item label="学生编号">
        <el-input
          :model-value="form.studentNo"
          maxlength="80"
          @update:model-value="value => updateStudentForm('studentNo', value)"
        />
      </el-form-item>
      <el-form-item label="班级">
        <el-select
          :model-value="form.classId"
          :disabled="!form.schoolId"
          :loading="formClassesLoading"
          :placeholder="form.schoolId ? '选择该学校的班级' : '请先选择学校'"
          clearable
          filterable
          style="width: 100%"
          @update:model-value="value => updateStudentForm('classId', value)"
        >
          <el-option
            v-for="classItem in formClassOptions"
            :key="classItem.id"
            :label="classOptionLabel(classItem)"
            :value="classItem.id"
            :disabled="isInactiveClass(classItem)"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="!editingId" label="手机号" required>
        <el-input
          :model-value="form.phoneNum"
          maxlength="11"
          inputmode="numeric"
          placeholder="请输入 11 位手机号"
          show-word-limit
          @update:model-value="value => updateStudentForm('phoneNum', value.trim())"
        />
      </el-form-item>
      <el-form-item v-if="editingId" label="学籍状态">
        <el-input
          :model-value="form.enrollmentStatus"
          placeholder="例如 ENROLLED"
          @update:model-value="value => updateStudentForm('enrollmentStatus', value)"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="formDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="saveStudent">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="detailDialogVisible" title="学生详情" width="700px">
    <el-descriptions v-if="studentDetail" :column="2" border>
      <el-descriptions-item label="学生 ID">{{ studentDetail.id }}</el-descriptions-item>
      <el-descriptions-item label="学生编号">{{ studentDetail.studentNo || '-' }}</el-descriptions-item>
      <el-descriptions-item label="姓名">{{ studentDetail.name || '-' }}</el-descriptions-item>
      <el-descriptions-item label="性别">{{ genderLabel(studentDetail.gender) }}</el-descriptions-item>
      <el-descriptions-item label="手机号">{{ studentDetail.phoneNum || '-' }}</el-descriptions-item>
      <el-descriptions-item label="学校">{{ studentDetail.schoolName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="出生日期">{{ studentDetail.birthday || '-' }}</el-descriptions-item>
      <el-descriptions-item label="班级">{{ detailClassNames(studentDetail) }}</el-descriptions-item>
      <el-descriptions-item label="家长数量">{{ studentDetail.guardianCount ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="学籍状态">
        {{ enrollmentStatusLabel(studentDetail.enrollmentStatus) }}
      </el-descriptions-item>
      <el-descriptions-item label="账号状态">
        {{ studentStatusLabel(studentDetail.status) }}
      </el-descriptions-item>
      <el-descriptions-item label="导入批次">{{ studentDetail.importBatchId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ shortDate(studentDetail.createdAt) }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup>
import {
  detailClassNames,
  enrollmentStatusLabel,
  genderLabel,
  shortDate,
  studentStatusLabel
} from '../../../entities/student/index.js'
import {
  classOptionLabel,
  isInactiveClass
} from '../lib/studentManagementViewModel.js'

defineProps({
  changeStudentSchool: { type: Function, required: true },
  editingId: { type: [Number, String], default: null },
  form: { type: Object, required: true },
  formClassesLoading: Boolean,
  formClassOptions: { type: Array, default: () => [] },
  saveStudent: { type: Function, required: true },
  saving: Boolean,
  schools: { type: Array, default: () => [] },
  studentDetail: { type: Object, default: null },
  updateStudentForm: { type: Function, required: true }
})

const formDialogVisible = defineModel('formDialogVisible', { type: Boolean })
const detailDialogVisible = defineModel('detailDialogVisible', { type: Boolean })
</script>
