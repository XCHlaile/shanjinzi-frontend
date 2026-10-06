<template>
  <el-dialog v-model="createVisible" title="新建消息群发" width="640px">
    <el-form label-width="100px">
      <el-form-item label="群发范围" required>
        <el-select v-model="form.scope" style="width: 100%">
          <el-option label="全平台" value="PLATFORM" />
          <el-option label="指定学校" value="SCHOOL" />
          <el-option label="指定用户" value="USER" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="form.scope === 'SCHOOL'" label="学校" required>
        <el-select
          v-model="form.schoolId"
          filterable
          :loading="optionsLoading"
          style="width: 100%"
        >
          <el-option
            v-for="item in schools"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="form.scope === 'USER'" label="接收用户" required>
        <el-select
          v-model="form.recipientUserIds"
          multiple
          filterable
          :loading="optionsLoading"
          style="width: 100%"
        >
          <el-option
            v-for="item in users"
            :key="item.id"
            :label="userLabel(item)"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="消息内容" required>
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="6"
          maxlength="3000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="附件文件ID">
        <el-select
          v-model="form.attachmentFileIds"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="输入文件ID后回车"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="createVisible = false">取消</el-button>
      <el-button type="primary" :loading="creating" @click="createBroadcast">
        创建群发
      </el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="detailVisible" title="群发任务详情" width="680px">
    <div v-loading="detailLoading">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="任务ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusLabel(detail.status) }}</el-descriptions-item>
        <el-descriptions-item label="范围">{{ scopeLabel(detail.scope) }}</el-descriptions-item>
        <el-descriptions-item label="学校ID">{{ detail.schoolId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建人ID">{{ detail.creatorId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ shortDate(detail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="总数">{{ detail.totalCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="成功/失败">
          {{ detail.successCount || 0 }} / {{ detail.failureCount || 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="附件ID" :span="2">
          {{ joinIds(detail.attachmentFileIds) }}
        </el-descriptions-item>
        <el-descriptions-item label="消息内容" :span="2">
          {{ detail.content || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-table
        v-if="recipientStatusRows.length"
        :data="recipientStatusRows"
        border
        style="margin-top: 16px"
      >
        <el-table-column prop="status" label="接收状态">
          <template #default="{ row }">{{ recipientStatusLabel(row.status) }}</template>
        </el-table-column>
        <el-table-column prop="count" label="数量" />
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup>
import {
  joinedMessageIds as joinIds,
  messageBroadcastScopeLabel as scopeLabel,
  messageBroadcastStatusLabel as statusLabel,
  messageBroadcastUserLabel as userLabel,
  messageRecipientStatusLabel as recipientStatusLabel,
  shortMessageBroadcastDate as shortDate
} from '../lib/messageBroadcastViewModel.js'

defineProps({
  createBroadcast: { type: Function, required: true },
  creating: Boolean,
  detail: { type: Object, default: null },
  detailLoading: Boolean,
  optionsLoading: Boolean,
  recipientStatusRows: { type: Array, default: () => [] },
  schools: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] }
})

const createVisible = defineModel('createVisible', { type: Boolean })
const detailVisible = defineModel('detailVisible', { type: Boolean })
const form = defineModel('form', { type: Object, required: true })
</script>
