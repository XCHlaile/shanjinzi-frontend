import { ref } from 'vue'

export function useStudentDetailActions({
  api,
  dialogs,
  feedback,
  loadGuardianSummary,
  loadStudents
}) {
  const detailDialogVisible = ref(false)
  const studentDetail = ref(null)

  async function openDetail(row) {
    try {
      const [detail, guardianSummary] = await Promise.all([
        api.fetchStudent(row.id),
        loadGuardianSummary(row)
      ])
      studentDetail.value = {
        ...detail,
        phoneNum: detail.phoneNumber || detail.phoneNum || row.phoneNum || '',
        guardianCount: guardianSummary.guardianCount
      }
      detailDialogVisible.value = true
      return true
    } catch (error) {
      feedback.error(error?.message || '学生详情加载失败')
      return false
    }
  }

  async function toggleStudentStatus(row) {
    const enabling = row.status !== 'ACTIVE'
    try {
      await dialogs.confirm(
        `确定${enabling ? '启用' : '禁用'}学生“${row.name}”吗？`,
        `${enabling ? '启用' : '禁用'}学生`,
        { type: 'warning' }
      )
    } catch {
      return false
    }

    try {
      if (enabling) await api.enableStudent(row.id)
      else await api.disableStudent(row.id)
      feedback.success(`学生已${enabling ? '启用' : '禁用'}`)
      await loadStudents({ refreshDetails: true })
      return true
    } catch (error) {
      feedback.error(error?.message || '学生状态更新失败')
      return false
    }
  }

  return {
    detailDialogVisible,
    openDetail,
    studentDetail,
    toggleStudentStatus
  }
}
