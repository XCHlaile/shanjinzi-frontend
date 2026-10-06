export function fillPath(path, params = {}) {
  return path.replace(/\{([^}]+)\}/g, (_, key) => encodeURIComponent(params[key] ?? ''))
}

export function pageParams(params = {}) {
  return { page: 1, pageSize: 10, ...params }
}

export function numericId(value) {
  const number = Number(value)
  return Number.isNaN(number) ? value : number
}

export function cleanObject(input) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
}
