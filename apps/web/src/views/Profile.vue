<template>
  <div class="plain-page">
    <section class="section">
      <div class="container profile-layout">
        <aside class="profile-sidebar">
          <div class="page-heading">
            <p>账号安全</p>
            <h1>个人资料与密码</h1>
            <span>维护当前登录账号的基础资料。</span>
          </div>

          <nav class="profile-nav" aria-label="账号设置">
            <button
              type="button"
              :class="{ active: activeTab === 'profile' }"
              @click="setActiveTab('profile')"
            >
              <span>个人信息</span>
              <small>姓名、手机号、角色与性别</small>
            </button>
            <button
              type="button"
              :class="{ active: activeTab === 'password' || activeTab === 'reset' }"
              @click="setActiveTab('password')"
            >
              <span>修改密码</span>
              <small>修改当前登录账号密码</small>
            </button>
          </nav>
        </aside>

        <section class="profile-panel">
          <form v-if="activeTab === 'profile'" class="profile-card" @submit.prevent="saveProfile">
            <div class="panel-heading">
              <h2>个人信息</h2>
              <p>维护当前账号的展示姓名和基础资料。</p>
            </div>
            <div class="profile-upload">
              <span>头像</span>
              <div class="avatar-editor">
                <a
                  v-if="avatarPreviewUrl"
                  class="avatar-preview avatar-preview-link"
                  :href="avatarPreviewUrl"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="查看原版头像"
                  title="点击查看原版头像"
                >
                  <img :src="avatarPreviewUrl" alt="当前头像" />
                  <span class="avatar-preview-overlay">查看原图</span>
                </a>
                <div v-else class="avatar-preview">
                  <span>{{ profileInitial }}</span>
                </div>
                <div class="avatar-controls">
                  <AppFileUploader
                    v-model="avatarFiles"
                    source-type="avatar"
                    :label="avatarFiles.length ? '更换头像' : '上传头像'"
                    accept="image/jpeg,image/png"
                    :multiple="false"
                    :max-files="1"
                    :show-file-details="false"
                    :disabled="profileLoading"
                    @uploading-change="avatarUploading = $event"
                  />
                  <small v-if="avatarPreviewUrl" class="avatar-view-tip">点击头像查看原版头像</small>
                </div>
              </div>
            </div>
            <label>姓名<input v-model="form.nickname"></label>
            <label>手机号<input v-model="form.phone" disabled></label>
            <label>当前角色<input :value="roleLabel" disabled></label>
            <label>性别
              <select v-model="form.gender">
                <option value="">未设置</option>
                <option value="MALE">男</option>
                <option value="FEMALE">女</option>
              </select>
            </label>
            <p v-if="message" class="profile-message" :class="{ error: profileError }">{{ message }}</p>
            <button type="submit" class="btn btn-primary" :disabled="profileLoading || avatarUploading">
              {{ profileLoading ? '保存中...' : '保存资料' }}
            </button>
          </form>

          <form v-else-if="activeTab === 'password'" class="profile-card password-form" @submit.prevent="savePassword">
            <div class="panel-heading">
              <h2>修改本人密码</h2>
              <p>输入原密码并设置新的登录密码。</p>
            </div>
            <label>原密码<input v-model="passwordForm.oldPassword" type="password" autocomplete="current-password" required></label>
            <label>新密码<input v-model="passwordForm.newPassword" type="password" autocomplete="new-password" minlength="6" required></label>
            <label>确认新密码<input v-model="passwordForm.confirmPassword" type="password" autocomplete="new-password" minlength="6" required></label>
            <p v-if="passwordMessage" class="profile-message" :class="{ error: passwordError }">{{ passwordMessage }}</p>
            <div class="password-actions">
              <button type="submit" class="btn btn-primary" :disabled="passwordLoading">
                {{ passwordLoading ? '提交中...' : '确认修改密码' }}
              </button>
              <button type="button" class="btn btn-outline" @click="openPasswordReset">忘记密码</button>
            </div>
          </form>

          <form v-else class="profile-card password-form" @submit.prevent="submitPasswordReset">
            <div class="panel-heading">
              <h2>忘记密码</h2>
              <p>向当前账号手机号发送验证码，然后设置新的登录密码。</p>
            </div>
            <label>手机号<input v-model="resetForm.phone" type="tel" autocomplete="tel" disabled></label>
            <label>短信验证码
              <div class="reset-code-row">
                <input v-model.trim="resetForm.smsCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="请输入 6 位验证码" required>
                <button type="button" class="btn btn-outline" :disabled="resetCodeSending || resetCountdown > 0" @click="sendResetCode">
                  {{ resetCountdown > 0 ? `${resetCountdown}s 后重发` : resetCodeSending ? '发送中...' : '获取验证码' }}
                </button>
              </div>
            </label>
            <label>新密码<input v-model="resetForm.newPassword" type="password" autocomplete="new-password" minlength="6" maxlength="72" required></label>
            <label>确认新密码<input v-model="resetForm.confirmPassword" type="password" autocomplete="new-password" minlength="6" maxlength="72" required></label>
            <p v-if="resetMessage" class="profile-message" :class="{ error: resetError }">{{ resetMessage }}</p>
            <div class="password-actions">
              <button type="submit" class="btn btn-primary" :disabled="resetLoading">
                {{ resetLoading ? '重置中...' : '确认重置密码' }}
              </button>
              <button type="button" class="btn btn-outline" :disabled="resetLoading" @click="setActiveTab('password')">返回修改密码</button>
            </div>
          </form>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRoleLabel, normalizeRole } from '@/entities/user/index.js'
