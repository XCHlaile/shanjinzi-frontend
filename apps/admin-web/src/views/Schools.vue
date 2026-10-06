<template>
  <section>
    <h1 class="page-title">学校管理</h1>
    <div class="toolbar">
      <div class="filters">
        <el-input v-model="keyword" class="filter-control" aria-label="按学校名称筛选" placeholder="学校名称" clearable @keyup.enter="submitSearch" />
        <el-input v-model="contactName" class="filter-control" aria-label="按联系人筛选" placeholder="联系人" clearable @keyup.enter="submitSearch" />
        <el-select v-model="status" class="filter-status" aria-label="按学校状态筛选" placeholder="状态" clearable>
          <el-option label="合作中" value="ACTIVE" />
          <el-option label="停用" value="DISABLED" />
        </el-select>
        <el-button type="primary" :loading="loading" @click="submitSearch">查询</el-button>
        <el-button :disabled="loading" @click="resetSearch">重置</el-button>
      </div>
      <div class="toolbar-actions">
        <el-button :loading="exporting" :disabled="loading || filteredRows.length === 0" @click="exportSchools">
          导出
        </el-button>
        <el-button type="primary" @click="openCreate">新增学校</el-button>
      </div>
    </div>
    <div class="panel">
      <el-table v-loading="loading" class="desktop-table" :data="filteredRows" height="520" border>
        <el-table-column prop="name" label="学校" min-width="220" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">{{ schoolStatusLabel(row.status) }}</template>
        </el-table-column>
        <el-table-column prop="contactName" label="联系人" width="140" />
        <el-table-column prop="contactPhone" label="联系电话" width="150" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">{{ shortDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="toggleStatus(row)">{{ row.status === 'ACTIVE' ? '停用' : '启用' }}</el-button>
            <el-button link type="danger" @click="removeSchool(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-loading="loading" class="mobile-directory" aria-live="polite">
        <article v-for="row in filteredRows" :key="row.id" class="mobile-record">
          <header>
            <strong>{{ row.name || '-' }}</strong>
            <span class="record-status">{{ schoolStatusLabel(row.status) }}</span>
          </header>
          <dl>
            <div><dt>联系人</dt><dd>{{ row.contactName || '-' }}</dd></div>
            <div><dt>联系电话</dt><dd>{{ row.contactPhone || '-' }}</dd></div>
            <div><dt>创建时间</dt><dd>{{ shortDate(row.createdAt) || '-' }}</dd></div>
          </dl>
          <div class="mobile-actions" aria-label="学校操作">
            <el-button @click="openEdit(row)">编辑</el-button>
            <el-button type="warning" @click="toggleStatus(row)">{{ row.status === 'ACTIVE' ? '停用' : '启用' }}</el-button>
            <el-button type="danger" @click="removeSchool(row)">删除</el-button>
          </div>
        </article>
        <p v-if="!loading && !filteredRows.length" class="mobile-empty">暂无符合条件的学校</p>
      </div>

      <footer v-if="pagination.total" class="directory-footer">
        <span>共 {{ pagination.total }} 所学校</span>
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="pagination.total"
          layout="sizes, prev, pager, next"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </footer>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑学校' : '新增学校'" width="560px">
      <el-form label-width="90px">
        <el-form-item label="学校名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="form.contactName" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.contactPhone" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveSchool">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

import {
  schoolStatusLabel,
  shortSchoolDate,
  useSchoolManagement
} from '@/features/school-management/index.js'
import { ElMessage } from '@/shared/ui/feedback.js'

const {
  changePage,
  changePageSize,
  contactName,
  dialogVisible,
  editingId,
  exportSchools,
  exporting,
  filteredRows,
  form,
  keyword,
  loadData,
  loading,
  openCreate,
  openEdit,
  pagination,
  removeSchool,
  resetSearch,
  saveSchool,
  saving,
  status,
  submitSearch,
  toggleStatus
} = useSchoolManagement({ feedback: ElMessage })

const shortDate = shortSchoolDate

onMounted(loadData)
</script>

<style scoped>
.filter-control { width: 210px; }
.filter-status { width: 130px; }
.mobile-directory { display: none; }
.directory-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-top: 1rem; color: var(--muted); font-size: 0.86rem; }

@media (max-width: 720px) {
  .toolbar, .filters, .toolbar-actions { width: 100%; }
  .filters { display: grid; grid-template-columns: 1fr 1fr; }
  .filter-control, .filter-status { width: auto; }
  .filter-status { grid-column: 1 / -1; }
  .toolbar-actions { display: grid; grid-template-columns: 1fr 1fr; }
  .toolbar-actions :deep(.el-button) { min-height: 44px; margin: 0; }
  .desktop-table { display: none; }
  .mobile-directory { display: grid; gap: 0.75rem; }
  .mobile-record { padding: 1rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); }
  .mobile-record header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
  .mobile-record header strong { min-width: 0; overflow-wrap: anywhere; color: var(--text); font-size: 1rem; }
  .record-status { flex: 0 0 auto; padding: 0.25rem 0.55rem; border-radius: 999px; background: var(--brand-faint); color: var(--brand-deep); font-size: 0.74rem; font-weight: 700; }
  .mobile-record dl { display: grid; gap: 0.55rem; margin: 1rem 0; }
  .mobile-record dl div { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: 0.75rem; }
  .mobile-record dt { color: var(--muted); font-size: 0.78rem; }
  .mobile-record dd { margin: 0; overflow-wrap: anywhere; color: var(--text); font-size: 0.86rem; text-align: right; }
  .mobile-actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; }
  .mobile-actions :deep(.el-button) { min-height: 44px; margin: 0; }
  .mobile-empty { margin: 0; padding: 2rem 1rem; color: var(--muted); text-align: center; }
  .directory-footer { align-items: stretch; flex-direction: column; }
  .directory-footer :deep(.el-pagination) { justify-content: space-between; }
  .directory-footer :deep(.el-pager) { display: none; }
}

@media (max-width: 420px) {
  .filters, .toolbar-actions, .mobile-actions { grid-template-columns: 1fr; }
  .filter-status { grid-column: auto; }
}
</style>
