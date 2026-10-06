<template>
  <section>
    <h1 class="page-title">消息管理</h1>

    <div class="toolbar">
      <div class="filters">
        <el-input v-model="keyword" placeholder="任务ID/学校ID" clearable style="width: 220px" />
        <el-select v-model="scope" placeholder="群发范围" clearable style="width: 140px">
          <el-option label="全平台" value="PLATFORM" />
          <el-option label="指定学校" value="SCHOOL" />
          <el-option label="指定用户" value="USER" />
        </el-select>
        <el-select v-model="status" placeholder="任务状态" clearable style="width: 140px">
          <el-option v-for="item in statusOptions" :key="item" :label="broadcastStatusLabel(item)" :value="item" />
        </el-select>
        <el-button :loading="loading" @click="loadData">刷新</el-button>
      </div>
      <div class="filters">
        <el-button :loading="exporting" @click="exportMessages">导出</el-button>
        <el-button type="primary" @click="openCreate">新建群发</el-button>
      </div>
    </div>

    <div class="panel">
      <el-table v-loading="loading" :data="filteredRows" height="500" border>
        <el-table-column prop="id" label="任务ID" width="90" />
        <el-table-column label="范围" width="120">
          <template #default="{ row }">{{ scopeLabel(row.scope) }}</template>
        </el-table-column>
        <el-table-column prop="schoolId" label="学校ID" width="100">
          <template #default="{ row }">{{ row.schoolId || '-' }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="130">
          <template #default="{ row }">{{ broadcastStatusLabel(row.status) }}</template>
        </el-table-column>
        <el-table-column prop="totalCount" label="总数" width="90" />
        <el-table-column prop="successCount" label="成功" width="90" />
        <el-table-column prop="failureCount" label="失败" width="90" />
        <el-table-column label="创建时间" min-width="170">
          <template #default="{ row }">{{ shortDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="完成时间" min-width="170">
          <template #default="{ row }">{{ shortDate(row.completedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
            <el-button link type="warning" :disabled="!canRetry(row)" @click="retryBroadcast(row)">重试</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
        @current-change="loadData"
      />
    </div>

    <MessageBroadcastDialogs
      v-model:create-visible="createVisible"
      v-model:detail-visible="detailVisible"
      v-model:form="form"
      :create-broadcast="createBroadcast"
      :creating="creating"
      :detail="detail"
      :detail-loading="detailLoading"
      :options-loading="optionsLoading"
      :recipient-status-rows="recipientStatusRows"
      :schools="schools"
      :users="users"
    />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

import {
  MessageBroadcastDialogs,
  canRetryMessageBroadcast,
  messageBroadcastScopeLabel,
  messageBroadcastStatusLabel,
  shortMessageBroadcastDate,
  useMessageBroadcastManagement
} from '@/features/message-broadcast-management/index.js'
import { ElMessage } from '@/shared/ui/feedback.js'

const {
  createBroadcast,
  createVisible,
  creating,
  detail,
  detailLoading,
  detailVisible,
  exportMessages,
  exporting,
  filteredRows,
  form,
  keyword,
  loadData,
  loading,
  openCreate,
  optionsLoading,
  page,
  pageSize,
  recipientStatusRows,
  retryBroadcast,
  schools,
  scope,
  showDetail,
  status,
  statusOptions,
  total,
  users
} = useMessageBroadcastManagement({ feedback: ElMessage })

const broadcastStatusLabel = messageBroadcastStatusLabel
const canRetry = canRetryMessageBroadcast
const scopeLabel = messageBroadcastScopeLabel
const shortDate = shortMessageBroadcastDate

onMounted(loadData)
</script>
