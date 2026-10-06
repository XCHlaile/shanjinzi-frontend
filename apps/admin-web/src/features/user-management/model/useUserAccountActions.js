export function useUserAccountActions({
  api,
  dialogs,
  feedback,
  loadData,
  reportActionError
}) {
  async function setDisabled(row) {
    try {
      await api.disableUser(row.id)
      feedback.success('用户已禁用')
      await loadData()
      return true
    } catch (error) {
      reportActionError(error, '用户禁用失败')
      return false
    }
  }

  async function setEnabled(row) {
    try {
      await api.enableUser(row.id)
      feedback.success('用户已启用')
      await loadData()
      return true
    } catch (error) {
      reportActionError(error, '用户启用失败')
      return false
    }
  }

  async function resetPassword(row) {
    try {
      const result = await api.resetUserPassword(row.id)
      const temporaryPassword = typeof result === 'string'
        ? result
        : result?.temporaryPassword
      await dialogs.alert(
        `临时密码：${temporaryPassword || '-'}`,
        '密码已重置'
      )
      return true
    } catch (error) {
      reportActionError(error, '密码重置失败')
      return false
    }
  }

  async function removeUser(row) {
    try {
      await dialogs.confirm(
        `确认删除用户 ${row.phone}？`,
        '删除用户',
        { type: 'warning' }
      )
    } catch {
      return false
    }

    try {
      await api.deleteUser(row.id)
      feedback.success('用户已删除')
      await loadData()
      return true
    } catch (error) {
      reportActionError(error, '用户删除失败')
      return false
    }
  }

  return {
    removeUser,
    resetPassword,
    setDisabled,
    setEnabled
  }
}
