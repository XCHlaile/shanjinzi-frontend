export function saveBrowserFile(
  result,
  fallbackFilename,
  options = {}
) {
  if (!result?.blob) throw new Error('下载文件内容缺失')

  const urlApi = options.urlApi || globalThis.URL
  const documentRef = options.documentRef || globalThis.document
  const filename = result.filename || fallbackFilename
  const objectUrl = urlApi.createObjectURL(result.blob)
  const anchor = documentRef.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  documentRef.body.appendChild(anchor)

  try {
    anchor.click()
  } finally {
    anchor.remove()
    urlApi.revokeObjectURL(objectUrl)
  }

  return filename
}
