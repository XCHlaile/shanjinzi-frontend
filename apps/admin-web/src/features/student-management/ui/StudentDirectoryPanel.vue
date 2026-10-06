<template>
  <div class="student-directory">
    <div class="toolbar student-toolbar">
      <el-input v-model="filters.name" placeholder="学生姓名" clearable @keyup.enter="$emit('search')" />
      <el-input v-model="filters.studentNo" placeholder="学生编号" clearable @keyup.enter="$emit('search')" />
      <el-input-number v-model="filters.classId" :controls="false" :min="1" placeholder="班级 ID" />
      <el-input v-model="filters.enrollmentStatus" placeholder="学籍状态" clearable @keyup.enter="$emit('search')" />
      <el-select v-model="filters.status" placeholder="账号状态" clearable>
        <el-option label="启用" value="ACTIVE" />
        <el-option label="禁用" value="DISABLED" />
      </el-select>
      <el-button type="primary" :loading="loading" @click="$emit('search')">查询</el-button>
      <el-button @click="$emit('reset')">重置</el-button>
    </div>

    <div class="panel">
      <el-table v-loading="loading" :data="rows" border height="520" empty-text="暂无学生数据">
        <el-table-column label="学生编号" min-width="130">
          <template #default="{ row }">{{ row.studentNo || row.id || '-' }}</template>
        </el-table-column>
        <el-table-column prop="name" label="学生姓名" min-width="120" />
        <el-table-column prop="schoolName" label="学校" min-width="180" />
        <el-table-column prop="className" label="班级" min-width="130" />
        <el-table-column prop="phoneNum" label="手机号" width="130">
          <template #default="{ row }">{{ row.phoneNum || '-' }}</template>
        </el-table-column>
        <el-table-column label="性别" width="90">
          <template #default="{ row }">{{ genderLabel(row.gender) }}</template>
        </el-table-column>
        <el-table-column label="绑定家长" width="100">
          <template #default="{ row }">{{ row.guardianCount ?? 0 }}</template>
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
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">{{ shortDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="455" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="$emit('open-detail', row)">详情</el-button>
            <el-button link type="primary" @click="$emit('open-edit', row)">编辑</el-button>
            <el-button link type="primary" @click="$emit('open-bind-guardian', row)">绑定家长</el-button>
            <el-button link type="primary" @click="$emit('open-guardians', row)">家长</el-button>
            <el-button link type="primary" @click="$emit('open-profile', row)">档案</el-button>
            <el-button
              link
              :type="row.status === 'ACTIVE' ? 'warning' : 'success'"
              @click="$emit('toggle-status', row)"
            >
              {{ row.status === 'ACTIVE' ? '禁用' : '启用' }}
            </el-button>
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
          @current-change="$emit('load')"
          @size-change="$emit('page-size-change')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  enrollmentStatusLabel,
  genderLabel,
  shortDate,
  studentStatusLabel
} from '@/entities/student/index.js'

defineProps({
  loading: Boolean,
  rows: { type: Array, default: () => [] }
})

defineEmits([
  'load', 'open-bind-guardian', 'open-detail', 'open-edit', 'open-guardians',
  'open-profile', 'page-size-change', 'reset', 'search', 'toggle-status'
])

const filters = defineModel('filters', { type: Object, required: true })
const pagination = defineModel('pagination', { type: Object, required: true })
</script>

<style scoped>
.student-toolbar {
  display:grid;
  grid-template-columns:minmax(150px,1fr) minmax(150px,1fr) 130px minmax(140px,1fr) 130px auto auto;
  gap:10px;
  margin-bottom:14px;
}
.pagination-row { display:flex; align-items:center; justify-content:space-between; gap:16px; padding-top:16px; color:var(--muted); }
@media (max-width:1100px) { .student-toolbar { grid-template-columns:repeat(2,minmax(0,1fr)); } }
</style>
