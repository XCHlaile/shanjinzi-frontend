<template>
  <main class="login-page">
    <div class="login-shell">
      <section class="login-context">
        <div class="context-brand">
          <span class="context-logo"><img src="/logo.png" alt=""></span>
          <strong>山巾子科技</strong>
        </div>

        <div class="context-copy">
          <h2>让复杂的运营工作保持清晰</h2>
          <p>集中管理园所、账号、内容、赛事与审计记录，在同一套工作流中完成平台治理。</p>
          <ul>
            <li>园所与成员统一管理</li>
            <li>内容发布与举报处置</li>
            <li>关键操作全程留痕</li>
          </ul>
        </div>

        <p class="context-note">仅限已授权的超级管理员使用</p>
      </section>

      <section class="login-panel" aria-labelledby="admin-login-title">
        <div class="login-brand-mobile">
          <span><img src="/logo.png" alt=""></span>
          <strong>山巾子运营后台</strong>
        </div>
        <h1 id="admin-login-title">登录运营后台</h1>
        <p class="login-description">使用管理员账号继续进入平台控制台。</p>

        <el-form :model="form" label-position="top" class="login-form" @submit.prevent="submit">
          <el-form-item label="管理员账号" for="admin-username">
            <el-input
              id="admin-username"
              v-model.trim="form.username"
              size="large"
              placeholder="请输入管理员账号"
              autocomplete="username"
            />
          </el-form-item>
          <el-form-item label="登录密码" for="admin-password">
            <el-input
              id="admin-password"
              v-model="form.password"
              size="large"
              placeholder="请输入登录密码"
              type="password"
              autocomplete="current-password"
              show-password
            />
          </el-form-item>
          <el-alert v-if="error" :title="error" type="error" :closable="false" role="alert" />
          <el-button type="primary" size="large" native-type="submit" :loading="loading">
            {{ loading ? '正在登录' : '登录后台' }}
          </el-button>
        </el-form>

        <p class="login-help">如账号无法登录，请联系平台系统管理员核对权限。</p>
      </section>
    </div>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminLogin } from '@/api/client.js'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const form = reactive({ username: '', password: '' })

async function submit() {
  error.value = ''
  if (!form.username || !form.password) {
    error.value = '请输入管理员账号和登录密码'
    return
  }
  loading.value = true
  try {
    await adminLogin(form.username, form.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || '登录失败，请检查接口状态或账号密码后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: clamp(1rem, 4vw, 3rem);
  background:
    radial-gradient(circle at 8% 12%, rgba(232, 121, 85, 0.12), transparent 23rem),
    var(--brand-faint);
}

.login-shell {
  display: grid;
  grid-template-columns: minmax(20rem, 0.9fr) minmax(0, 1.1fr);
  width: min(100%, 66rem);
  min-height: 39rem;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--panel);
  box-shadow: 0 1.5rem 4.5rem rgba(35, 83, 112, 0.17);
}

.login-context {
  display: flex;
  flex-direction: column;
  padding: clamp(2rem, 5vw, 4rem);
  background:
    radial-gradient(circle at 86% 12%, rgba(232, 121, 85, 0.2), transparent 17rem),
    #17324d;
  color: #fff;
}

.context-brand,
.login-brand-mobile { display: flex; align-items: center; gap: 0.75rem; }
.context-brand { color: #edf6fa; font-size: 0.92rem; }
.context-logo,
.login-brand-mobile > span { display: grid; width: 40px; height: 40px; place-items: center; overflow: hidden; border-radius: 10px; background: #fbfdfe; }
.context-logo img,
.login-brand-mobile img { width: 100%; height: 100%; object-fit: contain; }

.context-copy { margin: auto 0; }
.context-copy h2 { max-width: 10ch; margin: 0 0 1.2rem; font-size: clamp(2.3rem, 4.5vw, 3.8rem); font-weight: 800; line-height: 1.04; letter-spacing: -0.035em; text-wrap: balance; }
.context-copy > p { max-width: 30rem; margin: 0; color: #bfd1da; font-size: 0.97rem; line-height: 1.8; }
.context-copy ul { display: grid; gap: 0.7rem; margin: 2rem 0 0; padding: 1.4rem 0 0; border-top: 1px solid rgba(216, 232, 239, 0.18); list-style: none; }
.context-copy li { position: relative; padding-left: 1.1rem; color: #d8e8ef; font-size: 0.86rem; }
.context-copy li::before { position: absolute; top: 0.58em; left: 0; width: 5px; height: 5px; border-radius: 50%; background: #f2a17f; content: ''; }
.context-note { margin: 0; color: #96b1c0; font-size: 0.72rem; }

.login-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(2.25rem, 6vw, 5rem);
  background: var(--panel);
}

.login-brand-mobile { display: none; margin-bottom: 2rem; color: var(--brand-deep); font-size: 0.86rem; }
.login-panel h1 { margin: 0 0 0.65rem; color: var(--text); font-size: clamp(2rem, 4vw, 2.65rem); font-weight: 780; line-height: 1.1; letter-spacing: -0.03em; }
.login-description { margin: 0 0 2rem; color: var(--muted); font-size: 0.92rem; line-height: 1.7; }
.login-form { display: grid; gap: 0.25rem; }
.login-form :deep(.el-form-item) { margin-bottom: 1rem; }
.login-form :deep(.el-form-item__label) { padding-bottom: 0.45rem; }
.login-form :deep(.el-button) { width: 100%; min-height: 46px; margin-top: 0.3rem; font-size: 0.95rem; }
.login-form :deep(.el-alert) { margin-bottom: 0.8rem; }
.login-help { margin: 1.35rem 0 0; color: var(--muted-light); font-size: 0.76rem; line-height: 1.65; text-align: center; }

@media (max-width: 820px) {
  .login-shell { grid-template-columns: 1fr; width: min(100%, 36rem); min-height: auto; }
  .login-context { min-height: 14rem; padding: 1.6rem; }
  .context-copy { margin: auto 0 0; }
  .context-copy h2 { max-width: 14ch; margin-bottom: 0.65rem; font-size: 2rem; }
  .context-copy > p,
  .context-copy ul,
  .context-note { display: none; }
  .login-panel { padding: 2.3rem 2rem 2.6rem; }
}

@media (max-width: 520px) {
  .login-page { padding: 0; background: var(--panel); }
  .login-shell { min-height: 100vh; border-radius: 0; box-shadow: none; }
  .login-context { display: none; }
  .login-brand-mobile { display: flex; }
  .login-panel { justify-content: flex-start; padding: 5rem 1.4rem 2rem; }
}
</style>
