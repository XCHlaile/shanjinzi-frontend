<template>
  <el-dialog v-model="detailVisible" title="举报详情" width="760px">
    <el-skeleton v-if="detailLoading" :rows="8" animated />
    <el-descriptions v-else-if="reportDetail" :column="2" border>
      <el-descriptions-item label="学校">{{ reportSchoolName(reportDetail) }}</el-descriptions-item>
      <el-descriptions-item label="内容类型">
        {{ targetTypeLabel(reportDetail.targetType) }}
      </el-descriptions-item>
      <el-descriptions-item label="举报人">
        {{ reportDetail.reporterName || reportDetail.reporterUserId || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="内容作者">
        {{ reportDetail.targetAuthorName || reportDetail.targetAuthorUserId || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="内容摘要" :span="2">
        <span class="long-text">{{ reportDetail.targetSummary || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="举报原因" :span="2">
        <span class="long-text">{{ reportDetail.reason || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="状态">{{ statusLabel(reportDetail.status) }}</el-descriptions-item>
      <el-descriptions-item label="举报时间">{{ shortDate(reportDetail.createdAt) }}</el-descriptions-item>
      <el-descriptions-item label="处理人">
        {{ reportDetail.handlerName || reportDetail.handledByUserId || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="处理时间">{{ shortDate(reportDetail.handledAt) }}</el-descriptions-item>
      <el-descriptions-item label="处理动作">{{ actionLabel(reportDetail.handledAction) }}</el-descriptions-item>
      <el-descriptions-item label="处理备注">{{ reportDetail.handledNote || '-' }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="detailVisible = false">关闭</el-button>
      <el-button
        v-if="reportDetail && !isHandled(reportDetail)"
        type="primary"
        @click="openHandle(reportDetail)"
      >
        处理举报
      </el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="handleVisible" title="处理举报" width="560px">
    <el-form label-width="90px">
      <el-form-item label="处理动作" required>
        <el-select
          v-model="handleForm.action"
          filterable
          allow-create
          default-first-option
          placeholder="请选择处理动作"
          style="width: 100%"
        >
          <el-option label="忽略举报" value="IGNORE" />
          <el-option label="隐藏内容" value="HIDE" />
          <el-option label="删除内容" value="DELETE" />
        </el-select>
      </el-form-item>
      <el-form-item label="处理备注">
        <el-input
          v-model="handleForm.note"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleVisible = false">取消</el-button>
      <el-button type="primary" :loading="handling" @click="submitHandle">确认处理</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {
  contentReportActionLabel as actionLabel,
  contentReportStatusLabel as statusLabel,
  contentReportTargetTypeLabel as targetTypeLabel,
  isContentReportHandled as isHandled,
  shortContentReportDate as shortDate
} from '../lib/contentReportViewModel.js'

defineProps({
  detailLoading: Boolean,
  handling: Boolean,
  openHandle: { type: Function, required: true },
  reportDetail: { type: Object, default: null },
  reportSchoolName: { type: Function, required: true },
  submitHandle: { type: Function, required: true }
})

const detailVisible = defineModel('detailVisible', { type: Boolean })
const handleVisible = defineModel('handleVisible', { type: Boolean })
const handleForm = defineModel('handleForm', { type: Object, required: true })
</script>

<style scoped>
.long-text {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
