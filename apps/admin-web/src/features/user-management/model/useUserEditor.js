import { reactive, ref } from 'vue'

import {
  changedUserUpdatePayload,
  normalizeAdminUser,
  upsertUserRows,
  userCreatePayload,
  userMatchesPayload,
  userRolePayload,
  userSchoolPayload,
  userUpdatePayload
} from '../../../api/payloads/userPayloads.js'
import {
  emptyUserForm,
  userForm,
  userPageItems
} from '../lib/userManagementViewModel.js'

export function useUserEditor({
  api,
  feedback,
  handleAdminActionError,
  rows
}) {
  const saving = ref(false)
  const dialogVisible = ref(false)
  const editingId = ref(null)
  const editingOriginal = ref(null)
  const form = reactive(emptyUserForm())

  function openCreate() {
    editingId.value = null
    editingOriginal.value = null
    Object.assign(form, emptyUserForm())
    dialogVisible.value = true
  }

  function openEdit(row) {
    const user = normalizeAdminUser(row)
    editingId.value = user.id
    editingOriginal.value = user
    Object.assign(form, userForm(user))
    dialogVisible.value = true
  }

  function userDesiredPayload() {
    return editingId.value
      ? { ...userUpdatePayload(form), ...userRolePayload(form), ...userSchoolPayload(form) }
      : userCreatePayload(form)
  }

  async function findUserByPhone(phone) {
    if (!phone) return null
    const payload = await api.fetchUsers({ page: 1, pageSize: 100, phone })
    return userPageItems(payload)
      .map(normalizeAdminUser)
      .find(user => String(user.phone || '') === String(phone)) || null
  }

  async function recoverSavedUser(
    desiredPayload,
    userId,
    existingUserBeforeCreate = null
  ) {
    try {
      if (userId) {
        const user = await api.fetchUser(userId)
        return userMatchesPayload(user, desiredPayload) ? normalizeAdminUser(user) : null
      }
      if (existingUserBeforeCreate) return null
      const user = await findUserByPhone(desiredPayload.phone)
      return user && String(user.phone || '') === String(desiredPayload.phone)
        ? user
        : null
    } catch {
      return null
    }
  }

  async function saveUser() {
    if (!form.phone.trim()) {
      feedback.error('请输入手机号')
      return false
    }
    if (!form.realName.trim()) {
      feedback.error('请输入姓名')
      return false
    }

    const desiredPayload = userDesiredPayload()
    let existingUserBeforeCreate = null
    saving.value = true
    try {
      let savedUser
      if (editingId.value) {
        const updatePayload = changedUserUpdatePayload(form, editingOriginal.value)
        savedUser = Object.keys(updatePayload).length
          ? await api.updateUser(editingId.value, updatePayload)
          : editingOriginal.value

        const rolePayload = userRolePayload(form)
        if (
          rolePayload.roleCode
          && rolePayload.roleCode !== editingOriginal.value?.roleCode
        ) {
          savedUser = await api.updateUserRole(editingId.value, rolePayload)
        }

        const schoolPayload = userSchoolPayload(form)
        if (
          schoolPayload.schoolId
          && String(schoolPayload.schoolId) !== String(editingOriginal.value?.schoolId ?? '')
        ) {
          savedUser = await api.updateUserSchool(editingId.value, schoolPayload)
        }
      } else {
        existingUserBeforeCreate = await findUserByPhone(desiredPayload.phone)
        savedUser = existingUserBeforeCreate
          && userMatchesPayload(existingUserBeforeCreate, desiredPayload)
          ? existingUserBeforeCreate
          : await api.createUser(userCreatePayload(form))
      }

      rows.value = upsertUserRows(rows.value, savedUser)
      feedback.success('用户已保存')
      dialogVisible.value = false
      return true
    } catch (error) {
      if (handleAdminActionError(error)) return false
      const savedUser = await recoverSavedUser(
        desiredPayload,
        editingId.value,
        existingUserBeforeCreate
      )
      if (savedUser) {
        rows.value = upsertUserRows(rows.value, savedUser)
        feedback.success('用户已保存')
        dialogVisible.value = false
        return true
      }
      feedback.error(error?.message || '用户保存失败')
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    dialogVisible,
    editingId,
    editingOriginal,
    findUserByPhone,
    form,
    openCreate,
    openEdit,
    recoverSavedUser,
    saveUser,
    saving,
    userDesiredPayload
  }
}
