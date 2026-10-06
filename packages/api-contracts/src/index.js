import { API_OPERATION_KEYS } from './operations.generated.js'

const operationSet = new Set(API_OPERATION_KEYS)

export { API_OPERATION_KEYS }

export function operationKey(method, path) {
  return `${String(method || '').toUpperCase()} ${String(path || '')}`
}

export function hasApiOperation(method, path) {
  return operationSet.has(operationKey(method, path))
}

export function defineApiContract(method, path) {
  const normalizedMethod = String(method || '').toUpperCase()
  const key = operationKey(normalizedMethod, path)
  if (!operationSet.has(key)) {
    throw new Error(`OpenAPI operation is not declared: ${key}`)
  }
  return Object.freeze({ method: normalizedMethod, path })
}

export function validateApiContractMap(contractMap, prefix = 'apiContracts') {
  for (const [name, value] of Object.entries(contractMap || {})) {
    const location = `${prefix}.${name}`
    if (!value || typeof value !== 'object') continue

    if ('method' in value || 'path' in value) {
      if (!value.method || !value.path) {
        throw new Error(`Incomplete API contract at ${location}`)
      }
      if (!hasApiOperation(value.method, value.path)) {
        throw new Error(`OpenAPI operation is not declared at ${location}: ${operationKey(value.method, value.path)}`)
      }
      continue
    }

    validateApiContractMap(value, location)
  }
  return contractMap
}
