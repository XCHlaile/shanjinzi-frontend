import { cleanObject, numericId, text } from './payloadUtils.js'

function roleFromUser(user = {}) {
  return user.role || user.roleCode || user.roles?.[0] || ''
}

export function normalizeAdminUser(user = {}) {
  const role = roleFromUser(user)
  return {
    ...user,
    role,
    roleCode: role,
    displayName: user.realName || user.nickname || user.phone || ''
  }
}

export function userCreatePayload(form = {}) {
  return cleanObject({
    phone: text(form.phone),
    realName: text(form.realName),
    roleCode: text(form.roleCode || form.role),
    schoolId: numericId(form.schoolId),
    nickname: text(form.nickname),
    gender: text(form.gender)
  })
}

export function userUpdatePayload(form = {}) {
  return cleanObject({
    phone: text(form.phone),
    realName: text(form.realName),
    nickname: text(form.nickname),
    gender: text(form.gender),
    avatarFileId: numericId(form.avatarFileId)
  })
}

export function changedUserUpdatePayload(form = {}, original = {}) {
  return Object.fromEntries(
    Object.entries(userUpdatePayload(form)).filter(([key, value]) => String(original?.[key] ?? '') !== String(value))
  )
}

export function userRolePayload(form = {}) {
  return cleanObject({ roleCode: text(form.roleCode || form.role) })
}

export function userSchoolPayload(form = {}) {
  return cleanObject({ schoolId: numericId(form.schoolId) })
}

export function teacherClassesPayload(classIds = []) {
  return {
    classIds: [...new Set(
      classIds
        .map(numericId)
        .filter(value => typeof value === 'number' && Number.isFinite(value))
    )]
  }
}

export function userMatchesPayload(user = {}, payload = {}) {
  const normalized = normalizeAdminUser(user)
  return Object.entries(payload).every(([key, value]) => String(normalized[key] ?? '') === String(value))
}

export function upsertUserRows(rows = [], savedUser) {
  if (!savedUser?.id) return rows
  const normalized = normalizeAdminUser(savedUser)
  const index = rows.findIndex(row => row.id === normalized.id)
  if (index === -1) return [normalized, ...rows]
  return rows.map((row, rowIndex) => (
    rowIndex === index ? normalizeAdminUser({ ...row, ...normalized }) : row
  ))
}
