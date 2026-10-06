import { cleanObject, numericId, text } from './payloadUtils.js'

export function normalizeCompetition(competition = {}) {
  return {
    ...competition,
    title: competition.title || competition.name || '',
    registeredCount: competition.registeredCount ?? competition.registrationCount ?? 0,
    maxParticipants: competition.maxParticipants ?? 0,
    scopeType: competition.scopeType || competition.scope || ''
  }
}

function comparableCompetitionValue(key, value) {
  const normalized = String(value ?? '')
  return key.endsWith('At') ? normalized.replace('T', ' ').slice(0, 19) : normalized
}

export function competitionMatchesPayload(competition = {}, payload = {}) {
  const normalized = normalizeCompetition(competition)
  if (!payload.title || String(normalized.title ?? '') !== String(payload.title)) return false
  return Object.entries(payload).every(([key, value]) => (
    comparableCompetitionValue(key, normalized[key]) === comparableCompetitionValue(key, value)
  ))
}

export function competitionPayload(form = {}) {
  return cleanObject({
    title: text(form.title),
    schoolId: text(form.scopeType) === 'SCHOOL' ? numericId(form.schoolId) : undefined,
    scopeType: text(form.scopeType),
    coverFileId: numericId(form.coverFileId),
    summary: text(form.summary),
    content: text(form.content),
    infoUrl: text(form.infoUrl),
    location: text(form.location),
    competitionStartAt: text(form.competitionStartAt),
    competitionEndAt: text(form.competitionEndAt),
    registrationStartAt: text(form.registrationStartAt),
    registrationEndAt: text(form.registrationEndAt),
    maxParticipants: numericId(form.maxParticipants)
  })
}

export function competitionInfoUrlPayload(form = {}) {
  return cleanObject({ infoUrl: text(form.infoUrl) })
}

export function upsertCompetitionRows(rows = [], savedCompetition) {
  if (!savedCompetition?.id) return rows
  const normalized = normalizeCompetition(savedCompetition)
  const index = rows.findIndex(row => row.id === normalized.id)
  if (index === -1) return [normalized, ...rows]
  return rows.map((row, rowIndex) => (
    rowIndex === index ? normalizeCompetition({ ...row, ...normalized }) : row
  ))
}
