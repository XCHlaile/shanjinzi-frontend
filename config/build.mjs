function installedPackagePath(id) {
  const normalized = id.replaceAll('\\', '/')
  if (!normalized.includes('/node_modules/')) return ''
  return normalized.split('/node_modules/').at(-1)
}

export function splitVendorChunk(id) {
  const packagePath = installedPackagePath(id)
  if (!packagePath) return undefined

  if (
    packagePath.startsWith('vue/')
    || packagePath.startsWith('vue-router/')
    || packagePath.startsWith('@vue/')
  ) {
    return 'vue-vendor'
  }

  if (packagePath.startsWith('@stomp/')) return 'realtime'
  return undefined
}

export const maintainableBuild = {
  rollupOptions: {
    output: {
      manualChunks: splitVendorChunk
    }
  }
}
