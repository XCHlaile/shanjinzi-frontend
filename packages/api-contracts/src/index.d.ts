export type * from './openapi.generated.js'

export const API_OPERATION_KEYS: readonly string[]

export interface ApiContract {
  readonly method: string
  readonly path: string
}

export function operationKey(method: string, path: string): string
export function hasApiOperation(method: string, path: string): boolean
export function defineApiContract(method: string, path: string): ApiContract
export function validateApiContractMap<T>(contractMap: T, prefix?: string): T
