import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const rootUrl = new URL('../', import.meta.url)
const sourceUrl = new URL('docs/api/openapi.json', rootUrl)
const operationsOutputUrl = new URL('packages/api-contracts/src/operations.generated.js', rootUrl)
const typesOutputUrl = new URL('packages/api-contracts/src/openapi.generated.d.ts', rootUrl)
const supportedMethods = new Set(['get', 'post', 'put', 'patch', 'delete'])

function collectOperations(openapi) {
  return Object.entries(openapi.paths || {})
    .flatMap(([path, pathItem]) => Object.entries(pathItem)
      .filter(([method]) => supportedMethods.has(method))
      .map(([method, operation]) => ({
        key: `${method.toUpperCase()} ${path}`,
        method: method.toUpperCase(),
        path,
        operation,
        pathParameters: pathItem.parameters || []
      })))
    .sort((left, right) => left.key < right.key ? -1 : left.key > right.key ? 1 : 0)
}

function renderOperations(keys) {
  const values = keys.map(key => `  ${JSON.stringify(key)}`).join(',\n')
  return `// Generated from docs/api/openapi.json. Do not edit by hand.\nexport const API_OPERATION_KEYS = Object.freeze([\n${values}\n])\n`
}

function schemaType(schema) {
  if (!schema || typeof schema !== 'object') return 'unknown'
  if ('$ref' in schema) {
    const name = schema.$ref.split('/').pop()
    return `OpenApiSchemas[${JSON.stringify(name)}]`
  }
  if ('const' in schema) return JSON.stringify(schema.const)
  if (Array.isArray(schema.enum) && schema.enum.length) {
    return schema.enum.map(value => JSON.stringify(value)).join(' | ')
  }
  if (schema.allOf) return schema.allOf.map(schemaType).join(' & ')
  if (schema.oneOf) return schema.oneOf.map(schemaType).join(' | ')
  if (schema.anyOf) return schema.anyOf.map(schemaType).join(' | ')

  let result
  if (schema.type === 'array') {
    result = `Array<${schemaType(schema.items)}>`
  } else if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
    const required = new Set(schema.required || [])
    const properties = Object.entries(schema.properties || {}).map(([name, property]) => (
      `    ${JSON.stringify(name)}${required.has(name) ? '' : '?'}: ${schemaType(property)}`
    ))
    if (schema.additionalProperties) {
      properties.push(`    [key: string]: ${schema.additionalProperties === true ? 'unknown' : schemaType(schema.additionalProperties)}`)
    }
    result = properties.length ? `{\n${properties.join('\n')}\n  }` : 'Record<string, unknown>'
  } else if (schema.type === 'integer' || schema.type === 'number') {
    result = 'number'
  } else if (schema.type === 'boolean') {
    result = 'boolean'
  } else if (schema.type === 'null') {
    result = 'null'
  } else if (Array.isArray(schema.type)) {
    result = schema.type.map(type => schemaType({ ...schema, type })).join(' | ')
  } else if (schema.type === 'string') {
    result = 'string'
  } else {
    result = 'unknown'
  }
  return schema.nullable && result !== 'null' ? `${result} | null` : result
}

function resolveReference(openapi, value) {
  if (!value?.$ref) return value
  return value.$ref.split('/').slice(1).reduce((current, segment) => current?.[segment], openapi)
}

function contentSchema(content = {}) {
  return content['application/json']?.schema || Object.values(content)[0]?.schema
}

function parameterGroup(openapi, parameters, location) {
  const selected = parameters
    .map(parameter => resolveReference(openapi, parameter))
    .filter(parameter => parameter?.in === location)
  if (!selected.length) return 'Record<string, never>'
  const fields = selected.map(parameter => (
    `      ${JSON.stringify(parameter.name)}${parameter.required ? '' : '?'}: ${schemaType(parameter.schema)}`
  ))
  return `{\n${fields.join('\n')}\n    }`
}

function operationResponseType(openapi, operation) {
  const responses = Object.entries(operation.responses || {})
    .filter(([status]) => /^2\d\d$/.test(status) || status === 'default')
    .sort(([left], [right]) => left.localeCompare(right))
  const response = resolveReference(openapi, responses[0]?.[1])
  if (!response || responses[0]?.[0] === '204') return 'void'
  return schemaType(contentSchema(response.content))
}

function renderTypes(openapi, operations) {
  const schemas = Object.entries(openapi.components?.schemas || {})
    .map(([name, schema]) => `  ${JSON.stringify(name)}: ${schemaType(schema)}`)
    .join('\n')
  const operationTypes = operations.map(({ key, operation, pathParameters }) => {
    const parameters = [...pathParameters, ...(operation.parameters || [])]
    const requestBodyDefinition = resolveReference(openapi, operation.requestBody)
    const requestSchema = contentSchema(requestBodyDefinition?.content)
    const requestBody = requestSchema
      ? `${schemaType(requestSchema)}${requestBodyDefinition.required ? '' : ' | undefined'}`
      : 'never'
    return `  ${JSON.stringify(key)}: {\n    parameters: {\n      path: ${parameterGroup(openapi, parameters, 'path')}\n      query: ${parameterGroup(openapi, parameters, 'query')}\n      header: ${parameterGroup(openapi, parameters, 'header')}\n    }\n    requestBody: ${requestBody}\n    response: ${operationResponseType(openapi, operation)}\n  }`
  }).join('\n')

  return `// Generated from docs/api/openapi.json. Do not edit by hand.\nexport interface OpenApiSchemas {\n${schemas}\n}\n\nexport interface OpenApiOperations {\n${operationTypes}\n}\n\nexport type OpenApiSchemaName = keyof OpenApiSchemas\nexport type OpenApiOperationKey = keyof OpenApiOperations\nexport type OpenApiSchema<Name extends OpenApiSchemaName> = OpenApiSchemas[Name]\nexport type OpenApiOperation<Key extends OpenApiOperationKey> = OpenApiOperations[Key]\n`
}

const openapi = JSON.parse(await readFile(sourceUrl, 'utf8'))
const operations = collectOperations(openapi)
const outputs = [
  [operationsOutputUrl, renderOperations(operations.map(operation => operation.key))],
  [typesOutputUrl, renderTypes(openapi, operations)]
]
const checkOnly = process.argv.includes('--check')

if (checkOnly) {
  const staleFiles = []
  for (const [outputUrl, output] of outputs) {
    const current = await readFile(outputUrl, 'utf8').catch(() => '')
    if (current !== output) staleFiles.push(fileURLToPath(outputUrl))
  }
  if (staleFiles.length) {
    throw new Error(`Generated API contracts are stale: ${staleFiles.join(', ')}. Run: pnpm generate:api`)
  }
  console.log(`API contracts are current (${operations.length} operations, ${Object.keys(openapi.components?.schemas || {}).length} schemas).`)
} else {
  for (const [outputUrl, output] of outputs) await writeFile(outputUrl, output, 'utf8')
  console.log(`Generated ${operations.length} API operations and ${Object.keys(openapi.components?.schemas || {}).length} schemas.`)
}
