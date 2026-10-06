import { cleanObject, numericId, text } from './payloadUtils.js'

export function classCreatePayload(form = {}) {
  return cleanObject({
    name: text(form.name),
    gradeName: text(form.gradeName),
    sortOrder: numericId(form.sortOrder),
    schoolId: numericId(form.schoolId)
  })
}

export function classUpdatePayload(form = {}) {
  return cleanObject({
    name: text(form.name),
    gradeName: text(form.gradeName),
    sortOrder: numericId(form.sortOrder)
  })
}

export function classTeachersPayload(teacherIds = []) {
  return {
    teacherIds: [...new Set(
      teacherIds
        .map(numericId)
        .filter(value => typeof value === 'number' && Number.isFinite(value))
    )]
  }
}

export function upsertClassRows(rows = [], savedClass) {
  if (!savedClass?.id) return rows
  const index = rows.findIndex(row => row.id === savedClass.id)
  if (index === -1) return [savedClass, ...rows]
  return rows.map((row, rowIndex) => (
    rowIndex === index ? { ...row, ...savedClass } : row
  ))
}