import {
  getCurrentUser,
  useAccountManagement
} from '@/features/authentication/index.js'
import AppFileUploader from '@/components/AppFileUploader.vue'

const user = getCurrentUser() || {}
const router = useRouter()
const {
  avatarFiles,
  avatarPreviewUrl,
  avatarUploading,
  activeTab,
  form,
  initialize,
  message,
  openPasswordReset,
  passwordError,
  passwordForm,
  passwordLoading,
  passwordMessage,
  profileError,
  profileInitial,
  profileLoading,
  resetCodeSending,
  resetCountdown,
  resetError,
  resetForm,
  resetLoading,
  resetMessage,
  savePassword,
  saveProfile,
  sendResetCode,
  setActiveTab,
  stopResetCountdown,
  submitPasswordReset
} = useAccountManagement({
  user,
  afterPasswordReset: () => router.replace({
    path: '/login',
    query: { passwordReset: 'success' }
  })
})
const roleLabel = getRoleLabel(normalizeRole(user.role))

onMounted(initialize)
onBeforeUnmount(stopResetCountdown)
</script>

<style scoped>
.plain-page { padding-top:64px; }
.profile-layout { display:grid; grid-template-columns:260px minmax(0, 1fr); gap:24px; align-items:start; }
.profile-sidebar { position:sticky; top:88px; display:grid; gap:18px; }
.page-heading p { color:var(--primary); font-weight:700; }
.page-heading h1 { font-size:1.8rem; margin:4px 0 6px; }
.page-heading span { color:var(--text-secondary); line-height:1.7; }
.profile-nav { background:white; border:1px solid var(--border); border-radius:8px; padding:8px; display:grid; gap:6px; }
.profile-nav button { border:0; background:transparent; border-radius:8px; padding:12px; text-align:left; cursor:pointer; display:grid; gap:4px; color:var(--text-primary); font:inherit; }
.profile-nav button.active { background:var(--primary-light); color:var(--primary); }
.profile-nav span { font-weight:800; }
.profile-nav small { color:var(--text-secondary); line-height:1.5; }
.profile-nav button.active small { color:var(--primary); }
.profile-panel { min-width:0; }
.profile-card { background:white; border:1px solid var(--border); border-radius:8px; padding:20px; display:grid; gap:14px; }
.panel-heading { display:grid; gap:4px; margin-bottom:2px; }
.panel-heading h2 { font-size:1.15rem; margin:0; }
.panel-heading p { color:var(--text-secondary); margin:0; line-height:1.6; }
.profile-card label { display:grid; gap:6px; font-weight:700; font-size:0.88rem; }
.profile-upload { display:grid; gap:6px; }
.profile-upload > span { font-weight:700; font-size:0.88rem; }
.avatar-editor { display:flex; align-items:center; gap:16px; padding:14px; border:1px solid var(--border); border-radius:8px; background:#f8fafc; }
.avatar-preview { width:84px; height:84px; flex:0 0 84px; overflow:hidden; border-radius:50%; background:linear-gradient(135deg,#2563eb,#06b6d4); color:white; display:grid; place-items:center; font-size:1.7rem; font-weight:800; }
.avatar-preview img { width:100%; height:100%; object-fit:cover; }
.avatar-preview-link { position:relative; outline:0; cursor:zoom-in; }
.avatar-preview-overlay { position:absolute; inset:auto 0 0; padding:5px 2px 7px; background:linear-gradient(transparent,rgba(15,23,42,.78)); color:white; font-size:.66rem; font-weight:700; text-align:center; opacity:0; transform:translateY(4px); transition:opacity .15s ease,transform .15s ease; }
.avatar-preview-link:hover .avatar-preview-overlay, .avatar-preview-link:focus-visible .avatar-preview-overlay { opacity:1; transform:translateY(0); }
.avatar-preview-link:focus-visible { box-shadow:0 0 0 3px #bfdbfe; }
.avatar-controls { min-width:0; display:grid; gap:7px; }
.avatar-view-tip { color:var(--text-secondary); font-size:.75rem; }
.avatar-controls :deep(.uploaded-file) { width:max-content; background:transparent; padding:0; }
.profile-card input, .profile-card select { border:1.5px solid var(--border); border-radius:8px; padding:10px 12px; font:inherit; background:white; }
.password-form { display:grid; gap:14px; }
.password-actions { display:grid; grid-template-columns:minmax(0, 1fr) minmax(0, .55fr); gap:10px; }
.password-actions .btn { justify-content:center; }
.reset-code-row { display:grid; grid-template-columns:minmax(0, 1fr) auto; gap:10px; }
.reset-code-row .btn { white-space:nowrap; justify-content:center; }
.profile-message { color:#0f766e; font-size:0.9rem; }
.profile-message.error { color:#ef4444; }
@media (max-width:800px) {
  .profile-layout { grid-template-columns:1fr; }
  .profile-sidebar { position:static; }
  .profile-nav { grid-template-columns:1fr 1fr; }
  .avatar-editor { align-items:flex-start; }
  .password-actions, .reset-code-row { grid-template-columns:1fr; }
}
</style>
