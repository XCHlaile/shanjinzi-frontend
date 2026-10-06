<template>
  <el-dialog
    v-model="formDialogVisible"
    :title="editingId ? '编辑班级' : '新增班级'"
    width="560px"
  >
    <el-form label-width="96px">
      <el-form-item v-if="!editingId" label="所属学校">
        <el-select
          v-model="form.schoolId"
          placeholder="不选时由当前账号的学校确定"
          clearable
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="school in schools"
            :key="school.id"
            :label="school.name"
            :value="school.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="班级名称" required>
        <el-input v-model.trim="form.name" maxlength="80" show-word-limit />
      </el-form-item>
      <el-form-item label="年级名称">
        <el-input v-model.trim="form.gradeName" maxlength="80" show-word-limit />
      </el-form-item>
      <el-form-item label="排序值">
        <el-input-number v-model="form.sortOrder" :controls="false" style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="formDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="saveClass">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="detailDialogVisible" title="班级详情" width="640px">
    <div v-loading="detailLoading" class="detail-body">
      <el-descriptions v-if="classDetail" :column="2" border>
        <el-descriptions-item label="班级 ID">{{ classDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="班级名称">{{ classDetail.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所属学校">{{ schoolName(classDetail.schoolId) }}</el-descriptions-item>
        <el-descriptions-item label="年级">{{ classDetail.gradeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="排序值">{{ classDetail.sortOrder ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ classStatusLabel(classDetail.status) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ shortDate(classDetail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ shortDate(classDetail.updatedAt) }}</el-descriptions-item>
      </el-descriptions>
    </div>
  </el-dialog>

  <el-dialog
    v-model="teachersDialogVisible"
    :title="`分配教师 · ${activeClass?.name || ''}`"
    width="620px"
  >
    <div v-loading="teachersLoading" class="teacher-dialog-body">
      <el-alert
        title="保存后会用当前选择覆盖该班级原有教师，请确认无误后提交。"
        type="info"
        show-icon
        :closable="false"
      />
      <el-form label-width="96px">
        <el-form-item label="所属学校">
          <span>{{ schoolName(activeClass?.schoolId) }}</span>
        </el-form-item>
        <el-form-item label="任课教师">
          <el-select
            v-model="selectedTeacherIds"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="选择教师；留空表示移除全部教师"
            style="width: 100%"
          >
            <el-option
              v-for="teacher in teacherOptions"
              :key="teacher.id"
              :label="teacherLabel(teacher)"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="teachersDialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        :loading="teachersSaving"
        :disabled="teachersLoading"
        @click="saveTeachers"
      >
        保存分配
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {
  classStatusLabel,
  shortDate
} from '../../../entities/student/index.js'
import { teacherLabel } from '../lib/classManagementViewModel.js'

defineProps({
  activeClass: { type: Object, default: null },
  classDetail: { type: Object, default: null },
  detailLoading: Boolean,
  editingId: { type: [Number, String], default: null },
  saveClass: { type: Function, required: true },
  saveTeachers: { type: Function, required: true },
  saving: Boolean,
  schoolName: { type: Function, required: true },
  schools: { type: Array, default: () => [] },
  teacherOptions: { type: Array, default: () => [] },
  teachersLoading: Boolean,
  teachersSaving: Boolean
})

const classForm = defineModel('form', { type: Object, required: true })
const formDialogVisible = defineModel('formDialogVisible', { type: Boolean })
const detailDialogVisible = defineModel('detailDialogVisible', { type: Boolean })
const teachersDialogVisible = defineModel('teachersDialogVisible', { type: Boolean })
const selectedTeacherIds = defineModel('selectedTeacherIds', {
  type: Array,
  default: () => []
})

const form = classForm
</script>

<style scoped>
.detail-body { min-height:120px; }
.teacher-dialog-body { min-height:180px; }
.teacher-dialog-body .el-alert { margin-bottom:18px; }
</style>
