import {
  competitionInfoUrlPayload,
  normalizeCompetition,
  upsertCompetitionRows
} from '../../../api/payloads/competitionPayloads.js'
import {
  competitionDeleteErrorMessage,
  isCompetitionDialogCancel
} from '../lib/competitionManagementViewModel.js'

export function useCompetitionActions({
  api,
  dialogs,
  feedback,
  rows,
  selectedRow
}) {
  async function recoverCompetitionStatus(row, expectedStatus) {
    try {
      const competition = normalizeCompetition(
        await api.fetchCompetition(row.id)
      )
      return competition.status === expectedStatus ? competition : null
    } catch {
      return null
    }
  }

  async function changeCompetitionStatus({
    row,
    confirmMessage,
    confirmTitle,
    action,
    expectedStatus,
    successMessage,
    errorMessage
  }) {
    try {
      await dialogs.confirm(confirmMessage, confirmTitle, { type: 'warning' })
      const savedCompetition = await action(row.id)
      rows.value = upsertCompetitionRows(rows.value, savedCompetition)
      feedback.success(successMessage)
      return true
    } catch (error) {
      if (isCompetitionDialogCancel(error)) return false
      const savedCompetition = await recoverCompetitionStatus(row, expectedStatus)
      if (savedCompetition) {
        rows.value = upsertCompetitionRows(rows.value, savedCompetition)
        feedback.success(successMessage)
        return true
      }
      feedback.error(error?.message || errorMessage)
      return false
    }
  }

  function publishCompetition(row) {
    return changeCompetitionStatus({
      row,
      confirmMessage: `确认发布赛事 ${row.title}？`,
      confirmTitle: '发布赛事',
      action: api.publishCompetition,
      expectedStatus: 'PUBLISHED',
      successMessage: '赛事已发布',
      errorMessage: '赛事发布失败'
    })
  }

  function offlineCompetition(row) {
    return changeCompetitionStatus({
      row,
      confirmMessage: `确认下线赛事 ${row.title}？`,
      confirmTitle: '下线赛事',
      action: api.offlineCompetition,
      expectedStatus: 'OFFLINE',
      successMessage: '赛事已下线',
      errorMessage: '赛事下线失败'
    })
  }

  async function setInfoUrl(row) {
    try {
      const { value } = await dialogs.prompt(
        '请输入赛事信息链接',
        '设置信息链接',
        {
          inputValue: row.infoUrl || '',
          inputPlaceholder: 'https://example.com'
        }
      )
      const savedCompetition = await api.updateCompetitionInfoUrl(
        row.id,
        competitionInfoUrlPayload({ infoUrl: value })
      )
      rows.value = upsertCompetitionRows(rows.value, savedCompetition)
      feedback.success('信息链接已更新')
      return true
    } catch (error) {
      if (!isCompetitionDialogCancel(error)) {
        feedback.error(error?.message || '信息链接更新失败')
      }
      return false
    }
  }

  async function removeCompetition(row) {
    if (row.status !== 'OFFLINE') {
      feedback.error('只有下线赛事可以删除')
      return false
    }
    try {
      await dialogs.confirm(
        `确认删除赛事 ${row.title}？`,
        '删除赛事',
        { type: 'warning' }
      )
      await api.deleteCompetition(row.id)
      rows.value = rows.value.filter(item => item.id !== row.id)
      if (selectedRow.value?.id === row.id) selectedRow.value = null
      feedback.success('赛事已删除')
      return true
    } catch (error) {
      if (!isCompetitionDialogCancel(error)) {
        feedback.error(competitionDeleteErrorMessage(error, row))
      }
      return false
    }
  }

  return {
    offlineCompetition,
    publishCompetition,
    recoverCompetitionStatus,
    removeCompetition,
    setInfoUrl
  }
}
