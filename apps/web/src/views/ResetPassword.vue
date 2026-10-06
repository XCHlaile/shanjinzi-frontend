<template>
  <AuthLayout
    title="验证手机号，安全找回账号"
    description="完成短信验证后设置新密码，即可回到平台继续查看孩子的成长记录。"
    image="/xinpianzhang.webp"
    image-alt="孩子在户外自在奔跑"
    panel-label="找回账号密码"
  >
    <div class="auth-header">
      <div class="auth-brand">
        <span class="auth-logo"><img src="/logo.png" alt=""></span>
        <span>山巾子科技教育社区平台</span>
      </div>
      <h2>找回密码</h2>
      <p>验证注册手机号后，设置新的登录密码。</p>
    </div>

    <form class="auth-form" @submit.prevent="submitPasswordReset">
      <div class="form-group">
        <label for="reset-phone">手机号</label>
        <input
          id="reset-phone"
          v-model.trim="form.phone"
          type="tel"
          inputmode="numeric"
          maxlength="11"
          autocomplete="tel"
          placeholder="请输入手机号"
          required
        >
      </div>
      <div class="form-group">
        <label for="reset-code">短信验证码</label>
        <div class="code-row">
          <input
            id="reset-code"
            v-model.trim="form.smsCode"
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
            placeholder="请输入 6 位验证码"
            required
          >
          <button type="button" class="btn-code" :disabled="sending || countdown > 0" @click="sendResetCode">
            {{ countdown > 0 ? `${countdown}s` : sending ? '发送中...' : '获取验证码' }}
          </button>
        </div>
      </div>
      <div class="form-group">
        <label for="reset-password">新密码</label>
        <input
          id="reset-password"
          v-model="form.newPassword"
          type="password"
          minlength="6"
          maxlength="72"
          autocomplete="new-password"
          placeholder="请输入 6-72 位新密码"
          required
        >
      </div>
      <div class="form-group">
        <label for="reset-confirm-password">确认新密码</label>
        <input
          id="reset-confirm-password"
          v-model="form.confirmPassword"
          type="password"
          minlength="6"
          maxlength="72"
          autocomplete="new-password"
          placeholder="请再次输入新密码"
          required
        >
      </div>

      <p v-if="error" class="auth-error" role="alert">{{ error }}</p>
      <p v-if="message" class="auth-msg" role="status">{{ message }}</p>
      <button type="submit" class="btn btn-primary btn-block" :disabled="loading" :aria-busy="loading">
        {{ loading ? '重置中...' : '确认重置密码' }}
      </button>
    </form>

    <p class="auth-switch"><router-link to="/login">返回登录</router-link></p>
  </AuthLayout>
</template>

<script setup>
import { onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'
import { usePasswordReset } from '@/features/authentication/index.js'

const route = useRoute()
const router = useRouter()
const {
  countdown,
  error,
  form,
  loading,
  message,
  sending,
  sendResetCode,
  stopCountdown,
  submitPasswordReset
} = usePasswordReset({
  initialPhone: typeof route.query.phone === 'string' ? route.query.phone : '',
  afterReset: () => router.replace({
    path: '/login',
    query: { passwordReset: 'success' }
  })
})

onBeforeUnmount(stopCountdown)
</script>
