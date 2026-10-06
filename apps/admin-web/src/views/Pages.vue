<template>
  <section>
    <h1 class="page-title">页面管理</h1>
    <div class="toolbar">
      <div class="filters">
        <el-input v-model="keyword" placeholder="路由/标题" clearable style="width: 240px" />
        <el-select v-model="status" placeholder="状态" clearable style="width: 130px">
          <el-option label="草稿" value="DRAFT" />
          <el-option label="已发布" value="PUBLISHED" />
        </el-select>
      </div>
      <div class="filters">
        <el-button :loading="exporting" @click="exportPages">导出</el-button>
        <el-button type="primary" @click="openCreate">新建页面</el-button>
      </div>
    </div>
    <div class="panel">
      <el-table v-loading="loading" :data="filteredRows" height="520" border>
        <el-table-column prop="route" label="路由" width="180" />
        <el-table-column prop="title" label="标题" min-width="240" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">{{ shortDate(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑 Markdown</el-button>
            <el-button link type="success" @click="publishPage(row)">发布</el-button>
            <el-button link type="danger" @click="removePage(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑页面' : '新建页面'" width="720px">
      <el-form label-width="80px">
        <el-form-item label="路由">
          <el-input v-model="form.route" placeholder="例如 about-ai" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已发布" value="PUBLISHED" />
          </el-select>
        </el-form-item>
        <el-form-item label="Markdown">
          <el-input v-model="form.markdown" type="textarea" :rows="12" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="savePage">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

import {
  shortAdminPageDate,
  usePageManagement
} from '@/features/page-management/index.js'
import { ElMessage, ElMessageBox } from '@/shared/ui/feedback.js'

const {
  dialogVisible,
  editingId,
  exportPages,
  exporting,
  filteredRows,
  form,
  keyword,
  loadData,
  loading,
  openCreate,
  openEdit,
  publishPage,
  removePage,
  savePage,
  saving,
  status
} = usePageManagement({
  confirmation: ElMessageBox,
  feedback: ElMessage
})

const shortDate = shortAdminPageDate

onMounted(loadData)
</script>
