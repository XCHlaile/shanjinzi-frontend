<template>
  <AuthLayout
    title="一个账号，连接园所与家庭"
    description="查看孩子的课堂记录、接收园所通知并参与赛事，让重要的成长信息有序汇聚。"
    image="/platform-hero.webp"
    image-alt="家长陪伴孩子进行科技探索"
    panel-label="家长账号登录"
  >
    <div class="auth-header">
      <div class="auth-brand">
        <span class="auth-logo"><img src="/logo.png" alt=""></span>
        <span>山巾子科技教育社区平台</span>
      </div>
      <h2>{{ loginMode === 'code' ? '手机验证码登录' : '密码登录' }}</h2>
      <p>{{ loginMode === 'code' ? '无需记忆密码，使用手机验证码即可登录。' : '使用注册手机号与密码登录家长账号。' }}</p>
    </div>

    <form v-if="loginMode === 'code'" class="auth-form" @submit.prevent="handleCodeLogin">
      <div class="form-group">
        <label for="login-phone-code">手机号</label>
        <input
          id="login-phone-code"
          v-model="phone"
          type="tel"
          inputmode="numeric"
          maxlength="11"
          autocomplete="tel"
          placeholder="请输入手机号"
          required
        >
      </div>
      <div class="form-group">
        <label for="login-code">验证码</label>
        <div class="code-row">
          <input
            id="login-code"
            v-model="code"
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
            placeholder="请输入 6 位验证码"
            required
          >
          <button type="button" class="btn-code" :disabled="sending || countdown > 0" @click="sendCode">
            {{ countdown > 0 ? countdown + 's' : sending ? '发送中...' : '获取验证码' }}
          </button>
        </div>
      </div>
      <p v-if="error" class="auth-error" role="alert">{{ error }}</p>
      <p v-if="msg" class="auth-msg" role="status">{{ msg }}</p>
      <button type="submit" class="btn btn-primary btn-block" :disabled="loading" :aria-busy="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <button type="button" class="btn btn-outline btn-block mode-switch" @click="loginMode = 'password'">使用密码登录</button>
    </form>

    <form v-else class="auth-form" @submit.prevent="handlePasswordLogin">
      <div class="form-group">
        <label for="login-phone-password">手机号</label>
        <input
          id="login-phone-password"
          v-model="phone"
          type="tel"
          inputmode="numeric"
          maxlength="11"
          autocomplete="tel"
          placeholder="请输入手机号"
          required
        >
      </div>
      <div class="form-group">
        <label for="login-password">密码</label>
        <input
          id="login-password"
          v-model="pwd"
          type="password"
          autocomplete="current-password"
          placeholder="请输入密码"
          required
        >
      </div>
      <p v-if="error" class="auth-error" role="alert">{{ error }}</p>
      <button type="submit" class="btn btn-primary btn-block" :disabled="loading" :aria-busy="loading">
        {{ loading ? '登录中...' : '密码登录' }}
      </button>
      <button type="button" class="btn btn-outline btn-block mode-switch" @click="loginMode = 'code'">使用验证码登录</button>
    </form>

    <div class="auth-switch auth-switch-split">
      <router-link :to="{ path: '/reset-password', query: phone ? { phone } : {} }">忘记密码</router-link>
      <span>还没有账号？<router-link to="/register">立即注册</router-link></span>
    </div>
    <a class="admin-login-link" :href="adminLoginUrl">前往超级管理员后台</a>
  </AuthLayout>
</template>

<script setup>
import { onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'
import { resolveAdminWebUrl } from '../../../../config/network.mjs'
import { useLogin } from '@/features/authentication/index.js'

const router = useRouter()
const route = useRoute()
const adminLoginUrl = `${resolveAdminWebUrl(import.meta.env)}/login`
const {
  code,
  countdown,
  error,
  handleCodeLogin,
  handlePasswordLogin,
  loading,
  loginMode,
  msg,
  phone,
  pwd,
  sendCode,
  sending,
  stopCountdown
} = useLogin({
  initialMessage: route.query.passwordReset === 'success'
    ? '密码已重置，请使用新密码登录'
    : '',
  afterLogin: () => router.push(route.query.redirect || '/dashboard'),
  afterUnregistered: phoneNumber => router.push({
    path: '/register',
    query: { phone: phoneNumber, verified: '1' }
  })
})

onBeforeUnmount(stopCountdown)
</script>
