import { normalizeCompetition } from '../../../api/payloads/competitionPayloads.js'

export const COMPETITION_SCOPE_LABELS = {
  PLATFORM: '平台赛事',
  SCHOOL: '学校赛事'
}

export const COMPETITION_STATUS_LABELS = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  OFFLINE: '已下线',
  CANCELLED: '已取消'
}

export function competitionScopeLabel(value) {
  return COMPETITION_SCOPE_LABELS[value] || value || '-'
}

export function competitionStatusLabel(value) {
  return COMPETITION_STATUS_LABELS[value] || value || '-'
}

export function competitionPageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function normalizeCompetitionPage(payload) {
  return competitionPageItems(payload).map(normalizeCompetition)
}

export function competitionSchoolOptions(payload) {
  return competitionPageItems(payload)
    .filter(school => school.status === 'ACTIVE')
    .map(school => ({
      value: school.id,
      label: school.name
    }))
    .filter(option => option.value && option.label)
}

export function emptyCompetitionForm() {
  return {
    title: '',
    scopeType: 'PLATFORM',
    schoolId: '',
    coverFileId: '',
    summary: '',
    content: '',
    infoUrl: '',
    location: '',
    competitionStartAt: '',
    competitionEndAt: '',
    registrationStartAt: '',
    registrationEndAt: '',
    maxParticipants: 1
  }
}

export function competitionForm(competition = {}) {
  return {
    title: competition.title || '',
    scopeType: competition.scopeType || 'PLATFORM',
    schoolId: competition.schoolId || '',
    coverFileId: competition.coverFileId || '',
    summary: competition.summary || '',
    content: competition.content || '',
    infoUrl: competition.infoUrl || '',
    location: competition.location || '',
    competitionStartAt: competitionDatePickerValue(competition.competitionStartAt),
    competitionEndAt: competitionDatePickerValue(competition.competitionEndAt),
    registrationStartAt: competitionDatePickerValue(competition.registrationStartAt),
    registrationEndAt: competitionDatePickerValue(competition.registrationEndAt),
    maxParticipants: competition.maxParticipants || 1
  }
}

export function matchesCompetition(row, { keyword = '', status = '' } = {}) {
  const query = keyword.trim()
  const matchesKeyword = !query || [row.title, row.summary, row.location]
    .some(value => String(value || '').includes(query))
  const matchesStatus = !status || row.status === status
  return matchesKeyword && matchesStatus
}

export function competitionListParams(keyword = '') {
  return {
    page: 1,
    pageSize: 100,
    keyword: keyword.trim()
  }
}

export function competitionExportFilter({
  keyword = '',
  status = ''
} = {}) {
  return {
    keyword: keyword.trim(),
    status
  }
}

export function registrationDialogTitle(competition) {
  return competition?.title
    ? `报名明细 - ${competition.title}`
    : '报名明细'
}

export function registrationStudentName(row = {}) {
  return row.studentName || row.student?.name || '-'
}

export function registrationClassName(row = {}) {
  return row.className
    || row.studentClassName
    || row.student?.className
    || row.class?.name
    || '-'
}

export function registrationGuardianName(row = {}) {
  return row.guardianName
    || row.parentName
    || row.guardian?.name
    || row.parent?.name
    || '-'
}

export function registrationGuardianPhone(row = {}) {
  return row.guardianPhone
    || row.parentPhone
    || row.guardian?.phone
    || row.parent?.phone
    || '-'
}

export function competitionDeleteErrorMessage(error, row) {
  if (
    row.status === 'OFFLINE'
    && String(error?.message || '').includes('仅草稿状态')
  ) {
    return '后端当前未开放下线赛事删除，前端无法完成删除'
  }
  return error?.message || '赛事删除失败'
}

export function isCompetitionDialogCancel(error) {
  return error === 'cancel'
    || error === 'close'
    || error?.action === 'cancel'
    || error?.action === 'close'
}

export function shortCompetitionDate(value) {
  return value ? String(value).replace('T', ' ').slice(0, 19) : ''
}

export function competitionDatePickerValue(value) {
  return value ? String(value).replace(' ', 'T').slice(0, 19) : ''
}
