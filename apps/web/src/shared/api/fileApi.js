import { validateApiContractMap } from '@shanjinzi/api-contracts'

import { httpClient } from './httpClient.js'

export const fileContracts = validateApiContractMap({
  files: {
    upload: { method: 'POST', path: '/api/app/files' }
  }
}, 'fileContracts')

function uploadPath(sourceType = 'moment') {
  return `${fileContracts.files.upload.path}?sourceType=${encodeURIComponent(sourceType)}`
}

function uploadForm(data) {
  if (typeof FormData === 'undefined') throw new Error('FormData is not available')
  if (data instanceof FormData) return data
  const file = data?.file || data
  const formData = new FormData()
  formData.append('file', file)
  return formData
}

export function createFileApi(transport = httpClient) {
  return Object.freeze({
    uploadFile(data, options = {}) {
      const sourceType = String(
        data?.sourceType || options.sourceType || 'moment'
      ).toLowerCase()
      return transport.post(uploadPath(sourceType), uploadForm(data))
    }
  })
}

export const fileApi = createFileApi()
