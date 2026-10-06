export function cleanObject(input) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
}

export function numericId(value) {
  if (value === undefined || value === null || value === '') return undefined
  const number = Number(value)
  return Number.isNaN(number) ? value : number
}

export function text(value) {
  return typeof value === 'string' ? value.trim() : value
}
