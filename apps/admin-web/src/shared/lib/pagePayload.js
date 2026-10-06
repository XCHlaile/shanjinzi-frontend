export function pageItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.records || []
}

export function pageTotal(payload, items = pageItems(payload)) {
  const total = Number(payload?.total ?? payload?.totalElements)
  return Number.isFinite(total) && total >= 0 ? total : items.length
}

export function pageCount(payload, {
  pageSize = 20,
  total = pageTotal(payload)
} = {}) {
  const explicit = Number(payload?.totalPages)
  if (Number.isFinite(explicit) && explicit >= 0) return explicit
  const normalizedPageSize = Math.max(1, Number(pageSize) || 20)
  return Math.ceil(Math.max(0, Number(total) || 0) / normalizedPageSize)
}
