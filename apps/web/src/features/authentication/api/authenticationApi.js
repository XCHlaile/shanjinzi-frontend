import { validateApiContractMap } from '@shanjinzi/api-contracts'

import { normalizeGuardianRelationType } from '../../../entities/student/index.js'
import { cleanObject, numericId } from '../../../shared/api/requestUtils.js'
import { httpClient } from '../../../shared/api/httpClient.js'

export const authenticationContracts = validateApiContractMap({
  health: {
    check: { method: 'GET', path: '/api/health' }
  },
  auth: {
    sendSmsCode: { method: 'POST', path: '/api/public/auth/sms-codes' },
    passwordLogin: { method: 'POST', path: '/api/public/auth/login' },
    smsLogin: { method: 'POST', path: '/api/public/auth/sms-login' },
    register: { method: 'POST', path: '/api/public/auth/register' },
    refresh: { method: 'POST', path: '/api/public/auth/refresh' },
    logout: { method: 'POST', path: '/api/public/auth/logout' },
    resetPassword: { method: 'POST', path: '/api/public/auth/password/reset' }
  },
  me: {
    current: { method: 'GET', path: '/api/app/me' },
    profile: { method: 'GET', path: '/api/app/me/profile' },
    updateProfile: { method: 'PUT', path: '/api/app/me/profile' },
    changePassword: { method: 'PUT', path: '/api/app/me/password' }
  },
  home: {
    summary: { method: 'GET', path: '/api/app/home/summary' }
  },
  teacherWorkbench: {
    summary: { method: 'GET', path: '/api/app/teacher-workbench/summary' }
  }
}, 'authenticationContracts')

function smsCodePayload(data = {}, defaultScene = 'LOGIN') {
  return {
    phone: data.phone,
    scene: data.scene || defaultScene
  }
}

function smsLoginPayload(data = {}) {
  return {
    phone: data.phone,
    smsCode: data.smsCode || data.code
  }
}

function registerPayload(data = {}) {
  return cleanObject({
    phone: data.phone,
    smsCode: data.smsCode || data.code,
    password: data.password,
    realName: data.realName || data.nickname || data.name,
    schoolId: numericId(data.schoolId),
    studentName: data.studentName || data.childName,
    studentNo: data.studentNo,
    birthday: data.birthday,
    bindCode: data.bindCode || data.bindingCode,
    relationType: normalizeGuardianRelationType(data.relationType || data.relation)
  })
}

function resetPasswordPayload(data = {}) {
  return {
    phone: data.phone,
    smsCode: data.smsCode || data.code,
    newPassword: data.newPassword || data.password
  }
}

export function createAuthenticationApi(transport = httpClient) {
  const sendSMSCode = data => (
    transport.post(authenticationContracts.auth.sendSmsCode.path, smsCodePayload(data))
  )

  return Object.freeze({
    checkHealth: () => transport.get(authenticationContracts.health.check.path),
    sendSMSCode,
    sendSmsCode: sendSMSCode,
    passwordLogin: data => transport.post(authenticationContracts.auth.passwordLogin.path, data),
    phoneLogin: data => (
      transport.post(authenticationContracts.auth.smsLogin.path, smsLoginPayload(data))
    ),
    smsLogin: data => (
      transport.post(authenticationContracts.auth.smsLogin.path, smsLoginPayload(data))
    ),
    registerUser: data => (
      transport.post(authenticationContracts.auth.register.path, registerPayload(data))
    ),
    refreshLogin: refreshToken => (
      transport.post(authenticationContracts.auth.refresh.path, { refreshToken })
    ),
    logoutUser: refreshToken => (
      transport.post(authenticationContracts.auth.logout.path, { refreshToken })
    ),
    resetPassword: data => (
      transport.post(authenticationContracts.auth.resetPassword.path, resetPasswordPayload(data))
    ),
    fetchProfile: () => transport.get(authenticationContracts.me.current.path),
    fetchAccountProfile: () => transport.get(authenticationContracts.me.profile.path),
    updateProfile: data => transport.put(authenticationContracts.me.updateProfile.path, data),
    changePassword: data => transport.put(authenticationContracts.me.changePassword.path, data),
    fetchHomeSummary: () => transport.get(authenticationContracts.home.summary.path),
    fetchTeacherWorkbenchSummary: () => (
      transport.get(authenticationContracts.teacherWorkbench.summary.path)
    )
  })
}

export const authenticationApi = createAuthenticationApi()
