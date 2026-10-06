<template>
  <section class="dashboard-page">
    <div class="page-heading">
      <div>
        <h1 class="page-title">数据看板</h1>
        <p class="page-description">快速了解平台规模、近期趋势与需要关注的关键操作。</p>
      </div>
      <span class="data-scope">全平台实时视角</span>
    </div>

    <AdminStatePanel :error="loadError" @retry="loadDashboard" />

    <section class="metric-grid" aria-label="平台核心指标">
      <article v-for="metric in metrics" :key="metric.label" class="metric">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="panel trend-panel">
        <div class="panel-heading">
          <div>
            <h2>近 7 天趋势</h2>
            <p>对比每天的新增用户与活跃用户。</p>
          </div>
        </div>
        <template v-if="trends.length">
          <div v-for="item in trends" :key="item.day || item.date || item.id" class="trend-row">
            <span class="trend-date">{{ item.day || item.date || '-' }}</span>
            <div class="trend-track"><i :style="{ width: trendWidth(item) }"></i></div>
            <span class="trend-value">新增 {{ item.users ?? item.newUsers ?? 0 }} · 活跃 {{ item.active ?? item.activeUsers ?? 0 }}</span>
          </div>
        </template>
        <el-empty v-else description="暂无后端数据" />
      </article>

      <article class="panel ranking-panel">
        <div class="panel-heading">
          <div>
            <h2>合作学校排行</h2>
            <p>按用户与平台参与数据查看园所表现。</p>
          </div>
        </div>
        <div v-if="rankings.length" class="table-scroll">
          <table class="mini-table">
            <thead>
              <tr><th>学校</th><th>用户</th><th>报名</th><th>动态</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in rankings" :key="item.school || item.schoolName || item.id">
                <td>{{ item.school || item.schoolName || '-' }}</td>
                <td>{{ item.users ?? item.userCount ?? 0 }}</td>
                <td>{{ item.registrations ?? item.registrationCount ?? 0 }}</td>
                <td>{{ item.activities ?? item.momentCount ?? 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <el-empty v-else description="暂无后端数据" />
      </article>

      <article class="panel operations-panel">
        <div class="panel-heading">
          <div>
            <h2>最近关键操作</h2>
            <p>集中查看高风险与重要后台行为。</p>
          </div>
        </div>
        <div v-if="operations.length" class="table-scroll">
          <table class="mini-table operations-table">
            <thead>
              <tr><th>时间</th><th>模块</th><th>动作</th><th>对象</th><th>风险等级</th></tr>
            </thead>
            <tbody>
              <tr v-for="log in operations" :key="log.id || log.createdAt || log.time">
                <td>{{ log.time || log.createdAt || '-' }}</td>
                <td>{{ log.module || '-' }}</td>
                <td>{{ log.action || '-' }}</td>
                <td>{{ log.target || log.targetType || '-' }}</td>
                <td>
                  <el-tag :type="isHighRisk(log) ? 'danger' : 'info'">
                    {{ log.risk || log.riskLevel || '-' }}
                  </el-tag>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <el-empty v-else description="暂无后端数据" />
      </article>
    </section>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import AdminStatePanel from '@/components/AdminStatePanel.vue'

import {
  isHighRisk,
  trendWidth,
  useAdminDashboard
} from '@/features/admin-dashboard/index.js'

const {
  loadDashboard,
  loadError,
  metrics,
  operations,
  rankings,
  trends
} = useAdminDashboard()

onMounted(loadDashboard)
</script>

<style scoped>
.data-scope { padding: 0.45rem 0.7rem; border-radius: 8px; background: var(--brand-soft); color: var(--brand-deep); font-size: 0.75rem; font-weight: 680; }
.dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(22rem, 0.8fr); gap: 1rem; margin-top: 1rem; }
.operations-panel { grid-column: 1 / -1; }
.panel-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
.panel-heading h2 { margin: 0 0 0.25rem; color: var(--text); font-size: 1rem; font-weight: 720; }
.panel-heading p { margin: 0; color: var(--muted); font-size: 0.78rem; line-height: 1.6; }
.trend-row { display: grid; grid-template-columns: 5rem minmax(7rem, 1fr) minmax(11rem, auto); align-items: center; gap: 0.8rem; padding: 0.7rem 0; border-bottom: 1px solid var(--line); }
.trend-row:last-child { border-bottom: 0; }
.trend-date { color: #3f5b70; font-size: 0.78rem; font-weight: 650; }
.trend-track { height: 8px; overflow: hidden; border-radius: 8px; background: #e1ebf0; }
.trend-track i { display: block; height: 100%; border-radius: inherit; background: var(--brand); }
.trend-value { color: var(--muted); font-size: 0.76rem; text-align: right; }
.table-scroll { overflow-x: auto; }
.mini-table { width: 100%; min-width: 33rem; border-collapse: collapse; font-size: 0.82rem; }
.operations-table { min-width: 46rem; }
.mini-table th { padding: 0.7rem 0.65rem; border-bottom: 1px solid var(--line); background: var(--panel-muted); color: var(--muted); font-size: 0.7rem; font-weight: 720; text-align: left; }
.mini-table td { padding: 0.75rem 0.65rem; border-bottom: 1px solid var(--line); color: #365269; }
.mini-table tbody tr:last-child td { border-bottom: 0; }
.mini-table tbody tr:hover td { background: #f4f9fb; }

@media (max-width: 1100px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .operations-panel { grid-column: auto; }
}

@media (max-width: 680px) {
  .data-scope { display: none; }
  .trend-row { grid-template-columns: 4.5rem minmax(0, 1fr); }
  .trend-value { grid-column: 1 / -1; text-align: left; }
}
</style>
