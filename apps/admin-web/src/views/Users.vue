<template>
  <section>
    <h1 class="page-title">用户管理</h1>
    <div class="toolbar">
      <div class="filters">
        <el-input v-model="keyword" class="filter-keyword" aria-label="按手机号或姓名筛选" placeholder="手机号或姓名" clearable @keyup.enter="submitSearch" />
        <el-select v-model="role" class="filter-select" aria-label="按角色筛选" placeholder="角色" clearable>
          <el-option label="校方管理员" value="SCHOOL_ADMIN" />
          <el-option label="教师" value="TEACHER" />
          <el-option label="家长" value="PARENT" />
        </el-select>
        <el-select v-model="status" class="filter-select" aria-label="按状态筛选" placeholder="状态" clearable>
          <el-option label="启用" value="ACTIVE" />
          <el-option label="禁用" value="DISABLED" />
          <el-option label="已删除" value="DELETED" />
        </el-select>
        <el-button type="primary" :loading="loading" @click="submitSearch">查询</el-button>
        <el-button :disabled="loading" @click="resetSearch">重置</el-button>
      </div>
      <div class="filters">
        <el-button :loading="exporting" @click="exportUsers">导出</el-button>
        <el-button type="primary" @click="openCreate">新增用户</el-button>
      </div>
    </div>
    <div class="panel">
      <el-table v-loading="loading" class="desktop-table" :data="filteredRows" height="520" border>
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column prop="displayName" label="姓名" min-width="120" />
        <el-table-column prop="role" label="角色" width="130">
          <template #default="{ row }">{{ userRoleLabel(row.role) }}</template>
        </el-table-column>
        <el-table-column prop="schoolName" label="学校" min-width="180" />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">{{ userStatusLabel(row.status) }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180">
          <template #default="{ row }">{{ shortDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link @click="resetPassword(row)">重置密码</el-button>
            <el-button v-if="row.status === 'DISABLED'" link type="success" @click="setEnabled(row)">启用</el-button>
            <el-button v-else link type="warning" :disabled="row.status === 'DELETED'" @click="setDisabled(row)">禁用</el-button>
            <el-button link type="danger" :disabled="row.status === 'DELETED'" @click="removeUser(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-loading="loading" class="mobile-directory" aria-live="polite">
        <article v-for="row in filteredRows" :key="row.id" class="mobile-record">
          <header>
            <div>
              <strong>{{ row.displayName || '-' }}</strong>
              <span>{{ row.phone || '未填写手机号' }}</span>
            </div>
            <span class="record-status">{{ userStatusLabel(row.status) }}</span>
          </header>
          <dl>
            <div><dt>角色</dt><dd>{{ userRoleLabel(row.role) }}</dd></div>
            <div><dt>学校</dt><dd>{{ row.schoolName || '-' }}</dd></div>
            <div><dt>注册时间</dt><dd>{{ shortDate(row.createdAt) || '-' }}</dd></div>
          </dl>
          <div class="mobile-actions" aria-label="用户操作">
            <el-button @click="openEdit(row)">编辑</el-button>
            <el-button @click="resetPassword(row)">重置密码</el-button>
            <el-button v-if="row.status === 'DISABLED'" type="success" @click="setEnabled(row)">启用</el-button>
            <el-button v-else type="warning" :disabled="row.status === 'DELETED'" @click="setDisabled(row)">禁用</el-button>
            <el-button type="danger" :disabled="row.status === 'DELETED'" @click="removeUser(row)">删除</el-button>
          </div>
        </article>
        <p v-if="!loading && !filteredRows.length" class="mobile-empty">暂无符合条件的用户</p>
      </div>

      <footer v-if="pagination.total" class="directory-footer">
        <span>共 {{ pagination.total }} 位用户</span>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑用户' : '新增用户'" width="520px">
      <el-form label-width="90px">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" maxlength="50" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.realName" maxlength="50" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roleCode" style="width: 100%">
            <el-option label="校方管理员" value="SCHOOL_ADMIN" />
            <el-option label="教师" value="TEACHER" />
            <el-option label="家长" value="PARENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="学校">
          <el-select v-model="form.schoolId" clearable filterable style="width: 100%">
            <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.gender" clearable style="width: 100%">
            <el-option label="男" value="MALE" />
            <el-option label="女" value="FEMALE" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import {
  shortUserDate,
  userRoleLabel,
  userStatusLabel,
  useUserManagement
} from '@/features/user-management/index.js'
import { ElMessage, ElMessageBox } from '@/shared/ui/feedback.js'

const router = useRouter()
const {
  changePage,
  changePageSize,
  dialogVisible,
  editingId,
  exportUsers,
  exporting,
  filteredRows,
  form,
  keyword,
  loadData,
  loading,
  openCreate,
  openEdit,
  pagination,
  removeUser,
  resetPassword,
  resetSearch,
  role,
  saveUser,
  saving,
  schools,
  setDisabled,
  setEnabled,
  status,
  submitSearch
} = useUserManagement({
  dialogs: ElMessageBox,
  feedback: ElMessage,
  onUnauthorized: () => router.replace('/login')
})

const shortDate = shortUserDate

onMounted(loadData)
</script>

<style scoped>
.filter-keyword { width: 220px; }
.filter-select { width: 140px; }
.mobile-directory { display: none; }
.directory-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-top: 1rem; color: var(--muted); font-size: 0.86rem; }

@media (max-width: 720px) {
  .toolbar, .filters { width: 100%; }
  .filters { display: grid; grid-template-columns: 1fr 1fr; }
  .filter-keyword { width: auto; grid-column: 1 / -1; }
  .filter-select { width: auto; }
  .desktop-table { display: none; }
  .mobile-directory { display: grid; gap: 0.75rem; }
  .mobile-record { padding: 1rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); }
  .mobile-record header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
  .mobile-record header div { display: grid; gap: 0.25rem; min-width: 0; }
  .mobile-record header strong { color: var(--text); font-size: 1rem; }
  .mobile-record header span:not(.record-status) { color: var(--muted); font-size: 0.82rem; }
  .record-status { flex: 0 0 auto; padding: 0.25rem 0.55rem; border-radius: 999px; background: var(--brand-faint); color: var(--brand-deep); font-size: 0.74rem; font-weight: 700; }
  .mobile-record dl { display: grid; gap: 0.55rem; margin: 1rem 0; }
  .mobile-record dl div { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: 0.75rem; }
  .mobile-record dt { color: var(--muted); font-size: 0.78rem; }
  .mobile-record dd { margin: 0; overflow-wrap: anywhere; color: var(--text); font-size: 0.86rem; text-align: right; }
  .mobile-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; }
  .mobile-actions :deep(.el-button) { min-height: 44px; margin: 0; }
  .mobile-empty { margin: 0; padding: 2rem 1rem; color: var(--muted); text-align: center; }
  .directory-footer { align-items: stretch; flex-direction: column; }
  .directory-footer :deep(.el-pagination) { justify-content: space-between; }
  .directory-footer :deep(.el-pager) { display: none; }
}

@media (max-width: 420px) {
  .filters, .mobile-actions { grid-template-columns: 1fr; }
  .filter-keyword { grid-column: auto; }
}
</style>
