// Pure record presentation shared by student administration features.
const genderLabels = {
  MALE: '男',
  FEMALE: '女',
  M: '男',
  F: '女'
}

const enrollmentStatusLabels = {
  ENROLLED: '在读',
  GRADUATED: '毕业',
  TRANSFERRED: '转学',
  SUSPENDED: '休学',
  WITHDRAWN: '退学'
}

const relationLabels = {
  MOTHER: '母亲',
  FATHER: '父亲',
  GRANDFATHER_PATERNAL: '爷爷',
  GRANDMOTHER_PATERNAL: '奶奶',
  GRANDFATHER_MATERNAL: '外公',
  GRANDMOTHER_MATERNAL: '外婆'
}

const classStatusLabels = {
  ACTIVE: '启用',
  DISABLED: '停用',
  DELETED: '已删除'
}

export function pageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function pageTotal(payload, items = pageItems(payload)) {
  if (Array.isArray(payload)) return payload.length
  return Number(payload?.total ?? payload?.totalElements ?? items.length) || 0
}

export function genderLabel(value) {
  return genderLabels[value] || value || '-'
}

export function enrollmentStatusLabel(value) {
  return enrollmentStatusLabels[value] || value || '-'
}

export function studentStatusLabel(value) {
  return value === 'ACTIVE' ? '启用' : value === 'DISABLED' ? '禁用' : value || '-'
}

export function relationLabel(value) {
  return relationLabels[value] || value || '-'
}

export function classStatusLabel(value) {
  return classStatusLabels[value] || value || '-'
}

export function detailClassNames(detail) {
  const names = (detail?.classes || []).map(item => item.className).filter(Boolean)
  return names.length ? names.join('、') : '-'
}

export function shortDate(value) {
  return value ? String(value).replace('T', ' ').slice(0, 19) : '-'
}
