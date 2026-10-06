import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  API_OPERATION_KEYS,
  defineApiContract,
  hasApiOperation,
  validateApiContractMap
} from './index.js'

const openapi = JSON.parse(
  readFileSync(new URL('../../../docs/api/openapi.json', import.meta.url), 'utf8')
)

function openApiOperationKeys(document) {
  const methods = new Set(['get', 'post', 'put', 'patch', 'delete'])
  return Object.entries(document.paths || {})
    .flatMap(([path, pathItem]) => Object.keys(pathItem)
      .filter(method => methods.has(method))
      .map(method => `${method.toUpperCase()} ${path}`))
    .sort()
}

test('generated operations exactly match the canonical OpenAPI document', () => {
  assert.deepEqual(API_OPERATION_KEYS, openApiOperationKeys(openapi))
})

test('defines and validates only documented contracts', () => {
  assert.deepEqual(
    defineApiContract('get', '/api/health'),
    { method: 'GET', path: '/api/health' }
  )
  assert.equal(hasApiOperation('POST', '/api/public/auth/login'), true)
  assert.throws(
    () => defineApiContract('GET', '/api/not-documented'),
    /OpenAPI operation is not declared/
  )
  assert.throws(
    () => validateApiContractMap({ invalid: { method: 'GET', path: '/api/not-documented' } }),
    /apiContracts.invalid/
  )
})
