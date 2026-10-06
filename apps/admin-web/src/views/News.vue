<template>
  <section>
    <h1 class="page-title">资讯管理</h1>
    <div class="toolbar">
      <div class="filters">
        <el-input v-model="filters.keyword" placeholder="标题/摘要" clearable style="width: 240px" />
        <el-select v-model="filters.categoryId" placeholder="分类" clearable style="width: 170px">
          <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 140px">
          <el-option label="草稿" value="DRAFT" />
          <el-option label="已发布" value="PUBLISHED" />
          <el-option label="已下线" value="OFFLINE" />
          <el-option label="定时发布" value="SCHEDULED" />
        </el-select>
        <el-button :loading="loading" @click="loadData">查询</el-button>
      </div>
      <div class="filters">
        <el-button :loading="exporting" @click="exportNews">导出</el-button>
        <el-button @click="openCategoryManager">分类管理</el-button>
        <el-button type="primary" @click="openCreate">发布资讯</el-button>
      </div>
    </div>

    <div class="panel">
      <el-table v-loading="loading" :data="rows" height="520" border>
        <el-table-column prop="categoryName" label="分类" min-width="120" />
        <el-table-column prop="title" label="标题" min-width="240" />
        <el-table-column prop="createdByName" label="作者" width="120" />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">{{ newsStatusLabel(row.status) }}</template>
        </el-table-column>
        <el-table-column prop="publishAt" label="发布时间" width="170">
          <template #default="{ row }">{{ shortDate(row.publishAt) }}</template>
        </el-table-column>
        <el-table-column label="置顶" width="80">
          <template #default="{ row }">{{ row.isPinned ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="操作" width="390" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-if="row.status !== 'PUBLISHED'" link type="success" @click="publishNews(row)">发布</el-button>
            <el-button v-else link type="warning" @click="offlineNews(row)">下线</el-button>
            <el-button link @click="togglePin(row)">{{ row.isPinned ? '取消置顶' : '置顶' }}</el-button>
            <el-button link @click="openCategoryChange(row)">改分类</el-button>
            <el-button link @click="openSort(row)">排序</el-button>
            <el-button link @click="openSchedule(row)">定时</el-button>
            <el-button link type="danger" @click="removeNews(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <NewsArticleDialog
      v-model:dialog-visible="dialogVisible"
      v-model:form="form"
      :categories="categories"
      :editing-id="editingId"
      :save-news="saveNews"
      :saving="saving"
    />

    <NewsMaintenanceDialogs
      v-model:category-manager-visible="categoryManagerVisible"
      v-model:category-change-visible="categoryChangeVisible"
      v-model:sort-visible="sortVisible"
      v-model:schedule-visible="scheduleVisible"
      v-model:category-form="categoryForm"
      v-model:article-action-form="articleActionForm"
      :action-saving="actionSaving"
      :categories="categories"
      :category-editing-id="categoryEditingId"
      :category-saving="categorySaving"
      :delete-category="deleteCategory"
      :edit-category="editCategory"
      :reset-category-form="resetCategoryForm"
      :save-article-category="saveArticleCategory"
      :save-category="saveCategory"
      :save-schedule="saveSchedule"
      :save-sort-order="saveSortOrder"
    />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import {
  NewsArticleDialog,
  NewsMaintenanceDialogs,
  newsStatusLabel,
  shortNewsDate,
  useNewsManagement
} from '@/features/news-management/index.js'
import { ElMessage, ElMessageBox } from '@/shared/ui/feedback.js'

const router = useRouter()
const {
  actionSaving,
  articleActionForm,
  categories,
  categoryChangeVisible,
  categoryEditingId,
  categoryForm,
  categoryManagerVisible,
  categorySaving,
  deleteCategory,
  dialogVisible,
  editCategory,
  editingId,
  exportNews,
  exporting,
  filters,
  form,
  loadData,
  loading,
  offlineNews,
  openCategoryChange,
  openCategoryManager,
  openCreate,
  openEdit,
  openSchedule,
  openSort,
  publishNews,
  removeNews,
  resetCategoryForm,
  rows,
  saveArticleCategory,
  saveCategory,
  saveNews,
  saveSchedule,
  saveSortOrder,
  saving,
  scheduleVisible,
  sortVisible,
  togglePin
} = useNewsManagement({
  dialogs: ElMessageBox,
  feedback: ElMessage,
  onUnauthorized: () => router.replace('/login')
})

const shortDate = shortNewsDate

onMounted(loadData)
</script>
