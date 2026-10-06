<template>
  <div class="module-page">
    <section class="module-hero">
      <div class="container">
        <h1>📋 我的报名</h1>
        <p>查看已报名的赛事详细信息</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div v-if="loading" class="status-msg">加载中...</div>
        <div v-else-if="error" class="status-msg error">{{ error }}</div>

        <div v-else-if="!myList.length" class="status-msg empty">
          <p>您还没有报名任何赛事</p>
          <router-link to="/competitions" class="btn btn-primary">去浏览赛事</router-link>
        </div>

        <div v-for="item in myList" :key="item.registrationId" class="reg-card">
          <div class="reg-head">
            <div class="reg-badge" :style="{ background: statusColor(item.status) }">{{ statusLabel(item.status) }}</div>
            <span class="reg-status reg-ok">{{ item.registrationId }}</span>
          </div>
          <div class="reg-body">
            <div class="reg-section">
              <h4 class="reg-section-title">🏅 赛事信息</h4>
              <div class="reg-row"><span class="rk">赛事名称</span><span class="rv">{{ item.competitionTitle }}</span></div>
              <div class="reg-row"><span class="rk">比赛时间</span><span class="rv">{{ formatTime(item.competitionStartAt) }}</span></div>
              <div class="reg-row"><span class="rk">报名截止</span><span class="rv">{{ formatTime(item.registrationEndAt) }}</span></div>
              <div class="reg-row"><span class="rk">赛事编号</span><span class="rv">{{ item.competitionId }}</span></div>
            </div>
            <div class="reg-section">
              <h4 class="reg-section-title">👤 报名信息</h4>
              <div class="reg-row"><span class="rk">学生姓名</span><span class="rv">{{ item.studentName }}</span></div>
              <div class="reg-row"><span class="rk">班级</span><span class="rv">{{ item.className }}</span></div>
              <div class="reg-row"><span class="rk">学生编号</span><span class="rv">{{ item.studentId }}</span></div>
              <div class="reg-row"><span class="rk">报名状态</span><span class="rv">{{ statusLabel(item.status) }}</span></div>
              <div class="reg-row"><span class="rk">报名时间</span><span class="rv">{{ formatTime(item.createdAt) }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import {
  competitionRegistrationStatusColor as statusColor,
  competitionRegistrationStatusLabel as statusLabel,
  formatCompetitionDateTime as formatTime,
  useMyRegistrations
} from '@/features/competition/index.js'

const {
  error,
  loading,
  loadRegistrations,
  myList
} = useMyRegistrations()

onMounted(loadRegistrations)
</script>

<style scoped>
.module-hero { background:linear-gradient(135deg,#0f172a,#1e293b); color:white; padding:100px 0 40px; }
.module-hero h1 { font-size:1.8rem; margin-bottom:8px; }
.module-hero p { color:#94a3b8; }
.status-msg { text-align:center; padding:40px 0; color:var(--text-secondary); font-size:1rem; }
.status-msg.error { color:#ef4444; }
.status-msg.empty p { margin-bottom:16px; }

.reg-card { background:white; border:1px solid var(--border); border-radius:var(--radius-lg); margin-bottom:16px; overflow:hidden; transition:box-shadow .2s; }
.reg-card:hover { box-shadow:var(--shadow-md); }
.reg-head { display:flex; align-items:center; gap:10px; padding:14px 20px; background:#f8fafc; border-bottom:1px solid var(--border); }
.reg-badge { padding:3px 10px; border-radius:6px; color:white; font-size:0.76rem; font-weight:600; }
.reg-status { font-size:0.85rem; font-weight:600; color:#16a34a; }
.reg-body { padding:16px 20px; display:flex; gap:24px; flex-wrap:wrap; }
.reg-section { flex:1; min-width:240px; }
.reg-section-title { font-size:0.9rem; color:var(--text); margin:0 0 10px; padding-bottom:6px; border-bottom:1px solid var(--border); }
.reg-row { display:flex; padding:5px 0; font-size:0.88rem; }
.rk { flex:0 0 100px; color:var(--text-secondary); }
.rv { flex:1; color:var(--text); font-weight:500; }
.btn { display:inline-flex; align-items:center; padding:10px 24px; background:var(--gradient); color:white; border:none; border-radius:var(--radius); font-size:0.95rem; cursor:pointer; text-decoration:none; }
</style>

