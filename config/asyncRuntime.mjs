export function createLatestRequestGuard() {
  let version = 0
  return {
    begin() {
      version += 1
      const current = version
      return {
        isCurrent: () => current === version,
        commit(callback) {
          if (current !== version) return false
          callback()
          return true
        }
      }
    },
    invalidate() {
      version += 1
    }
  }
}

export async function mapWithConcurrency(items, worker, concurrency = 6) {
  const source = Array.from(items || [])
  if (!source.length) return []
  const results = new Array(source.length)
  const limit = Math.max(1, Math.min(source.length, Number(concurrency) || 1))
  let nextIndex = 0

  async function runWorker() {
    while (nextIndex < source.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await worker(source[index], index)
    }
  }

  await Promise.all(Array.from({ length: limit }, runWorker))
  return results
}

export function createRequestDeduper() {
  const pending = new Map()
  return function dedupe(key, request) {
    if (!key) return request()
    if (pending.has(key)) return pending.get(key)
    const promise = Promise.resolve().then(request).finally(() => pending.delete(key))
    pending.set(key, promise)
    return promise
  }
}

export function createTtlCache({
  ttlMs = 60_000,
  maxEntries = 200,
  now = () => Date.now()
} = {}) {
  const values = new Map()
  const pending = new Map()
  const keyVersions = new Map()
  const lifetime = Math.max(0, Number(ttlMs) || 0)
  const limit = Math.max(1, Number(maxEntries) || 1)
  let generation = 0

  function get(key) {
    const cached = values.get(key)
    if (!cached) return undefined
    if (cached.expiresAt <= now()) {
      values.delete(key)
      return undefined
    }
    values.delete(key)
    values.set(key, cached)
    return cached.value
  }

  function set(key, value) {
    values.delete(key)
    values.set(key, { value, expiresAt: now() + lifetime })
    while (values.size > limit) values.delete(values.keys().next().value)
    return value
  }

  function getOrLoad(key, loader) {
    const cached = get(key)
    if (cached !== undefined) return Promise.resolve(cached)
    if (pending.has(key)) return pending.get(key)
    const requestGeneration = generation
    const requestKeyVersion = keyVersions.get(key) || 0
    const request = Promise.resolve()
      .then(loader)
      .then(value => (
        generation === requestGeneration
        && (keyVersions.get(key) || 0) === requestKeyVersion
          ? set(key, value)
          : value
      ))
      .finally(() => pending.delete(key))
    pending.set(key, request)
    return request
  }

  return {
    clear() {
      generation += 1
      values.clear()
      pending.clear()
      keyVersions.clear()
    },
    delete(key) {
      pending.delete(key)
      keyVersions.set(key, (keyVersions.get(key) || 0) + 1)
      return values.delete(key)
    },
    get,
    getOrLoad,
    set
  }
}

export function createTimeoutSignal(timeoutMs, externalSignal) {
  const controller = new AbortController()
  const duration = Math.max(0, Number(timeoutMs) || 0)
  let timedOut = false
  let timer = null

  const abortFromExternalSignal = () => controller.abort(externalSignal?.reason)
  if (externalSignal?.aborted) abortFromExternalSignal()
  else externalSignal?.addEventListener?.('abort', abortFromExternalSignal, { once: true })

  if (duration > 0) {
    timer = setTimeout(() => {
      timedOut = true
      controller.abort(new DOMException('Request timed out', 'TimeoutError'))
    }, duration)
  }

  return {
    signal: controller.signal,
    didTimeout: () => timedOut,
    cleanup() {
      if (timer) clearTimeout(timer)
      externalSignal?.removeEventListener?.('abort', abortFromExternalSignal)
    }
  }
}
