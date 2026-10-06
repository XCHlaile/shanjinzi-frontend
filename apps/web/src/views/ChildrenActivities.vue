<template>
  <div class="module-page">
    <section class="module-hero">
      <div class="container">
        <p class="eyebrow">{{ roleLabel }}</p>
        <h1>幼儿动态</h1>
        <p>动态列表、发布、我的动态和评论管理均使用后端实时接口。</p>
      </div>
    </section>

    <section class="section">
      <div class="container activity-layout">
        <aside class="side-panel">
          <strong>数据边界</strong>
          <p>{{ boundaryText }}</p>
          <div v-if="role === 'parent'" class="student-mini">
            <span>当前学生</span>
            <b>{{ currentStudent?.name || '未选择学生' }}</b>
            <router-link to="/student-switcher">{{ currentStudent ? '切换学生' : '选择学生' }}</router-link>
          </div>
          <div v-if="canPublish" class="list-switch">
            <button :class="{ active: listMode === 'visible' }" type="button" @click="switchList('visible')">可见动态</button>
            <button :class="{ active: listMode === 'mine' }" type="button" @click="switchList('mine')">我的发布</button>
          </div>
        </aside>

        <main class="activity-main">
          <ActivityPublishPanel
            v-if="canPublish"
            v-model:form="publishForm"
            v-model:media="publishMedia"
            v-model:uploading="publishUploading"
            :can-publish-moment="canPublishMoment"
            :class-options="publishClassOptions"
            :class-placeholder="publishClassPlaceholder"
            :classes-error="publishClassesError"
            :classes-loading="publishClassesLoading"
            :publishing="publishing"
            :role="role"
            :student-options="availableStudentOptions"
            :student-placeholder="publishStudentPlaceholder"
            :students-error="publishStudentsError"
            :students-loading="publishStudentsLoading"
            :visibility-description="publishVisibilityDescription"
            :visibility-title="publishVisibilityTitle"
            @submit="publishActivity"
          />

          <div class="activity-list-heading">
            <div>
              <strong>{{ listTitle }}</strong>
              <span>{{ listEndpoint }}</span>
            </div>
            <span v-if="!loading && !loadError">共 {{ pagination.total }} 条</span>
          </div>

          <AppStatePanel
            :loading="loading"
            :error="loadError"
            :empty="!loading && !loadError && !activityList.length"
            :empty-title="listMode === 'mine' ? '你还没有发布动态' : '暂无可见动态'"
            empty-text="发布新动态后，内容会显示在这里。"
            loading-text="正在加载动态"
            @retry="loadActivities"
          />
          <template v-if="!loading && !loadError && activityList.length">
            <ActivityCard
              v-for="item in activityList"
              :key="item.id"
              v-model:comment-media="commentMedia"
              v-model:comment-text="commentText"
              v-model:comment-uploading="commentUploading"
              v-model:edit-form="editForm"
              v-model:edit-media="editMedia"
              v-model:edit-uploading="editUploading"
              :can-delete-comment="canDeleteComment"
              :can-report="canReportMoment(item)"
              :can-save="canSaveActivity"
              :can-submit-comment="canSubmitComment"
              :comment-error="commentError"
              :comment-loading="commentLoading"
              :comments="comments"
              :comments-active="activeMomentId === item.id"
              :comment-submitting="commentSubmitting"
              :deleting="deletingMomentId === item.id"
              :deleting-comment-id="deletingCommentId"
              :editing="editingMomentId === item.id"
              :format-time="formatTime"
              :is-own-list="listMode === 'mine'"
              :item="item"
              :liking="likingMomentId === item.id"
              :reporting-target="reportingTarget"
              :source-target="isSourceTarget(item.id)"
              :updating="updatingMomentId === item.id"
              @cancel-edit="cancelActivityEdit"
              @delete="deleteActivity(item)"
              @delete-comment="deleteComment(item, $event)"
              @report="reportActivity(item)"
              @report-comment="reportActivityComment(item, $event)"
              @save-edit="saveActivityEdit(item)"
              @start-edit="startEditActivity(item)"
              @submit-comment="submitComment(item)"
              @toggle-comments="toggleComments(item)"
              @toggle-like="toggleActivityLike(item)"
            />
            <nav v-if="pagination.totalPages > 1" class="pagination" aria-label="动态分页">
              <button
                class="btn btn-outline btn-sm"
                type="button"
                :disabled="loading || pagination.page <= 1"
                @click="changePage(pagination.page - 1)"
              >
                上一页
              </button>
              <span>第 {{ pagination.page }} / {{ pagination.totalPages }} 页</span>
              <button
                class="btn btn-outline btn-sm"
                type="button"
                :disabled="loading || pagination.page >= pagination.totalPages"
                @click="changePage(pagination.page + 1)"
              >
                下一页
              </button>
            </nav>
          </template>
        </main>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppStatePanel from '@/components/AppStatePanel.vue'
