<template>
  <AuthLayout
    title="先创建家长账号，再绑定孩子"
    description="准备好园所、学生姓名与亲属关系信息，完成注册后即可进入孩子的专属成长空间。"
    image="/kechuang.webp"
    image-alt="孩子在科技课堂中动手实践"
    panel-label="家长账号注册"
    wide
  >
    <div class="auth-header">
      <div class="auth-brand">
        <span class="auth-logo"><img src="/logo.png" alt=""></span>
        <span>山巾子科技教育社区平台</span>
      </div>
      <h2>注册家长账号</h2>
      <p>请使用园方提供的信息完成学生绑定，带有必填标记的内容均需填写。</p>
    </div>

    <form class="auth-form" @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="register-phone">手机号</label>
        <input
          id="register-phone"
          v-model="form.phone"
          type="tel"
          inputmode="numeric"
          maxlength="11"
          autocomplete="tel"
          placeholder="请输入手机号"
          required
        >
      </div>

      <div class="form-group">
        <label for="register-code">验证码</label>
        <div class="code-row">
          <input
            id="register-code"
            v-model="form.smsCode"
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
            placeholder="请输入 6 位验证码"
            required
          >
          <button type="button" class="btn-code" :disabled="sending" @click="sendRegisterCode">
            {{ sending ? '发送中...' : '获取验证码' }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <label for="register-password">登录密码</label>
        <input
          id="register-password"
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          placeholder="请输入登录密码"
          required
        >
      </div>

      <div class="form-group">
        <label for="register-name">家长姓名</label>
        <input
          id="register-name"
          v-model="form.realName"
          autocomplete="name"
          placeholder="请输入真实姓名"
          required
        >
      </div>

      <div class="binding-box">
        <strong>学生绑定校验</strong>
        <p>学校、学生姓名和亲属关系需要与园方名册一致，绑定码可选。</p>
        <div class="form-group">
          <label for="register-school">学校</label>
          <select id="register-school" v-model.number="form.schoolId" :disabled="schoolsLoading || !schoolOptions.length" required>
            <option disabled value="">
              {{ schoolsLoading ? '正在加载学校...' : schoolLoadError ? '学校加载失败' : '请选择学校' }}
            </option>
            <option v-for="school in schoolOptions" :key="school.id" :value="school.id">
              {{ school.name }}
            </option>
          </select>
          <span v-if="schoolLoadError" class="field-error" role="alert">
            {{ schoolLoadError }}
            <button type="button" :disabled="schoolsLoading" @click="loadSchools">重新加载</button>
          </span>
        </div>
        <div class="form-group">
          <label for="register-student">学生姓名</label>
          <input id="register-student" v-model="form.studentName" placeholder="例如：林小满" required>
        </div>
        <div class="form-group">
          <label for="register-bind-code">绑定码（选填）</label>
          <input id="register-bind-code" v-model="form.bindCode" autocomplete="off" placeholder="有绑定码可填写，没有可留空">
        </div>
        <div class="form-group">
          <label for="register-relation">亲属关系</label>
          <select id="register-relation" v-model="form.relationType" required>
            <option v-for="option in relationOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <p v-if="msg" class="auth-msg" role="status">{{ msg }}</p>
      <p v-if="error" class="auth-error" role="alert">{{ error }}</p>
      <button type="submit" class="btn btn-primary btn-block" :disabled="loading" :aria-busy="loading">
        {{ loading ? '提交中...' : '提交注册' }}
      </button>
    </form>
    <p class="auth-switch">已有账号？<router-link to="/login">立即登录</router-link></p>
  </AuthLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'
import { useRegistration } from '@/features/registration/index.js'

const router = useRouter()
const route = useRoute()

const {
  error,
  form,
  handleRegister,
  loadSchools,
  loading,
  msg,
  relationOptions,
  schoolLoadError,
  schoolOptions,
  schoolsLoading,
  sendRegisterCode,
  sending
} = useRegistration({
  initialPhone: route.query.phone,
  afterRegister: () => router.push('/dashboard')
})

onMounted(loadSchools)
</script>
