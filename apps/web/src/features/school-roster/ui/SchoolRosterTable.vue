<template>
  <div class="table-panel">
    <table v-if="mode === 'students'" class="data-table student-table" aria-label="学生名册">
      <colgroup>
        <col class="student-column">
        <col class="school-column">
        <col class="guardian-column">
        <col class="status-column">
        <col class="time-column">
        <col class="action-column">
      </colgroup>
      <thead>
        <tr><th scope="col">学生</th><th scope="col">学校/班级</th><th scope="col">家长</th><th scope="col">学籍/账号</th><th scope="col">创建时间</th><th scope="col">操作</th></tr>
      </thead>
      <tbody>
        <tr v-for="student in rows" :key="student.id">
          <td class="student-cell" data-label="学生">
            <div class="student-identity">
              <strong>{{ student.name }}</strong>
              <span>{{ student.studentNo || '未设置学号' }}</span>
            </div>
          </td>
          <td class="school-cell" data-label="学校/班级">
            <strong>{{ student.schoolName || '-' }}</strong>
            <span class="class-tag" :class="{ 'is-unassigned': !student.className }">
              {{ student.className || '未分班' }}
            </span>
          </td>
          <td data-label="家长">
            <span class="guardian-badge" :class="{ 'is-empty': !(student.guardianCount > 0) }">
              <strong>{{ student.guardianCount ?? 0 }}</strong> 位
            </span>
          </td>
          <td data-label="学籍/账号">
            <div class="status-stack">
              <span class="enrollment-badge">{{ enrollmentLabel(student.enrollmentStatus) }}</span>
              <span class="account-badge" :class="isEnabled(student.status) ? 'is-active' : 'is-inactive'">
                {{ statusLabel(student.status) }}
              </span>
            </div>
          </td>
          <td class="time-cell" data-label="创建时间">{{ formatTime(student.createdAt) }}</td>
          <td class="row-actions" data-label="操作">
            <div class="action-list">
              <button type="button" @click="$emit('edit-student', student)">编辑</button>
              <button type="button" @click="$emit('open-guardians', student)">家长</button>
              <button type="button" @click="$emit('open-profile', student)">档案</button>
              <button type="button" :class="{ danger: isEnabled(student.status) }" @click="$emit('toggle-student-status', student)">
                {{ isEnabled(student.status) ? '停用' : '启用' }}
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="!rows.length"><td colspan="6" class="empty-cell">暂无符合条件的学生</td></tr>
      </tbody>
    </table>

    <table v-else class="data-table account-table" :aria-label="`${modeLabel}名册`">
      <thead>
        <tr><th scope="col">用户</th><th scope="col">手机号</th><th scope="col">角色</th><th scope="col">学校</th><th scope="col">状态</th><th scope="col">操作</th></tr>
      </thead>
      <tbody>
        <tr v-for="account in rows" :key="account.id">
          <td data-label="用户"><strong>{{ account.realName || '-' }}</strong><small>{{ account.nickname || '未设置昵称' }}</small></td>
          <td data-label="手机号">{{ account.phone || '-' }}</td>
          <td data-label="角色">{{ (account.roles || []).map(roleLabel).join('、') || modeLabel }}</td>
          <td data-label="学校">{{ account.schoolName || '-' }}</td>
          <td data-label="状态">{{ statusLabel(account.status) }}</td>
          <td class="row-actions" data-label="操作">
            <button type="button" @click="$emit('edit-user', account)">编辑</button>
            <button type="button" :class="{ danger: isEnabled(account.status) }" @click="$emit('toggle-user-status', account)">
              {{ isEnabled(account.status) ? '停用' : '启用' }}
            </button>
          </td>
        </tr>
        <tr v-if="!rows.length"><td colspan="6" class="empty-cell">暂无符合条件的{{ modeLabel }}</td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import {
  enrollmentLabel,
  formatTime,
  isEnabled,
  roleLabel,
  statusLabel
} from '../lib/rosterPresentation.js'

defineProps({
  mode: { type: String, required: true },
  modeLabel: { type: String, default: '' },
  rows: { type: Array, default: () => [] }
})

defineEmits([
  'edit-student', 'edit-user', 'open-guardians', 'open-profile',
  'toggle-student-status', 'toggle-user-status'
])
</script>

