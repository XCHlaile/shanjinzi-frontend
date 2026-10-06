import { reactive, ref } from 'vue'

import {
  competitionMatchesPayload,
  competitionPayload,
  normalizeCompetition,
  upsertCompetitionRows
} from '../../../api/payloads/competitionPayloads.js'
import {
  competitionForm,
  competitionPageItems,
  competitionSchoolOptions,
  emptyCompetitionForm
} from '../lib/competitionManagementViewModel.js'

export function useCompetitionEditor({
  api,
  feedback,
  rows
}) {
  const saving = ref(false)
  const dialogVisible = ref(false)
  const editingId = ref(null)
  const scopeOptionsLoading = ref(false)
  const schoolScopeOptions = ref([])
  const form = reactive(emptyCompetitionForm())

  function handleScopeTypeChange(scopeType) {
    if (scopeType !== 'SCHOOL') form.schoolId = ''
  }

  async function loadScopeOptions() {
    scopeOptionsLoading.value = true
    try {
      schoolScopeOptions.value = competitionSchoolOptions(
        await api.fetchSchools({
          status: 'ACTIVE',
          page: 1,
          pageSize: 100
        })
      )
      return true
    } catch (error) {
      schoolScopeOptions.value = []
      feedback.error(error?.message || '赛事范围加载失败')
      return false
    } finally {
      scopeOptionsLoading.value = false
    }
  }

  function resetForm() {
    Object.assign(form, emptyCompetitionForm())
  }

  function openCreate() {
    editingId.value = null
    resetForm()
    dialogVisible.value = true
  }

  function openEdit(row) {
    const competition = normalizeCompetition(row)
    editingId.value = competition.id
    Object.assign(form, competitionForm(competition))
    dialogVisible.value = true
  }

  async function recoverCompetitionFromCandidates(payload, candidates = []) {
    for (const candidate of candidates) {
      if (
        !candidate?.id
        || String(candidate.title || '') !== String(payload.title || '')
      ) {
        continue
      }
      try {
        const competition = await api.fetchCompetition(candidate.id)
        if (competitionMatchesPayload(competition, payload)) {
          return normalizeCompetition(competition)
        }
      } catch {
        // Recovery checks every matching title before surfacing the save error.
      }
    }
    return null
  }

  async function recoverSavedCompetition(payload, competitionId) {
    try {
      if (competitionId) {
        const competition = await api.fetchCompetition(competitionId)
        return competitionMatchesPayload(competition, payload)
          ? normalizeCompetition(competition)
          : null
      }
      const candidates = competitionPageItems(await api.fetchCompetitions({
        page: 1,
        pageSize: 100,
        keyword: payload.title
      }))
      return recoverCompetitionFromCandidates(payload, candidates)
    } catch {
      return null
    }
  }

  async function saveCompetition() {
    if (!form.title.trim()) {
      feedback.error('请填写赛事名称')
      return false
    }
    if (form.scopeType === 'SCHOOL' && !form.schoolId) {
      feedback.error('请选择学校赛事范围')
      return false
    }
    if (!form.registrationEndAt.trim()) {
      feedback.error('请填写报名截止时间')
      return false
    }

    const payload = competitionPayload(form)
    saving.value = true
    try {
      const savedCompetition = editingId.value
        ? await api.updateCompetition(editingId.value, payload)
        : await api.createCompetition(payload)
      rows.value = upsertCompetitionRows(rows.value, savedCompetition)
      feedback.success('赛事已保存')
      dialogVisible.value = false
      return true
    } catch (error) {
      const savedCompetition = await recoverSavedCompetition(
        payload,
        editingId.value
      )
      if (savedCompetition) {
        rows.value = upsertCompetitionRows(rows.value, savedCompetition)
        feedback.success('赛事已保存')
        dialogVisible.value = false
        return true
      }
      feedback.error(error?.message || '赛事保存失败')
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    dialogVisible,
    editingId,
    form,
    handleScopeTypeChange,
    loadScopeOptions,
    openCreate,
    openEdit,
    recoverCompetitionFromCandidates,
    recoverSavedCompetition,
    resetForm,
    saveCompetition,
    saving,
    schoolScopeOptions,
    scopeOptionsLoading
  }
}
