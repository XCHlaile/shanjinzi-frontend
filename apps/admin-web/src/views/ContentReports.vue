<template>
  <section>
    <div class="page-heading">
      <div>
        <h1 class="page-title">内容举报</h1>
        <p class="page-description">查看权限范围内的举报，核对内容摘要并完成处置。</p>
      </div>
      <el-button :loading="loading" @click="loadReports">刷新</el-button>
    </div>

    <div class="panel">
      <div class="report-filters">
        <el-select
          v-model="filters.schoolId"
          clearable
          filterable
          placeholder="学校"
        >
          <el-option
            v-for="school in schoolOptions"
            :key="school.value"
            :label="school.label"
            :value="school.value"
          />
        </el-select>
        <el-select
          v-model="filters.status"
          clearable
          filterable
          allow-create
          default-first-option
          placeholder="举报状态"
        >
          <el-option label="待处理" value="PENDING" />
          <el-option label="已处理" value="HANDLED" />
          <el-option label="已忽略" value="IGNORED" />
          <el-option label="已隐藏" value="HIDDEN" />
          <el-option label="已删除" value="DELETED" />
        </el-select>
        <el-select
          v-model="filters.targetType"
          clearable
          filterable
          allow-create
          default-first-option
          placeholder="内容类型"
        >
          <el-option label="论坛主题" value="FORUM_TOPIC" />
          <el-option label="论坛回复" value="FORUM_REPLY" />
          <el-option label="动态" value="MOMENT" />
          <el-option label="动态评论" value="MOMENT_COMMENT" />
        </el-select>
        <el-button type="primary" :loading="loading" @click="searchReports">查询</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="rows" border height="520" empty-text="暂无举报数据">
        <el-table-column label="学校" min-width="180">
          <template #default="{ row }">{{ reportSchoolName(row) }}</template>
        </el-table-column>
        <el-table-column label="内容类型" width="120">
          <template #default="{ row }">{{ targetTypeLabel(row.targetType) }}</template>
        </el-table-column>
        <el-table-column prop="targetSummary" label="内容摘要" min-width="220" show-overflow-tooltip />
        <el-table-column label="举报人" min-width="130">
          <template #default="{ row }">{{ row.reporterName || row.reporterUserId || '-' }}</template>
        </el-table-column>
        <el-table-column label="内容作者" min-width="130">
          <template #default="{ row }">{{ row.targetAuthorName || row.targetAuthorUserId || '-' }}</template>
        </el-table-column>
        <el-table-column prop="reason" label="举报原因" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="举报时间" width="180">
          <template #default="{ row }">{{ shortDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button
              link
              type="warning"
              :disabled="isHandled(row)"
              @click="openHandle(row)"
            >
              处理
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
          @current-change="loadReports"
          @size-change="handlePageSizeChange"
        />
      </div>
    </div>

    <ContentReportDialogs
      v-model:detail-visible="detailVisible"
      v-model:handle-visible="handleVisible"
      v-model:handle-form="handleForm"
      :detail-loading="detailLoading"
      :handling="handling"
      :open-handle="openHandle"
      :report-detail="reportDetail"
      :report-school-name="reportSchoolName"
      :submit-handle="submitHandle"
    />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

import {
  ContentReportDialogs,
  contentReportStatusLabel,
  contentReportStatusTagType,
  contentReportTargetTypeLabel,
  isContentReportHandled,
  shortContentReportDate,
  useContentReportManagement
} from '@/features/content-report-management/index.js'
import { ElMessage, ElMessageBox } from '@/shared/ui/feedback.js'

const {
  detailLoading,
  detailVisible,
  filters,
  handleForm,
  handlePageSizeChange,
  handleVisible,
  handling,
  initialize,
  loading,
  loadReports,
  openDetail,
  openHandle,
  pagination,
  reportDetail,
  reportSchoolName,
  resetFilters,
  rows,
  schoolOptions,
  searchReports,
  submitHandle
} = useContentReportManagement({
  confirmation: ElMessageBox,
  feedback: ElMessage
})

const isHandled = isContentReportHandled
const shortDate = shortContentReportDate
const statusLabel = contentReportStatusLabel
const statusTagType = contentReportStatusTagType
const targetTypeLabel = contentReportTargetTypeLabel

onMounted(initialize)
</script>

<style scoped>
.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.page-title {
  margin-bottom: 4px;
}

.page-description {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

.report-filters {
  display: grid;
  grid-template-columns: 140px 160px 180px auto auto;
  gap: 10px;
  margin-bottom: 14px;
}

.pagination-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 16px;
  color: var(--muted);
}

@media (max-width: 980px) {
  .report-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
