<template>
  <div class="toolbar">
    <label class="filter-field filter-search">
      <span>搜索{{ modeLabel }}</span>
      <input v-model.trim="keyword" :placeholder="mode === 'students' ? '学生姓名/学号' : '姓名/手机号'" @keyup.enter="$emit('search')" />
    </label>
    <label class="filter-field">
      <span>账号状态</span>
      <select v-model="statusFilter">
        <option value="">全部状态</option>
        <option value="ENABLED">启用</option>
        <option value="DISABLED">停用</option>
      </select>
    </label>
    <label v-if="mode === 'teachers'" class="filter-field">
      <span>任教班级</span>
      <select v-model="classIdFilter" :disabled="classOptionsLoading">
        <option value="">全部班级</option>
        <option v-for="classItem in classOptions" :key="classItem.id" :value="classItem.id">
          {{ classOptionLabel(classItem) }}
        </option>
      </select>
    </label>
    <button class="btn btn-outline btn-sm" type="button" @click="$emit('search')">查询</button>
    <button v-if="mode === 'students'" class="btn btn-outline btn-sm" type="button" @click="$emit('open-import')">批量导入</button>
    <button v-if="mode === 'students'" class="btn btn-outline btn-sm" type="button" :disabled="exporting" @click="$emit('export')">
      {{ exporting ? '创建中...' : '导出学生' }}
    </button>
    <button class="btn btn-primary btn-sm" type="button" @click="$emit('create')">
      {{ mode === 'students' ? '+ 新增学生' : `+ 新增${modeLabel}` }}
    </button>
  </div>
</template>

<script setup>
import { classOptionLabel } from '../lib/rosterPresentation.js'

defineProps({
  classOptions: { type: Array, default: () => [] },
  classOptionsLoading: Boolean,
  exporting: Boolean,
  mode: { type: String, required: true },
  modeLabel: { type: String, default: '' }
})

defineEmits(['create', 'export', 'open-import', 'search'])

const classIdFilter = defineModel('classIdFilter', { type: [Number, String], default: '' })
const keyword = defineModel('keyword', { type: String, default: '' })
const statusFilter = defineModel('statusFilter', { type: String, default: '' })
</script>

<style scoped>
.toolbar { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:14px; }
.filter-field { display: flex; }
.filter-field > span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.filter-search { flex: 1; min-width: 240px; }
.filter-field input { width: 100%; }
.filter-field input, .filter-field select { min-height: 42px; padding:9px 12px; border:1.5px solid var(--border); border-radius:8px; background:white; font:inherit; }

@media (max-width: 700px) {
  .toolbar { display: grid; grid-template-columns: 1fr 1fr; }
  .filter-search { min-width: 0; grid-column: 1 / -1; }
  .filter-field select { width: 100%; }
  .toolbar .btn { min-height: 44px; }
  .toolbar .btn-primary { grid-column: 1 / -1; }
}

@media (max-width: 420px) {
  .toolbar { grid-template-columns: 1fr; }
  .filter-search, .toolbar .btn-primary { grid-column: auto; }
}
</style>