<style scoped>
.table-panel { overflow:auto; border:1px solid #dbe4ef; border-radius:14px; background:white; box-shadow:0 10px 30px rgba(15,23,42,.05); }
.data-table { width:100%; border-collapse:collapse; }
.data-table th, .data-table td { padding:15px 16px; border-bottom:1px solid #e7edf5; text-align:left; vertical-align:top; }
.data-table th { background:#f7f9fc; color:#52647a; font-size:.78rem; font-weight:700; letter-spacing:.04em; white-space:nowrap; }
.data-table td { font-size:.88rem; }
.data-table small { display:block; margin-top:3px; color:var(--text-secondary); }
.student-table { min-width:1060px; table-layout:fixed; }
.student-table .student-column { width:27%; }
.student-table .school-column { width:20%; }
.student-table .guardian-column { width:9%; }
.student-table .status-column { width:12%; }
.student-table .time-column { width:14%; }
.student-table .action-column { width:18%; }
.student-table tbody tr { transition:background-color .16s ease; }
.student-table tbody tr:hover { background:#f8fbff; }
.student-table td { vertical-align:middle; }
.student-cell, .school-cell { min-width:0; }
.student-identity { display:flex; align-items:center; gap:10px; min-width:0; }
.student-identity strong { overflow:hidden; color:#17243a; font-size:1rem; text-overflow:ellipsis; white-space:nowrap; }
.student-identity span { flex:0 0 auto; padding:3px 8px; border-radius:999px; background:#eef4ff; color:#3564a8; font-size:.72rem; font-weight:600; }
.school-cell strong { display:block; overflow:hidden; color:#334155; font-size:.88rem; font-weight:600; text-overflow:ellipsis; white-space:nowrap; }
.class-tag { display:inline-flex; align-items:center; margin-top:8px; padding:4px 9px; border:1px solid #bfdbfe; border-radius:999px; background:#eff6ff; color:#2563eb; font-size:.74rem; font-weight:600; white-space:nowrap; }
.class-tag.is-unassigned { border-color:#e2e8f0; background:#f8fafc; color:#94a3b8; }
.guardian-badge { display:inline-flex; align-items:baseline; gap:3px; color:#52647a; white-space:nowrap; }
.guardian-badge strong { color:#2563eb; font-size:1.05rem; }
.guardian-badge.is-empty strong { color:#94a3b8; }
.status-stack { display:flex; flex-wrap:wrap; gap:6px; }
.enrollment-badge, .account-badge { display:inline-flex; align-items:center; padding:4px 8px; border-radius:6px; font-size:.72rem; font-weight:600; white-space:nowrap; }
.enrollment-badge { background:#eef2ff; color:#4f46e5; }
.account-badge.is-active { background:#ecfdf5; color:#059669; }
.account-badge.is-inactive { background:#fff1f2; color:#e11d48; }
.time-cell { color:#52647a; line-height:1.5; white-space:nowrap; }
.row-actions { white-space:normal; }
.action-list { display:flex; flex-wrap:wrap; gap:6px; }
.row-actions button { margin-right:8px; border:0; background:transparent; color:var(--primary); cursor:pointer; font:inherit; font-size:.82rem; }
.action-list button { margin:0; padding:5px 8px; border:1px solid #dbeafe; border-radius:6px; background:#f8fbff; font-size:.76rem; line-height:1; transition:background-color .16s ease,border-color .16s ease; }
.action-list button:hover { border-color:#93c5fd; background:#eff6ff; }
.action-list button.danger { border-color:#fecdd3; background:#fff7f8; }
.row-actions button.danger { color:#dc2626; }
.empty-cell { padding:38px !important; color:var(--text-secondary); text-align:center !important; }

@media (max-width: 700px) {
  .table-panel { overflow: visible; border: 0; background: transparent; box-shadow: none; }
  .data-table, .data-table tbody { display: block; width: 100%; }
  .data-table colgroup, .data-table thead { display: none; }
  .data-table tbody { display: grid; gap: 12px; }
  .data-table tbody tr { display: block; overflow: hidden; border: 1px solid #dbe4ef; border-radius: 14px; background: #fff; box-shadow: 0 10px 26px rgba(15,23,42,.05); }
  .data-table tbody td { display: grid; grid-template-columns: minmax(5.5rem, .42fr) minmax(0, 1fr); gap: 14px; align-items: center; padding: 11px 14px; border-bottom: 1px solid #edf1f6; text-align: right; }
  .data-table tbody td::before { color: #718096; content: attr(data-label); font-size: .76rem; font-weight: 600; text-align: left; }
  .data-table tbody td:last-child { border-bottom: 0; }
  .student-table { min-width: 0; table-layout: auto; }
  .student-cell, .school-cell { min-width: 0; }
  .student-identity, .status-stack, .teacher-tags { justify-content: flex-end; }
  .student-identity { flex-wrap: wrap; }
  .student-identity strong, .school-cell strong { white-space: normal; text-align: right; }
  .class-tag { margin-top: 5px; }
  .time-cell { white-space: normal; }
  .action-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); width: 100%; }
  .row-actions button, .action-list button { min-height: 44px; margin: 0; padding: 10px 12px; }
  .empty-cell { display: block !important; padding: 34px 18px !important; border: 1px solid #dbe4ef !important; text-align: center !important; }
  .empty-cell::before { display: none; }
}

@media (max-width: 380px) {
  .data-table tbody td { grid-template-columns: 1fr; gap: 5px; text-align: left; }
  .data-table tbody td::before { text-align: left; }
  .student-identity, .status-stack { justify-content: flex-start; }
  .student-identity strong, .school-cell strong { text-align: left; }
  .action-list { grid-template-columns: 1fr; }
}
</style>
