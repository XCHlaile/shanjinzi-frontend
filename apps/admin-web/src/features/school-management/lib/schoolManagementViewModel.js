export const SCHOOL_STATUS_LABELS = {
  ACTIVE: '合作中',
  DISABLED: '停用'
}

export function schoolStatusLabel(value) {
  return SCHOOL_STATUS_LABELS[value] || value || '-'
}

export function schoolPageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function emptySchoolForm() {
  return {
    name: '',
    contactName: '',
    contactPhone: '',
    address: '',
    description: ''
  }
}

export function schoolForm(row = {}) {
  return {
    name: row.name || '',
    contactName: row.contactName || '',
    contactPhone: row.contactPhone || '',
    address: row.address || '',
    description: row.description || ''
  }
}

export function matchesSchool(row, { keyword = '', status = '' } = {}) {
  const query = keyword.trim()
  const matchesKeyword = !query || [row.name, row.contactName, row.contactPhone]
    .some(value => String(value || '').includes(query))
  const matchesStatus = !status || row.status === status
  return matchesKeyword && matchesStatus
}

export function schoolExportFilter({ keyword = '', status = '' } = {}) {
  return {
    ...(keyword.trim() ? { keyword: keyword.trim() } : {}),
    ...(status ? { status } : {})
  }
}

export function schoolDirectoryQuery({
  keyword = '',
  contactName = '',
  status = ''
} = {}, {
  page = 1,
  pageSize = 20
} = {}) {
  return {
    ...(keyword.trim() ? { name: keyword.trim() } : {}),
    ...(contactName.trim() ? { contactName: contactName.trim() } : {}),
    ...(status ? { status } : {}),
    page,
    pageSize
  }
}

export function shortSchoolDate(value) {
  return value ? String(value).replace('T', ' ').slice(0, 19) : ''
}
