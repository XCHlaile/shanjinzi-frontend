export function fillAdminPath(path, params = {}) {
  return path.replace(/\{([^}]+)\}/g, (_, key) => encodeURIComponent(params[key] ?? ''))
}

export function cleanObject(input = {}) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
}

export function pageQuery(params = {}) {
  return cleanObject({ page: 1, pageSize: 20, ...params })
}

export function numericId(value) {
  if (value === undefined || value === null || value === '') return value
  const parsed = Number(value)
  return Number.isNaN(parsed) ? value : parsed
}