import { ElMessage, ElMessageBox } from '@/shared/ui/feedback.js'
import {
  formatActivityTime as formatTime,
  useActivityManagement
} from '@/features/activities/index.js'
import { ActivityCard, ActivityPublishPanel } from '@/features/activities/ui/index.js'
import { getRoleLabel, normalizeRole } from '@/entities/user/index.js'
import { getCurrentStudent } from '@/features/student-context/index.js'
import { getCurrentUser } from '@/features/authentication/index.js'

const user = getCurrentUser() || { role: 'parent' }
const route = useRoute()
const role = normalizeRole(user.role)
const roleLabel = getRoleLabel(role)
const currentUserId = String(user.id ?? user.userId ?? '')
const currentStudent = getCurrentStudent()

const {
  activeMomentId,
  activityList,
  availableStudentOptions,
  boundaryText,
  canDeleteComment,
  canPublish,
  canPublishMoment,
  canReportMoment,
  canSaveActivity,
  canSubmitComment,
  cancelActivityEdit,
  changePage,
  commentError,
  commentLoading,
  commentMedia,
  comments,
  commentSubmitting,
  commentText,
  commentUploading,
  deleteActivity,
  deleteComment,
  deletingCommentId,
  deletingMomentId,
  editForm,
  editingMomentId,
  editMedia,
  editUploading,
  initialize,
  isSourceTarget,
  likingMomentId,
  listEndpoint,
  listMode,
  listTitle,
  loadActivities,
  loadError,
  loading,
  pagination,
  publishActivity,
  publishClassesError,
  publishClassesLoading,
  publishClassOptions,
  publishClassPlaceholder,
  publishForm,
  publishing,
  publishMedia,
  publishStudentPlaceholder,
  publishStudentsError,
  publishStudentsLoading,
  publishUploading,
  publishVisibilityDescription,
  publishVisibilityTitle,
  reportActivity,
  reportActivityComment,
  reportingTarget,
  saveActivityEdit,
  startEditActivity,
  submitComment,
  switchList,
  toggleActivityLike,
  toggleComments,
  updatingMomentId
} = useActivityManagement({
  role,
  currentStudent,
  initialUser: user,
  requestedMomentId: () => route.query.momentId,
  currentUserId,
  confirm: ElMessageBox.confirm,
  prompt: ElMessageBox.prompt,
  notify: ElMessage
})

onMounted(initialize)
</script>

<style scoped>
.module-hero { padding:104px 0 42px; background:linear-gradient(135deg,#0f172a,#1e3a5f); color:white; }
.module-hero h1 { font-size:2rem; margin:6px 0; }
.module-hero p { color:#cbd5e1; }
.eyebrow { color:#93c5fd !important; font-weight:700; }
.activity-layout { display:grid; grid-template-columns:280px 1fr; gap:18px; align-items:start; }
.side-panel { padding:18px; border:1px solid var(--border); border-radius:8px; background:white; }
.side-panel p { color:var(--text-secondary); font-size:0.9rem; line-height:1.7; margin-top:8px; }
.student-mini { margin-top:16px; display:grid; gap:5px; background:#f8fafc; padding:12px; border-radius:8px; }
.student-mini span { color:var(--text-secondary); font-size:0.82rem; }
.list-switch { display:grid; gap:8px; margin-top:18px; }
.list-switch button { border:1px solid var(--border); border-radius:8px; background:white; padding:9px 12px; cursor:pointer; text-align:left; }
.list-switch button.active { color:white; background:var(--primary); border-color:var(--primary); }
.activity-main { display:grid; gap:14px; }
.activity-list-heading { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:0 4px; }
.activity-list-heading div { display:grid; gap:3px; }
.activity-list-heading span { color:var(--text-secondary); font-size:.78rem; }
.pagination { display:flex; align-items:center; justify-content:center; gap:14px; padding:6px 0; color:var(--text-secondary); font-size:.86rem; }
@media (max-width:900px) {
  .activity-layout { grid-template-columns:1fr; }
}
</style>
