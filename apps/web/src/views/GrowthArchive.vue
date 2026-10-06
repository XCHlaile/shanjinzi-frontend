<template>
  <div class="plain-page">
    <section class="archive-hero">
      <div class="container">
        <p>学生成长档案</p>
        <h1>{{ archiveTitle }}</h1>
        <span>{{ archiveSubtitle }}</span>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="archive-layout">
          <aside class="archive-filter">
            <strong>分类查看</strong>
            <div v-if="role !== 'parent'" class="student-query">
              <label for="growth-student-select">学生</label>
              <el-select
                id="growth-student-select"
                v-model="selectedStudentId"
                filterable
                clearable
                :loading="studentOptionsLoading"
                :disabled="!studentOptionsLoading && !studentOptions.length"
                :placeholder="studentSelectPlaceholder"
                @change="loadRecords"
              >
                <el-option
                  v-for="student in studentOptions"
                  :key="student.id"
                  :label="student.label"
                  :value="student.id"
                />
              </el-select>
              <span v-if="studentOptionsError" class="student-query-error">{{ studentOptionsError }}</span>
            </div>
            <button v-for="type in filters" :key="type" :class="{ active: activeType === type }" @click="activeType = type">{{ type }}</button>
          </aside>

          <main v-if="loading" class="timeline">
            <div class="status-msg">加载中...</div>
          </main>
          <main v-else-if="error" class="timeline">
            <div class="status-msg error">{{ error }}</div>
          </main>
          <main v-else-if="role !== 'parent' && !selectedStudentId" class="timeline">
            <div class="status-msg">请选择学生查看成长档案</div>
          </main>
          <main v-else-if="!records.length" class="timeline">
            <div class="status-msg">暂无成长记录</div>
          </main>
          <main v-else class="timeline">
            <article v-for="record in records" :key="record.id" class="timeline-item">
              <time>{{ record.date }}</time>
              <div>
                <span>{{ record.type }}</span>
                <h2>{{ record.title }}</h2>
                <p>{{ record.summary }}</p>
                <em class="source-line">
                  来源：
                  <router-link v-if="record.sourceTo" :to="record.sourceTo">
                    {{ record.source }} · 查看详情
                  </router-link>
                  <strong v-else>{{ record.source }}</strong>
                </em>
              </div>
            </article>
          </main>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { normalizeRole } from '@/entities/user/index.js'
import { useGrowthArchiveDirectory } from '@/features/growth-archive/index.js'
import { getCurrentStudent } from '@/features/student-context/index.js'
import { getCurrentUser } from '@/features/authentication/index.js'

const user = getCurrentUser() || {}
const role = normalizeRole(user.role)
const route = useRoute()
const currentStudent = getCurrentStudent()

const {
  activeType,
  archiveSubtitle,
  archiveTitle,
  error,
  filters,
  initialize,
  loadRecords,
  loading,
  records,
  selectedStudentId,
  studentOptions,
  studentOptionsError,
  studentOptionsLoading,
  studentSelectPlaceholder
} = useGrowthArchiveDirectory({
  role,
  user,
  currentStudent,
  initialStudentId: route.query.studentId
})

onMounted(initialize)
</script>

<style scoped>
.plain-page { padding-top:64px; }
.archive-hero { background:#0f172a; color:white; padding:42px 0; }
.archive-hero p { color:#93c5fd; font-weight:700; }
.archive-hero h1 { font-size:2rem; margin:6px 0; }
.archive-hero span { color:#cbd5e1; }
.archive-layout { display:grid; grid-template-columns:240px 1fr; gap:18px; align-items:start; }
.archive-filter, .timeline-item { background:white; border:1px solid var(--border); border-radius:8px; }
.archive-filter { padding:16px; display:grid; gap:8px; }
.student-query { display:grid; gap:7px; margin:4px 0 10px; padding-bottom:12px; border-bottom:1px solid var(--border); }
.student-query label { color:var(--text-secondary); font-size:.78rem; }
.student-query :deep(.el-select) { width:100%; }
.student-query-error { color:#ef4444; font-size:.76rem; line-height:1.5; }
.archive-filter button { text-align:left; border:0; background:#f8fafc; border-radius:6px; padding:9px 10px; cursor:pointer; }
.archive-filter button.active { background:#eff6ff; color:#2563eb; font-weight:700; }
.archive-filter p { color:var(--text-secondary); font-size:0.82rem; line-height:1.6; margin-top:8px; }
.timeline { display:grid; gap:12px; }
.status-msg { background:white; border:1px solid var(--border); border-radius:8px; padding:22px; color:var(--text-secondary); text-align:center; }
.status-msg.error { color:#ef4444; }
.timeline-item { display:grid; grid-template-columns:120px 1fr; gap:16px; padding:18px; }
.timeline-item time { color:var(--text-secondary); font-weight:700; }
.timeline-item span { color:#0f766e; background:#d9f3ef; border-radius:99px; padding:4px 10px; font-size:0.8rem; }
.timeline-item h2 { font-size:1.1rem; margin:10px 0 6px; }
.timeline-item p { color:var(--text-secondary); line-height:1.7; }
.timeline-item em { display:block; margin-top:8px; color:var(--text-muted); font-style:normal; font-size:0.82rem; }
.source-line strong { font-weight:500; color:var(--text-secondary); }
.source-line a { color:var(--primary); font-weight:700; text-decoration:none; }
.source-line a:hover { text-decoration:underline; }
@media (max-width:800px) { .archive-layout, .timeline-item { grid-template-columns:1fr; } }
</style>
