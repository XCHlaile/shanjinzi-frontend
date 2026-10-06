<template>
  <el-dialog
    v-model="guardiansDialogVisible"
    :title="`${activeStudent?.name || ''}的家长`"
    width="820px"
  >
    <el-table v-loading="guardiansLoading" :data="guardians" border empty-text="暂无绑定家长">
      <el-table-column prop="guardianName" label="家长姓名" min-width="120" />
      <el-table-column prop="guardianPhone" label="手机号" width="150" />
      <el-table-column label="关系" width="100">
        <template #default="{ row }">{{ relationLabel(row.relationType) }}</template>
      </el-table-column>
      <el-table-column prop="bindSource" label="绑定来源" width="120" />
      <el-table-column prop="bindStatus" label="绑定状态" width="110" />
      <el-table-column label="主要联系人" width="100">
        <template #default="{ row }">{{ row.isPrimary ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="danger" @click="unbindGuardian(row)">解绑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>

  <el-dialog
    v-model="bindGuardianDialogVisible"
    :title="`为${activeStudent?.name || ''}绑定家长`"
    width="620px"
  >
    <el-alert
      title="接口采用覆盖式设置，提交后所选家长将只绑定当前学生。"
      type="warning"
      show-icon
      :closable="false"
      class="bind-warning"
    />
    <el-form label-width="90px">
      <el-form-item label="家长" required>
        <el-select
          :model-value="bindGuardianForm.parentId"
          filterable
          remote
          clearable
          :remote-method="searchParentOptions"
          :loading="parentOptionsLoading"
          placeholder="按家长姓名或手机号搜索"
          style="width: 100%"
          @update:model-value="value => updateGuardianBinding('parentId', value)"
        >
          <el-option
            v-for="parent in parentOptions"
            :key="parent.id"
            :label="parentOptionLabel(parent)"
            :value="parent.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="与学生关系">
        <el-select
          :model-value="bindGuardianForm.relationType"
          clearable
          placeholder="可选"
          style="width: 100%"
          @update:model-value="value => updateGuardianBinding('relationType', value)"
        >
          <el-option
            v-for="(label, value) in relationLabels"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="bindGuardianDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="bindingGuardian" @click="submitGuardianBinding">
        确认绑定
      </el-button>
    </template>
  </el-dialog>

  <el-dialog
    v-model="profileDialogVisible"
    :title="`${activeStudent?.name || ''}的成长档案`"
    width="860px"
  >
    <el-table v-loading="profileLoading" :data="profileEvents" border empty-text="暂无成长记录">
      <el-table-column prop="eventType" label="事件类型" width="130" />
      <el-table-column prop="sourceType" label="来源" width="120" />
      <el-table-column prop="title" label="标题" min-width="180" />
      <el-table-column prop="summary" label="摘要" min-width="260" show-overflow-tooltip />
      <el-table-column label="发生时间" width="180">
        <template #default="{ row }">{{ shortDate(row.occurredAt) }}</template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup>
defineProps({
  activeStudent: { type: Object, default: null },
  bindGuardianForm: { type: Object, required: true },
  bindingGuardian: Boolean,
  guardians: { type: Array, default: () => [] },
  guardiansLoading: Boolean,
  parentOptionLabel: { type: Function, required: true },
  parentOptions: { type: Array, default: () => [] },
  parentOptionsLoading: Boolean,
  profileEvents: { type: Array, default: () => [] },
  profileLoading: Boolean,
  relationLabel: { type: Function, required: true },
  relationLabels: { type: Object, required: true },
  searchParentOptions: { type: Function, required: true },
  shortDate: { type: Function, required: true },
  submitGuardianBinding: { type: Function, required: true },
  unbindGuardian: { type: Function, required: true },
  updateGuardianBinding: { type: Function, required: true }
})

const guardiansDialogVisible = defineModel('guardiansDialogVisible', { type: Boolean })
const bindGuardianDialogVisible = defineModel('bindGuardianDialogVisible', { type: Boolean })
const profileDialogVisible = defineModel('profileDialogVisible', { type: Boolean })
</script>

<style scoped>
.bind-warning {
  margin-bottom: 16px;
}
</style>
