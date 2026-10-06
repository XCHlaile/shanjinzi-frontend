<template>
  <el-dialog
    v-model="dialogVisible"
    :title="editingId ? '编辑赛事' : '新增赛事'"
    width="720px"
  >
    <el-form label-width="110px">
      <el-form-item label="赛事名称">
        <el-input v-model="form.title" maxlength="200" />
      </el-form-item>
      <el-form-item label="范围">
        <el-select
          v-model="form.scopeType"
          placeholder="请选择赛事范围"
          style="width: 100%"
          @change="handleScopeTypeChange"
        >
          <el-option label="平台赛事" value="PLATFORM" />
          <el-option label="学校赛事" value="SCHOOL" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.scopeType === 'SCHOOL'" label="学校" required>
        <el-select
          v-model="form.schoolId"
          :loading="scopeOptionsLoading"
          filterable
          placeholder="请选择学校"
          style="width: 100%"
        >
          <el-option
            v-for="school in schoolScopeOptions"
            :key="school.value"
            :label="school.label"
            :value="school.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="封面文件ID">
        <el-input v-model="form.coverFileId" placeholder="可选，文件上传后返回的 fileId" />
      </el-form-item>
      <el-form-item label="摘要">
        <el-input v-model="form.summary" type="textarea" :rows="2" maxlength="500" />
      </el-form-item>
      <el-form-item label="内容">
        <el-input v-model="form.content" type="textarea" :rows="6" />
      </el-form-item>
      <el-form-item label="信息链接">
        <el-input v-model="form.infoUrl" maxlength="2048" />
      </el-form-item>
      <el-form-item label="地点">
        <el-input v-model="form.location" />
      </el-form-item>
      <el-form-item label="赛事开始">
        <el-date-picker
          v-model="form.competitionStartAt"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          format="YYYY-MM-DD HH:mm"
          placeholder="选择赛事开始时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="赛事结束">
        <el-date-picker
          v-model="form.competitionEndAt"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          format="YYYY-MM-DD HH:mm"
          placeholder="选择赛事结束时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="报名开始">
        <el-date-picker
          v-model="form.registrationStartAt"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          format="YYYY-MM-DD HH:mm"
          placeholder="选择报名开始时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="报名截止">
        <el-date-picker
          v-model="form.registrationEndAt"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          format="YYYY-MM-DD HH:mm"
          placeholder="选择报名截止时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="人数上限">
        <el-input-number v-model="form.maxParticipants" :min="1" :max="999999" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="saveCompetition">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  editingId: { type: [Number, String], default: null },
  handleScopeTypeChange: { type: Function, required: true },
  saveCompetition: { type: Function, required: true },
  saving: Boolean,
  schoolScopeOptions: { type: Array, default: () => [] },
  scopeOptionsLoading: Boolean
})

const dialogVisible = defineModel('dialogVisible', { type: Boolean })
const form = defineModel('form', { type: Object, required: true })
</script>
