<template>
  <div class="module-page">
    <section class="module-hero">
      <div class="container">
        <p class="eyebrow">{{ roleLabel }}</p>
        <h1>赛事专区</h1>
        <p>{{ heroDescription }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <p v-if="actionMessage" class="state-panel success-state">{{ actionMessage }}</p>
        <AppStatePanel
          :loading="loading"
          :error="loadError"
          :empty="!loading && !loadError && !competitions.length"
          empty-title="暂无可见赛事"
          empty-text="已发布且对当前账号可见的赛事会显示在这里。"
          loading-text="正在加载赛事"
          @retry="loadCompetitions"
        />
        <div v-if="!loading && !loadError && competitions.length" class="competition-grid">
          <article
            v-for="item in competitions"
            :id="`competition-${item.id}`"
            :key="item.id"
            :class="['competition-card', { 'source-target': isSourceTarget(item.id) }]"
          >
            <div class="card-top">
              <span>{{ item.scope }}</span>
              <em>{{ item.status }}</em>
            </div>
            <h2>{{ item.name }}</h2>
            <p v-if="item.summary">{{ item.summary }}</p>
            <p>报名截止：{{ formatDateTime(item.deadline) }}</p>

            <div class="progress-row">
              <strong>报名 {{ item.registered }}/{{ item.limit || '不限' }}</strong>
              <div v-if="item.limit"><i :style="{ width: progressWidth(item) }"></i></div>
            </div>

            <div v-if="role !== 'parent'" class="registration-summary">
              <strong>报名人数：{{ item.registrationStats?.total ?? item.registered }}</strong>
              <span v-if="item.countError" class="inline-error">{{ item.countError }}</span>
              <small v-else-if="role === 'school' && item.registrationStats">
                已提交 {{ item.registrationStats.submitted }} · 已通过 {{ item.registrationStats.approved }} ·
                已驳回 {{ item.registrationStats.rejected }} · 已取消 {{ item.registrationStats.canceled }}
              </small>
            </div>

            <div class="card-actions">
              <button
                v-if="role === 'parent'"
                class="btn btn-primary btn-sm"
                :disabled="!canSignup(item)"
                @click="openSignup(item)"
              >
                {{ signupButtonText(item) }}
              </button>
              <button
                v-if="role === 'school'"
                class="btn btn-outline btn-sm"
                type="button"
                @click="openRegistrations(item)"
              >
                查看报名名单
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <div v-if="signup" class="modal-overlay" @click.self="closeSignup">
      <form class="modal-card" @submit.prevent="submitSignup">
        <h3>赛事报名</h3>
        <p>{{ signup.name }}</p>
        <label>学生姓名<input v-model="signupForm.studentName" disabled></label>
        <label>学生班级<input v-model="signupForm.className" disabled></label>
        <label>家长联系电话<input v-model="signupForm.phone" disabled></label>
        <label>备注<textarea v-model="signupForm.remark" maxlength="1000" rows="3"></textarea></label>
        <span v-if="signupError" class="inline-error">{{ signupError }}</span>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" @click="closeSignup">取消</button>
          <button class="btn btn-primary" :disabled="signupSubmitting">
            {{ signupSubmitting ? '提交中...' : '提交报名' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="registrationCompetition" class="modal-overlay" @click.self="closeRegistrations">
      <section class="modal-card registration-modal">
        <h3>报名名单</h3>
        <p>{{ registrationCompetition.name }}</p>
        <strong>
          报名人数：{{ registrationCompetition.registrationStats?.total ?? registrationCompetition.registered }}
        </strong>
        <form class="lead-teacher-form" @submit.prevent="saveLeadTeacher">
          <label>带队教师
            <select v-model="leadTeacherId" :disabled="teachersLoading || !teacherOptions.length" required>
              <option value="" disabled>
                {{ teachersLoading ? '正在加载教师...' : teachersError ? '教师列表加载失败' : teacherOptions.length ? '请选择教师' : '暂无可选教师' }}
              </option>
              <option
                v-for="teacher in teacherOptions"
                :key="teacherId(teacher)"
                :value="String(teacherId(teacher))"
              >
                {{ teacherOptionLabel(teacher) }}
              </option>
            </select>
          </label>
          <button
            v-if="teachersError"
            class="teacher-retry"
            type="button"
            :disabled="teachersLoading"
            @click="loadTeachers"
          >
            重新加载教师
          </button>
          <button class="btn btn-outline btn-sm" type="submit" :disabled="leadTeacherSaving || teachersLoading || !leadTeacherId">
            {{ leadTeacherSaving ? '保存中...' : '设置带队教师' }}
          </button>
        </form>
        <form class="registration-filters" @submit.prevent="loadCompetitionRegistrations">
          <input v-model.trim="registrationFilters.classId" type="number" min="1" step="1" placeholder="班级 ID" />
          <label>报名开始时间<input v-model="registrationFilters.startTime" type="datetime-local" /></label>
          <label>报名结束时间<input v-model="registrationFilters.endTime" type="datetime-local" /></label>
          <button class="btn btn-outline btn-sm" type="submit" :disabled="registrationsLoading">筛选名单</button>
        </form>
        <p v-if="registrationsLoading" class="modal-state">正在加载报名名单...</p>
        <p v-else-if="registrationsError" class="modal-state inline-error">{{ registrationsError }}</p>
        <p v-else-if="!registrationRows.length" class="modal-state">暂无报名人员</p>
        <ol v-else class="registration-list">
          <li v-for="(registration, index) in registrationRows" :key="registrationKey(registration, index)">
            <strong>{{ registrationName(registration) }}</strong>
            <span v-if="registrationClassName(registration)">{{ registrationClassName(registration) }}</span>
          </li>
        </ol>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" @click="closeRegistrations">关闭</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppStatePanel from '@/components/AppStatePanel.vue'
import {
  competitionHeroDescription,
  competitionProgressWidth as progressWidth,
  competitionRegistrationClassName as registrationClassName,
  competitionRegistrationKey as registrationKey,
  competitionRegistrationName as registrationName,
  competitionTeacherId as teacherId,
  competitionTeacherOptionLabel as teacherOptionLabel,
  formatCompetitionDateTime as formatDateTime,
  useCompetitionManagement
} from '@/features/competition/index.js'
import { getRoleLabel, normalizeRole } from '@/entities/user/index.js'
import { getCurrentStudent } from '@/features/student-context/index.js'
import { getCurrentUser } from '@/features/authentication/index.js'

const user = getCurrentUser() || { role: 'parent' }
const route = useRoute()
const role = normalizeRole(user.role)
const roleLabel = getRoleLabel(role)
const currentStudent = getCurrentStudent()

const heroDescription = competitionHeroDescription(role)
const {
  actionMessage,
  canSignup,
  closeRegistrations,
  closeSignup,
  competitions,
  isSourceTarget,
  leadTeacherId,
  leadTeacherSaving,
  loadCompetitionRegistrations,
  loadCompetitions,
  loadError,
  loadTeachers,
  loading,
  openRegistrations,
  openSignup,
  registrationCompetition,
  registrationFilters,
  registrationRows,
  registrationsError,
  registrationsLoading,
  saveLeadTeacher,
  signup,
  signupButtonText,
  signupError,
  signupForm,
  signupSubmitting,
  submitSignup,
  teacherOptions,
  teachersError,
  teachersLoading
} = useCompetitionManagement({
  role,
  currentStudent,
  user,
  getRequestedCompetitionId: () => route.query.competitionId
})

onMounted(loadCompetitions)
</script>

<style scoped>
.module-hero { padding:104px 0 42px; background:linear-gradient(135deg,#0f172a,#1e3a5f); color:white; }
.module-hero h1 { font-size:2rem; margin:6px 0; }
.module-hero p { color:#cbd5e1; }
.eyebrow { color:#93c5fd; font-weight:700; }
.state-panel { display:flex; justify-content:center; align-items:center; gap:12px; min-height:90px; margin-bottom:16px; padding:24px; border:1px solid var(--border); border-radius:8px; background:white; color:var(--text-secondary); }
.success-state { color:#166534; background:#f0fdf4; border-color:#bbf7d0; }
.competition-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:16px; }
.competition-card { background:white; border:1px solid var(--border); border-radius:8px; padding:18px; }
.competition-card.source-target { border-color:var(--primary); box-shadow:0 0 0 3px rgba(59,130,246,.16); }
.card-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.card-top span, .card-top em { font-style:normal; border-radius:99px; padding:4px 10px; font-size:0.8rem; }
.card-top span { background:#eff6ff; color:#2563eb; }
.card-top em { background:#dcfce7; color:#15803d; }
.competition-card h2 { font-size:1.1rem; margin-bottom:8px; }
.competition-card p { color:var(--text-secondary); line-height:1.6; font-size:0.9rem; }
.progress-row { margin:16px 0; display:grid; gap:8px; }
.progress-row div { height:8px; background:#e2e8f0; border-radius:99px; overflow:hidden; }
.progress-row i { display:block; height:100%; background:var(--primary); }
.registration-summary { display:grid; gap:6px; margin:14px 0; padding:12px; border-radius:8px; background:#f8fafc; }
.registration-summary small { color:var(--text-secondary); line-height:1.5; }
.inline-error { color:#b91c1c; font-size:0.88rem; }
.card-actions { display:flex; gap:10px; }
.modal-overlay { position:fixed; inset:0; z-index:1200; background:rgba(15,23,42,0.55); display:grid; place-items:center; padding:20px; }
.modal-card { width:min(460px,100%); max-height:80vh; overflow:auto; background:white; border-radius:8px; padding:22px; display:grid; gap:12px; }
.modal-card > p { color:var(--primary); font-weight:700; }
.modal-card label { display:grid; gap:6px; font-weight:700; font-size:0.88rem; }
.modal-card input, .modal-card textarea, .modal-card select { border:1.5px solid var(--border); border-radius:8px; padding:10px; font:inherit; background:white; }
.registration-modal { width:min(620px,100%); }
.lead-teacher-form { display:flex; align-items:end; gap:8px; padding:10px; border-radius:8px; background:#f8fafc; }
.lead-teacher-form label { flex:1; }
.teacher-retry { border:0; background:transparent; color:var(--primary); cursor:pointer; font:inherit; font-size:.8rem; }
.registration-filters { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; padding:10px; border:1px solid var(--border); border-radius:8px; }
.registration-filters label { font-size:.76rem; color:var(--text-secondary); }
.registration-filters input { width:100%; border:1.5px solid var(--border); border-radius:8px; padding:9px 10px; font:inherit; }
.modal-state { padding:20px; text-align:center; color:var(--text-secondary); }
.registration-list { display:grid; gap:8px; padding-left:28px; }
.registration-list li { padding:10px 12px; border:1px solid var(--border); border-radius:8px; }
.registration-list strong, .registration-list span { display:block; }
.registration-list span { margin-top:4px; color:var(--text-secondary); font-size:0.88rem; }
.modal-actions { display:flex; justify-content:flex-end; gap:10px; }
</style>
