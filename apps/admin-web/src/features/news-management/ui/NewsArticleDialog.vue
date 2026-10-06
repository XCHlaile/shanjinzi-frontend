<template>
  <el-dialog
    v-model="dialogVisible"
    :title="editingId ? '编辑资讯' : '发布资讯'"
    width="760px"
  >
    <el-form label-width="100px">
      <el-form-item label="分类">
        <el-select v-model="form.categoryId" filterable style="width: 100%">
          <el-option
            v-for="item in categories"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标题">
        <el-input v-model="form.title" maxlength="120" />
      </el-form-item>
      <el-form-item label="摘要">
        <el-input v-model="form.summary" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="封面文件ID">
        <el-input-number
          v-model="form.coverFileId"
          :min="1"
          :controls="false"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="Markdown">
        <el-input v-model="form.contentMarkdown" type="textarea" :rows="8" />
      </el-form-item>
      <el-form-item label="HTML">
        <el-input v-model="form.contentHtml" type="textarea" :rows="4" />
      </el-form-item>
      <el-form-item label="发布时间">
        <el-date-picker
          v-model="form.publishAt"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          placeholder="选择发布时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="form.sortOrder" :min="0" :max="999999" />
        <el-checkbox v-model="form.isPinned" style="margin-left: 16px">置顶</el-checkbox>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="saveNews">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  editingId: { type: [Number, String], default: null },
  saveNews: { type: Function, required: true },
  saving: Boolean
})

const dialogVisible = defineModel('dialogVisible', { type: Boolean })
const form = defineModel('form', { type: Object, required: true })
</script>
