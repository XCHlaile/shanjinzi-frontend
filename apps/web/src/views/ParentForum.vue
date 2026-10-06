<template>
  <div class="module-page">
    <section class="module-hero">
      <div class="container">
        <h1>💬 家长论坛</h1>
        <p>家校互动交流社区 — 发帖、回复、交流育儿经验</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="toolbar">
          <div class="toolbar-filters">
            <div class="scope-group">
              <button :class="{ active: topicScope === 'all' }" type="button" @click="selectScope('all')">全部话题</button>
              <button :class="{ active: topicScope === 'mine' }" type="button" @click="selectScope('mine')">我的话题</button>
            </div>
            <div v-if="topicScope === 'all'" class="filter-group">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                :class="['filter-btn', { active: activeTab === tab.key }]"
                type="button"
                @click="selectTab(tab.key)"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" type="button" @click="showForm = true">+ 发布话题</button>
        </div>

        <ForumTopicComposer
          v-if="showForm"
          v-model:topic="newTopic"
          v-model:media="newTopicMedia"
          v-model:uploading="newTopicUploading"
          :can-submit="canSubmitTopic"
          :publishing="publishing"
          @close="closeTopicForm"
          @submit="submitTopic"
        />

        <AppStatePanel
          :loading="loading"
          :error="loadError"
          :empty="!loading && !loadError && !topics.length"
          :empty-title="topicScope === 'mine' ? '你还没有发布话题' : '暂无话题'"
          empty-text="点击上方“发布话题”开始讨论。"
          loading-text="正在加载论坛话题"
          @retry="loadTopics"
        />

        <template v-if="!loading && !loadError">
          <ForumTopicCard
            v-for="topic in topics"
            :key="topic.topicId"
          v-model:reply-edit-media="replyEditMedia"
          v-model:reply-edit-text="replyEditText"
          v-model:reply-edit-uploading="replyEditUploading"
          v-model:reply-texts="replyTexts"
          v-model:topic-edit-form="topicEditForm"
          v-model:topic-edit-media="topicEditMedia"
          v-model:topic-edit-uploading="topicEditUploading"
          :avatar-src="avatarSrc"
          :can-load-more-replies="canLoadMoreReplies"
          :can-submit-reply="canSubmitReply"
          :deleting-reply-id="deletingReplyId"
          :deleting-topic-id="deletingTopicId"
          :editing-reply-id="editingReplyId"
          :editing-topic-id="editingTopicId"
          :expanded-topic-id="expandedTopicId"
          :forum-media="forumMedia"
          :is-own-reply="isOwnReply"
          :liking-topic-id="likingTopicId"
          :replies-by-topic="repliesByTopic"
          :replying-topic-id="replyingTopicId"
          :reply-loading="replyLoading"
          :reply-media-by-topic="replyMediaByTopic"
          :reply-uploading="replyUploading"
          :reporting-target="reportingTarget"
          :topic="topic"
          :topic-details="topicDetails"
          :topic-scope="topicScope"
          :updating-reply-id="updatingReplyId"
          :updating-topic-id="updatingTopicId"
          @cancel-reply-edit="cancelReplyEdit"
          @cancel-topic-edit="cancelTopicEdit"
          @delete-reply="deleteReply"
          @delete-topic="deleteTopic"
          @load-more-replies="loadMoreReplies"
          @report-reply="reportReply"
          @report-topic="reportTopic"
          @set-reply-media="setReplyMedia"
          @set-reply-uploading="setReplyUploading"
          @start-edit-reply="startEditReply"
          @start-edit-topic="startEditTopic"
          @submit-reply="submitReply"
          @submit-reply-edit="submitReplyEdit"
          @submit-topic-edit="submitTopicEdit"
          @toggle-like="toggleLike"
            @toggle-topic="toggleTopic"
          />
        </template>

        <div v-if="!loading && totalPages > 1" class="pagination">
          <button class="btn btn-outline btn-xs" type="button" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
          <span>第 {{ page }} / {{ totalPages }} 页，共 {{ total }} 条</span>
          <button class="btn btn-outline btn-xs" type="button" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppStatePanel from '@/components/AppStatePanel.vue'
import { ElMessage, ElMessageBox } from '@/shared/ui/feedback.js'
import {
  ForumTopicCard,
  ForumTopicComposer
} from '@/features/forum/ui/index.js'
import {
  isForumAuthor,
  resolveForumMedia,
  useForumManagement
} from '@/features/forum/index.js'
import { getCurrentUser } from '@/features/authentication/index.js'
import { resolveApiAssetUrl } from '@/shared/api/httpClient.js'
import { useLiveRefresh } from '@/shared/composables/liveRefresh.js'

