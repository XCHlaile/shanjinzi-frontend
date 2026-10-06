<template>
  <section>
    <h1 class="page-title">审计日志</h1>
    <div class="toolbar">
      <div class="filters">
        <el-input v-model="keyword" placeholder="操作者/动作/对象" clearable style="width: 260px" />
        <el-date-picker v-model="range" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" />
      </div>
      <el-button :loading="exporting" @click="exportAudit">导出审计</el-button>
    </div>
    <div class="panel">
      <el-table v-loading="loading" :data="filteredRows" height="520" border>
        <el-table-column prop="createdAt" label="时间" width="180">
          <template #default="{ row }">{{ shortDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作者" min-width="220">
          <template #default="{ row }">{{ auditOperatorLabel(row) }}</template>
        </el-table-column>
        <el-table-column prop="action" label="动作" min-width="180">
          <template #default="{ row }">{{ auditActionDescription(row) }}</template>
        </el-table-column>
        <el-table-column prop="targetType" label="对象" min-width="190">
          <template #default="{ row }">{{ auditTargetDescription(row) }}</template>
        </el-table-column>
        <el-table-column prop="entryHash" label="Hash" min-width="260" />
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

import {
  shortAuditDate,
  useAuditLogManagement
} from '@/features/audit-log-management/index.js'
import { ElMessage } from '@/shared/ui/feedback.js'

const {
  auditActionDescription,
  auditOperatorLabel,
  auditTargetDescription,
  exportAudit,
  exporting,
  filteredRows,
  keyword,
  loadData,
  loading,
  range
} = useAuditLogManagement({ feedback: ElMessage })

const shortDate = shortAuditDate

onMounted(loadData)
</script>
