import { cleanObject, numericId, text } from './payloadUtils.js'

export function schoolPayload(form = {}) {
  return cleanObject({
    name: text(form.name),
    address: text(form.address),
    contactName: text(form.contactName),
    contactPhone: text(form.contactPhone),
    logoFileId: numericId(form.logoFileId),
    description: text(form.description)
  })
}

export function schoolMatchesPayload(school = {}, payload = {}) {
  if (!payload.name || String(school.name ?? '') !== String(payload.name)) return false
  return Object.entries(payload).every(([key, value]) => String(school[key] ?? '') === String(value))
}

export function upsertSchoolRows(rows = [], savedSchool) {
  if (!savedSchool?.id) return rows
  const index = rows.findIndex(row => row.id === savedSchool.id)
  if (index === -1) return [savedSchool, ...rows]
  return rows.map((row, rowIndex) => (
    rowIndex === index ? { ...row, ...savedSchool } : row
  ))
}
