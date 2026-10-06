<template>
  <section>
    <h1 class="page-title">导出任务</h1>
    <div class="toolbar">
      <div class="filters">
        <el-select v-model="type" placeholder="导出类型" clearable style="width: 160px">
          <el-option label="用户" value="USERS" />
          <el-option label="学校" value="SCHOOLS" />
          <el-option label="报名" value="REGISTRATIONS" />
          <el-option label="审计" value="AUDIT_LOGS" />
        </el-select>
        <el-select v-model="status" placeholder="状态" clearable style="width: 140px">
          <el-option label="完成" value="COMPLETED" />
          <el-option label="失败" value="FAILED" />
        </el-select>
      </div>
      <el-button type="primary" :loading="creating" @click="createExport">新建导出</el-button>
    </div>
    <div class="panel">
      <el-table v-loading="loading" :data="filteredRows" height="520" border>
        <el-table-column prop="id" label="任务 ID" width="110" />
        <el-table-column label="类型" width="130">
          <template #default="{ row }">{{ exportTypeLabel(row.taskType || row.type) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column label="文件" min-width="260">
          <template #default="{ row }">{{ row.fileId ? `文件 #${row.fileId}` : '-' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">{{ shortDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :loading="downloadingId === row.id"
              :disabled="row.status !== 'COMPLETED' || !row.fileId"
              @click="download(row)"
            >
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

import {
  exportTaskTypeLabel,
  shortExportTaskDate,
  useExportTaskDirectory
} from '@/features/export-tasks/index.js'
import { ElMessage } from '@/shared/ui/feedback.js'

const {
  createExport,
  creating,
  download,
  downloadingId,
  filteredRows,
  loadData,
  loading,
  status,
  type
} = useExportTaskDirectory({ feedback: ElMessage })

const exportTypeLabel = exportTaskTypeLabel
const shortDate = shortExportTaskDate

onMounted(loadData)
</script>
