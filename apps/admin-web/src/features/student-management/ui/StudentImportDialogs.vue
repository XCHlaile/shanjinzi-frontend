<template>
  <el-dialog v-model="importDialogVisible" title="导入学生名单" width="620px">
    <el-form label-width="110px">
      <el-form-item label="学校">
        <el-select
          :model-value="importOptions.schoolId"
          clearable
          filterable
          placeholder="不选则按当前账号权限确定"
          style="width: 100%"
          @update:model-value="value => updateImportOption('schoolId', value)"
        >
          <el-option
            v-for="school in schools"
            :key="school.id"
            :label="school.name"
            :value="school.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="自动创建班级">
        <el-switch
          :model-value="importOptions.autoCreateClass"
          @update:model-value="value => updateImportOption('autoCreateClass', value)"
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          :model-value="importOptions.remark"
          type="textarea"
          :rows="3"
          @update:model-value="value => updateImportOption('remark', value)"
        />
      </el-form-item>
      <el-form-item label="名单文件" required>
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :limit="1"
          accept=".xlsx,.xls,.csv"
          :on-change="selectImportFile"
          :on-remove="removeImportFile"
        >
          <el-button type="primary" plain>选择文件</el-button>
          <template #tip>
            <div class="upload-tip">请先下载最新模板，填写后选择文件。</div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="importDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="importing" @click="submitStudentImport">
        开始导入
      </el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="batchesDialogVisible" title="学生导入批次" width="920px">
    <div class="batch-toolbar">
      <span>导入任务可能异步执行，请刷新查看最新处理结果。</span>
      <el-button :loading="batchesLoading" @click="loadImportBatches">刷新批次</el-button>
    </div>
    <el-table v-loading="batchesLoading" :data="importBatches" border empty-text="暂无导入批次">
      <el-table-column prop="id" label="批次 ID" width="90" />
      <el-table-column prop="schoolName" label="学校" min-width="180" />
      <el-table-column prop="status" label="状态" width="110" />
      <el-table-column prop="successCount" label="成功" width="80" />
      <el-table-column prop="failureCount" label="失败" width="80" />
      <el-table-column label="开始时间" width="180">
        <template #default="{ row }">{{ shortDate(row.startedAt || row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="完成时间" width="180">
        <template #default="{ row }">{{ shortDate(row.completedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="90" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openImportBatchDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-row">
      <span>共 {{ batchPagination.total }} 条</span>
      <el-pagination
        :current-page="batchPagination.page"
        :page-size="batchPagination.pageSize"
        layout="prev, pager, next"
        :total="batchPagination.total"
        @current-change="changeImportBatchPage"
      />
    </div>
  </el-dialog>

  <el-dialog v-model="batchDetailDialogVisible" title="导入批次详情" width="680px">
    <el-descriptions v-if="importBatchDetail" :column="2" border>
      <el-descriptions-item label="批次 ID">{{ importBatchDetail.id }}</el-descriptions-item>
      <el-descriptions-item label="学校">{{ importBatchDetail.schoolName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{ importBatchDetail.status || '-' }}</el-descriptions-item>
      <el-descriptions-item label="自动建班">
        {{ importBatchDetail.autoCreateClass ? '是' : '否' }}
      </el-descriptions-item>
      <el-descriptions-item label="成功数量">{{ importBatchDetail.successCount ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="失败数量">{{ importBatchDetail.failureCount ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="导入文件 ID">{{ importBatchDetail.importFileId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="错误报告 ID">
        {{ importBatchDetail.errorReportFileId || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{ importBatchDetail.remark || '-' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ shortDate(importBatchDetail.createdAt) }}</el-descriptions-item>
      <el-descriptions-item label="开始时间">{{ shortDate(importBatchDetail.startedAt) }}</el-descriptions-item>
      <el-descriptions-item label="完成时间" :span="2">
        {{ shortDate(importBatchDetail.completedAt) }}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  batchPagination: { type: Object, required: true },
  batchesLoading: Boolean,
  changeImportBatchPage: { type: Function, required: true },
  importBatchDetail: { type: Object, default: null },
  importBatches: { type: Array, default: () => [] },
  importing: Boolean,
  importOptions: { type: Object, required: true },
  loadImportBatches: { type: Function, required: true },
  openImportBatchDetail: { type: Function, required: true },
  removeImportFile: { type: Function, required: true },
  schools: { type: Array, default: () => [] },
  selectImportFile: { type: Function, required: true },
  shortDate: { type: Function, required: true },
  submitStudentImport: { type: Function, required: true },
  updateImportOption: { type: Function, required: true }
})

const importDialogVisible = defineModel('importDialogVisible', { type: Boolean })
const batchesDialogVisible = defineModel('batchesDialogVisible', { type: Boolean })
const batchDetailDialogVisible = defineModel('batchDetailDialogVisible', { type: Boolean })
const uploadRef = ref(null)

defineExpose({
  clearFiles() {
    uploadRef.value?.clearFiles()
  }
})
</script>

<style scoped>
.upload-tip {
  color: var(--muted);
}

.batch-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
  color: var(--muted);
  font-size: 14px;
}

.pagination-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 16px;
  color: var(--muted);
}

@media (max-width: 1100px) {
  .batch-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
