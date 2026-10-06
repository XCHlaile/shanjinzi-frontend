<template>
  <el-dialog v-model="categoryManagerVisible" title="分类管理" width="680px">
    <div class="category-manager">
      <el-form label-width="90px">
        <el-form-item label="名称">
          <el-input v-model="categoryForm.name" maxlength="80" show-word-limit />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sortOrder" :min="0" :max="999999" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="categorySaving" @click="saveCategory">
            {{ categoryEditingId ? '保存分类' : '新增分类' }}
          </el-button>
          <el-button @click="resetCategoryForm">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="categories" height="260" border>
        <el-table-column prop="code" label="编码" width="130" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="sortOrder" label="排序" width="90" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="操作" width="130">
          <template #default="{ row }">
            <el-button link type="primary" @click="editCategory(row)">编辑</el-button>
            <el-button link type="danger" @click="deleteCategory(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>

  <el-dialog v-model="categoryChangeVisible" title="修改资讯分类" width="420px">
    <el-form label-width="80px">
      <el-form-item label="分类">
        <el-select v-model="articleActionForm.categoryId" filterable style="width: 100%">
          <el-option
            v-for="item in categories"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="categoryChangeVisible = false">取消</el-button>
      <el-button type="primary" :loading="actionSaving" @click="saveArticleCategory">
        保存
      </el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="sortVisible" title="修改排序" width="360px">
    <el-form label-width="80px">
      <el-form-item label="排序">
        <el-input-number v-model="articleActionForm.sortOrder" :min="0" :max="999999" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="sortVisible = false">取消</el-button>
      <el-button type="primary" :loading="actionSaving" @click="saveSortOrder">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="scheduleVisible" title="定时发布" width="420px">
    <el-form label-width="90px">
      <el-form-item label="发布时间">
        <el-date-picker
          v-model="articleActionForm.publishAt"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="scheduleVisible = false">取消</el-button>
      <el-button type="primary" :loading="actionSaving" @click="saveSchedule">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  actionSaving: Boolean,
  categories: { type: Array, default: () => [] },
  categoryEditingId: { type: [Number, String], default: null },
  categorySaving: Boolean,
  deleteCategory: { type: Function, required: true },
  editCategory: { type: Function, required: true },
  resetCategoryForm: { type: Function, required: true },
  saveArticleCategory: { type: Function, required: true },
  saveCategory: { type: Function, required: true },
  saveSchedule: { type: Function, required: true },
  saveSortOrder: { type: Function, required: true }
})

const categoryManagerVisible = defineModel('categoryManagerVisible', { type: Boolean })
const categoryChangeVisible = defineModel('categoryChangeVisible', { type: Boolean })
const sortVisible = defineModel('sortVisible', { type: Boolean })
const scheduleVisible = defineModel('scheduleVisible', { type: Boolean })
const categoryForm = defineModel('categoryForm', { type: Object, required: true })
const articleActionForm = defineModel('articleActionForm', {
  type: Object,
  required: true
})
</script>

<style scoped>
.category-manager {
  display: grid;
  gap: 14px;
}
</style>
