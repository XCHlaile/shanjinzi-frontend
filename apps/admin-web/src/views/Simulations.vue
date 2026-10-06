<template>
  <div>
    <h1 class="page-title">模拟学校视角</h1>
    <el-alert
      title="后端接口还没写：2openap.json 未定义管理端模拟视角接口。"
      type="warning"
      show-icon
      :closable="false"
      style="margin-bottom: 14px"
    />
    <div class="warning-panel">
      <strong>高危操作</strong>
      <p>进入和退出模拟视角必须由后端记录操作者、目标学校、目标账号、操作时间、IP、User-Agent 和结果。</p>
    </div>
    <div class="panel">
      <el-table :data="rows" border>
        <el-table-column prop="name" label="学校" />
        <el-table-column prop="contact" label="目标管理员" />
        <el-table-column prop="users" label="用户规模" />
        <el-table-column prop="registrations" label="报名数" />
        <el-table-column label="操作" width="180">
          <template #default>
            <el-button type="warning" disabled>进入模拟视角</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const rows = ref([])
</script>

<style scoped>
.warning-panel { background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; padding:14px; margin-bottom:14px; color:#9a3412; }
.warning-panel p { margin:6px 0 0; line-height:1.6; }
</style>
