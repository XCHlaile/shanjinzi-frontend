export function adminPageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function normalizeAdminPage(row = {}) {
  return {
    ...row,
    route: row.route || row.pageKey,
    markdown: row.markdown || row.contentMarkdown || ''
  }
}

export function emptyAdminPageForm() {
  return {
    route: '',
    title: '',
    markdown: '',
    contentHtml: '',
    status: 'DRAFT'
  }
}

export function adminPageForm(row = {}) {
  const normalized = normalizeAdminPage(row)
  return {
    route: normalized.route || '',
    title: normalized.title || '',
    markdown: normalized.markdown || '',
    contentHtml: normalized.contentHtml || '',
    status: normalized.status || 'DRAFT'
  }
}

export function adminPagePayload(form, { includeKey = false } = {}) {
  const payload = {
    title: form.title,
    contentMarkdown: form.markdown,
    contentHtml: form.contentHtml || ''
  }
  if (includeKey) payload.pageKey = form.route
  return payload
}

export function matchesAdminPage(row, { keyword = '', status = '' } = {}) {
  const query = keyword.trim()
  const matchesKeyword = !query || [row.route, row.title]
    .some(value => String(value || '').includes(query))
  const matchesStatus = !status || row.status === status
  return matchesKeyword && matchesStatus
}

export function shortAdminPageDate(value) {
  return value ? String(value).replace('T', ' ').slice(0, 19) : ''
}