const currentProfile = ref(getCurrentUser() || {})
const {
  activeTab,
  cancelReplyEdit,
  cancelTopicEdit,
  canLoadMoreReplies,
  canSubmitReply,
  canSubmitTopic,
  changePage,
  closeTopicForm,
  deleteReply,
  deleteTopic,
  deletingReplyId,
  deletingTopicId,
  editingReplyId,
  editingTopicId,
  expandedTopicId,
  likingTopicId,
  loadError,
  loading,
  loadMoreReplies,
  loadTopics,
  newTopic,
  newTopicMedia,
  newTopicUploading,
  page,
  publishing,
  refreshForumLive,
  repliesByTopic,
  replyingTopicId,
  replyEditMedia,
  replyEditText,
  replyEditUploading,
  replyLoading,
  replyMediaByTopic,
  replyTexts,
  replyUploading,
  reportReply,
  reportingTarget,
  reportTopic,
  selectScope,
  selectTab,
  setReplyMedia,
  setReplyUploading,
  showForm,
  startEditReply,
  startEditTopic,
  submitReply,
  submitReplyEdit,
  submitTopic,
  submitTopicEdit,
  tabs,
  toggleLike,
  toggleTopic,
  topicDetails,
  topicEditForm,
  topicEditMedia,
  topicEditUploading,
  topics,
  topicScope,
  total,
  totalPages,
  updatingReplyId,
  updatingTopicId
} = useForumManagement({
  confirm: ElMessageBox.confirm,
  prompt: ElMessageBox.prompt,
  notify: ElMessage
})

function isCurrentAuthor(author = {}) {
  return isForumAuthor(author, currentProfile.value)
}

function avatarSrc(author = {}) {
  return resolveApiAssetUrl(
    author.avatarUrl || (isCurrentAuthor(author) ? currentProfile.value.avatarUrl : '')
  )
}

function syncCurrentProfile() {
  currentProfile.value = getCurrentUser() || {}
}

function forumMedia(topic) {
  return resolveForumMedia(topic, topicDetails.value[topic.topicId])
}

function isOwnReply(reply = {}) {
  return isCurrentAuthor(reply.author)
}

useLiveRefresh(refreshForumLive, { interval: 4000 })

onMounted(() => {
  syncCurrentProfile()
  window.addEventListener('storage', syncCurrentProfile)
  window.addEventListener('focus', syncCurrentProfile)
  loadTopics()
})
onBeforeUnmount(() => {
  window.removeEventListener('storage', syncCurrentProfile)
  window.removeEventListener('focus', syncCurrentProfile)
})
</script>

<style scoped>
.module-hero { background:linear-gradient(135deg,#0f172a,#1e293b); color:white; padding:100px 0 40px; }
.module-hero h1 { font-size:1.8rem; margin-bottom:8px; }
.module-hero p { color:#94a3b8; }
.toolbar { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px; }
.toolbar-filters { display:grid; gap:10px; }
.scope-group { display:flex; gap:8px; }
.scope-group button { border:1px solid var(--border); border-radius:8px; padding:7px 14px; background:white; cursor:pointer; }
.scope-group button.active { color:white; background:#0f766e; border-color:#0f766e; }
.filter-group { display:flex; gap:6px; flex-wrap:wrap; }
.filter-btn { padding:6px 14px; border:1px solid var(--border); border-radius:20px; background:white; font-size:0.83rem; cursor:pointer; transition:all .2s; }
.filter-btn.active { background:var(--primary); color:white; border-color:var(--primary); }
.filter-btn:hover:not(.active) { border-color:var(--primary); }
.filter-btn:disabled, .btn:disabled, .fp-btn:disabled { cursor:not-allowed; opacity:.6; }

.btn-xs { padding:6px 14px; font-size:0.82rem; }
.btn-sm { padding:8px 18px; font-size:0.85rem; }
.pagination { display:flex; justify-content:center; align-items:center; gap:16px; margin-top:22px; color:var(--text-secondary); font-size:.84rem; }

@media (max-width:640px) {
  .toolbar { align-items:stretch; }
  .toolbar > .btn { width:100%; }
  .pagination { gap:8px; }
}
</style>
