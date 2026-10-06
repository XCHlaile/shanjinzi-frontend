<template>
  <div class="plain-page">
    <section class="section">
      <div class="container">
        <div class="page-heading">
          <p>校方管理</p>
          <h1>审计与导出</h1>
          <span>查看本校操作记录、风险情况并创建数据导出任务。</span>
        </div>

        <div class="page-tabs">
          <button :class="{ active: activeTab === 'audit' }" type="button" @click="switchTab('audit')">审计日志</button>
          <button :class="{ active: activeTab === 'exports' }" type="button" @click="switchTab('exports')">导出任务</button>
        </div>

        <template v-if="activeTab === 'audit'">
          <form class="toolbar" @submit.prevent="loadAuditLogs">
            <select v-model="auditFilters.module">
              <option value="">全部模块</option>
              <option v-for="option in moduleOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <select v-model="auditFilters.action">
              <option value="">全部操作</option>
              <option v-for="option in actionOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <select v-model="auditFilters.riskLevel">
              <option value="">全部风险等级</option>
              <option value="LOW">低</option><option value="MEDIUM">中</option><option value="HIGH">高</option>
            </select>
            <button class="btn btn-outline btn-sm" type="submit">查询</button>
          </form>
          <AppStatePanel :loading="loading" :error="error" :empty="!loading && !error && !auditLogs.length" empty-title="暂无审计日志" loading-text="正在加载审计日志" @retry="loadAuditLogs" />
          <div v-if="!loading && !error && auditLogs.length" class="table-panel">
            <table>
              <thead><tr><th>时间</th><th>模块/操作</th><th>目标</th><th>操作者</th><th>结果/风险</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="log in auditLogs" :key="log.id">
                  <td>{{ formatTime(log.createdAt) }}</td>
                  <td><strong>{{ moduleLabel(log.module) }}</strong><small>{{ actionLabel(log.action) }}</small></td>
                  <td>{{ targetLabel(log) }}</td>
                  <td>{{ operatorLabel(log) }}<small>{{ roleLabel(log.operatorRoleCode) }}</small></td>
                  <td>{{ resultLabel(log.result) }}<small :class="riskClass(log.riskLevel)">{{ riskLabel(log.riskLevel) }}</small></td>
                  <td><button type="button" @click="openAuditDetail(log)">详情</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <template v-else>
          <form class="export-form" @submit.prevent="createExportTask">
            <label>导出内容
              <select v-model="exportForm.taskType" required>
                <option value="STUDENTS">学生数据</option>
                <option value="USERS">用户数据</option>
                <option value="AUDIT_LOGS">审计日志</option>
              </select>
            </label>
            <label>数据范围
              <select v-model="exportForm.scopeType" required>
                <option value="SCHOOL">当前学校</option>
                <option value="CURRENT_USER">当前用户</option>
              </select>
            </label>
            <label class="filter-json">过滤条件 JSON
              <textarea v-model="exportForm.filterJson" rows="2" placeholder='例如：{"status":"ENABLED"}'></textarea>
            </label>
            <button class="btn btn-primary btn-sm" type="submit" :disabled="creatingTask">{{ creatingTask ? '创建中...' : '创建导出任务' }}</button>
            <button class="btn btn-outline btn-sm" type="button" @click="loadExportTasks">刷新</button>
          </form>
          <AppStatePanel :loading="loading" :error="error" :empty="!loading && !error && !exportTasks.length" empty-title="暂无导出任务" loading-text="正在加载导出任务" @retry="loadExportTasks" />
          <div v-if="!loading && !error && exportTasks.length" class="table-panel">
            <table>
              <thead><tr><th>任务</th><th>类型/范围</th><th>状态</th><th>记录数</th><th>创建时间</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="task in exportTasks" :key="task.id">
                  <td>#{{ task.id }}</td>
                  <td>{{ taskTypeLabel(task.taskType) }}<small>{{ scopeLabel(task.scopeType) }}</small></td>
                  <td>{{ exportStatusLabel(task.status) }}<small v-if="task.errorMessage" class="error-text">{{ task.errorMessage }}</small></td>
                  <td>{{ task.recordCount ?? '-' }}</td>
                  <td>{{ formatTime(task.createdAt) }}</td>
                  <td>
                    <button type="button" @click="openExportDetail(task)">详情</button>
                    <button v-if="canDownload(task)" type="button" :disabled="downloadingId === task.id" @click="downloadTask(task)">
                      {{ downloadingId === task.id ? '下载中...' : '下载' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <div v-if="totalPages > 1" class="pagination">
          <button type="button" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
          <span>第 {{ page }} / {{ totalPages }} 页，共 {{ total }} 条</span>
          <button type="button" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
        </div>
      </div>
    </section>

    <el-dialog v-model="detailDialog" :title="activeTab === 'audit' ? '审计日志详情' : '导出任务详情'" width="720px">
      <p v-if="detailLoading" class="dialog-state">正在加载详情...</p>
      <p v-else-if="detailError" class="dialog-state error-text">{{ detailError }}</p>
      <dl v-else class="detail-grid">
        <div v-for="[key, value] in detailEntries" :key="key"><dt>{{ key }}</dt><dd>{{ displayValue(value) }}</dd></div>
      </dl>
    </el-dialog>
  </div>
</template>

<script setup>
import AppStatePanel from '@/components/AppStatePanel.vue'
import { ElMessage } from '@/shared/ui/feedback.js'
import {
  canDownloadOperationExport as canDownload,
  displayOperationValue as displayValue,
  formatOperationTime as formatTime,
  operationActionLabel as actionLabel,
  operationActionOptions as actionOptions,
  operationExportStatusLabel as exportStatusLabel,
  operationModuleLabel as moduleLabel,
  operationModuleOptions as moduleOptions,
  operationRiskClass as riskClass,
  operationRiskLabel as riskLabel,
  operationResultLabel as resultLabel,
  operationRoleLabel as roleLabel,
  operationScopeLabel as scopeLabel,
  operationTaskTypeLabel as taskTypeLabel,
  useOperationsManagement
} from '@/features/operations/index.js'

const {
  activeTab,
  auditFilters,
  auditLogs,
  changePage,
  createExportTask,
  creatingTask,
  detailDialog,
  detailEntries,
  detailError,
  detailLoading,
  downloadingId,
  downloadTask,
  error,
  exportForm,
  exportTasks,
  loading,
  loadAuditLogs,
  loadExportTasks,
  openAuditDetail,
  openExportDetail,
  operatorLabel,
  page,
  switchTab,
  targetLabel,
  total,
  totalPages
} = useOperationsManagement({
  notify: ElMessage
})

loadAuditLogs()
</script>

<style scoped>
.plain-page { padding-top:64px; }
.page-heading { margin-bottom:20px; }
.page-heading p { color:var(--primary); font-weight:700; }
.page-heading h1 { font-size:1.8rem; margin:4px 0 6px; }
.page-heading span { color:var(--text-secondary); }
.page-heading code { color:#0f766e; }
.page-tabs { display:flex; gap:8px; margin-bottom:16px; }
.page-tabs button { border:1px solid var(--border); border-radius:8px; background:white; padding:9px 16px; cursor:pointer; }
.page-tabs button.active { color:white; background:var(--primary); border-color:var(--primary); }
.toolbar, .export-form { display:flex; flex-wrap:wrap; gap:10px; align-items:end; margin-bottom:14px; }
.toolbar input, .toolbar select, .export-form select, .export-form textarea { border:1.5px solid var(--border); border-radius:8px; padding:9px 12px; background:white; font:inherit; }
.export-form label { display:grid; gap:5px; color:var(--text-secondary); font-size:.78rem; }
.export-form .filter-json { min-width:280px; flex:1; }
.table-panel { overflow:auto; border:1px solid var(--border); border-radius:10px; background:white; }
table { width:100%; border-collapse:collapse; }
th, td { padding:13px 14px; border-bottom:1px solid var(--border); text-align:left; vertical-align:top; font-size:.84rem; }
th { color:var(--text-secondary); background:#f8fafc; }
td small { display:block; margin-top:3px; color:var(--text-secondary); }
td button, .pagination button { border:0; background:transparent; color:var(--primary); cursor:pointer; font:inherit; font-size:.82rem; margin-right:8px; }
.empty-cell { padding:38px; text-align:center; color:var(--text-secondary); }
.error-text, .risk-high { color:#dc2626 !important; }
.risk-medium { color:#d97706 !important; }
.pagination { display:flex; justify-content:center; align-items:center; gap:14px; margin-top:18px; color:var(--text-secondary); font-size:.82rem; }
.pagination button:disabled { color:#94a3b8; cursor:not-allowed; }
.dialog-state { padding:28px; text-align:center; color:var(--text-secondary); }
.detail-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.detail-grid div { padding:10px; border:1px solid var(--border); border-radius:8px; }
.detail-grid dt { color:var(--text-secondary); font-size:.76rem; }
.detail-grid dd { margin:5px 0 0; white-space:pre-wrap; overflow-wrap:anywhere; font-size:.84rem; }
@media (max-width:700px) { .detail-grid { grid-template-columns:1fr; } }
</style>
