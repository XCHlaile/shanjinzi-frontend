import { onBeforeUnmount, onMounted } from 'vue'

export function createLiveRefreshController(refresh, options = {}) {
  const interval = Number(options.interval) || 4000
  const pageDocument = options.document ?? (typeof document !== 'undefined' ? document : null)
  const pageWindow = options.window ?? (typeof window !== 'undefined' ? window : null)
  const setTimer = options.setTimer || setInterval
  const clearTimer = options.clearTimer || clearInterval
  let timer = null
  let running = false

  async function trigger() {
    if (pageDocument?.hidden || running) return false
    running = true
    try {
      await refresh()
      return true
    } catch {
      return false
    } finally {
      running = false
    }
  }

  function handleVisibilityChange() {
    if (!pageDocument?.hidden) void trigger()
  }

  function start() {
    if (timer !== null) return
    timer = setTimer(() => void trigger(), interval)
    pageDocument?.addEventListener('visibilitychange', handleVisibilityChange)
    pageWindow?.addEventListener('focus', trigger)
    pageWindow?.addEventListener('online', trigger)
  }

  function stop() {
    if (timer !== null) clearTimer(timer)
    timer = null
    pageDocument?.removeEventListener('visibilitychange', handleVisibilityChange)
    pageWindow?.removeEventListener('focus', trigger)
    pageWindow?.removeEventListener('online', trigger)
  }

  return { start, stop, trigger }
}

export function useLiveRefresh(refresh, options = {}) {
  const controller = createLiveRefreshController(refresh, options)
  onMounted(controller.start)
  onBeforeUnmount(controller.stop)
  return controller
}
