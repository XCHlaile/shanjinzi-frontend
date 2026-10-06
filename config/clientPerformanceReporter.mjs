export const CLIENT_PERFORMANCE_EVENT = 'sjz:performance-metric'

function cleanText(value, maxLength = 500) {
  return String(value ?? '').trim().slice(0, maxLength)
}

function finiteValue(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? Math.max(0, numeric) : null
}

export function normalizeMetricPath(value = '/') {
  let pathname = cleanText(value) || '/'
  try {
    pathname = new URL(pathname, 'https://metrics.invalid').pathname
  } catch {
    pathname = pathname.split(/[?#]/, 1)[0] || '/'
  }
  return pathname
    .split('/')
    .map(segment => {
      if (!segment) return segment
      if (/^\d+$/.test(segment)) return ':id'
      if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(segment)) return ':id'
      if (/^[A-Za-z0-9_-]{24,}$/.test(segment)) return ':id'
      return segment.slice(0, 80)
    })
    .join('/') || '/'
}

export function performanceRating(name, value) {
  const metric = String(name || '').toUpperCase()
  const numeric = finiteValue(value)
  if (numeric === null) return ''
  const thresholds = {
    LCP: [2500, 4000],
    INP: [200, 500],
    CLS: [0.1, 0.25]
  }[metric]
  if (!thresholds) return ''
  if (numeric <= thresholds[0]) return 'good'
  if (numeric > thresholds[1]) return 'poor'
  return 'needs-improvement'
}

export function normalizePerformanceMetric(metric = {}, fallbackRoute = '/') {
  const value = finiteValue(metric.value)
  if (!cleanText(metric.name, 100) || value === null) return null
  const context = metric.context && typeof metric.context === 'object'
    ? {
        method: cleanText(metric.context.method, 10).toUpperCase(),
        outcome: ['success', 'error'].includes(metric.context.outcome) ? metric.context.outcome : '',
        path: metric.context.path ? normalizeMetricPath(metric.context.path) : '',
        status: Number(metric.context.status) || 0
      }
    : {}
  return {
    name: cleanText(metric.name, 100),
    value,
    unit: cleanText(metric.unit, 20),
    rating: cleanText(metric.rating, 30) || performanceRating(metric.name, value),
    route: normalizeMetricPath(metric.route || fallbackRoute),
    context
  }
}

export function emitClientPerformanceMetric(eventTarget, metric) {
  if (
    typeof eventTarget?.addEventListener !== 'function'
    || typeof eventTarget?.dispatchEvent !== 'function'
    || typeof globalThis.CustomEvent !== 'function'
  ) return false
  eventTarget.dispatchEvent(new CustomEvent(CLIENT_PERFORMANCE_EVENT, { detail: metric }))
  return true
}

export function createClientPerformanceReporter({
  endpoint = '',
  release = '',
  fetchImpl = globalThis.fetch,
  beaconImpl = globalThis.navigator?.sendBeacon?.bind(globalThis.navigator),
  pageLocation = globalThis.location,
  now = () => new Date().toISOString(),
  batchSize = 20
} = {}) {
  const reportUrl = cleanText(endpoint)
  const metrics = []

  function record(metric) {
    const normalized = normalizePerformanceMetric(metric, pageLocation?.pathname || '/')
    if (!normalized) return null
    metrics.push(normalized)
    if (metrics.length >= Math.max(1, Number(batchSize) || 20)) flush('batch')
    return normalized
  }

  function flush(reason = 'manual') {
    if (!metrics.length) return null
    const batch = metrics.splice(0, metrics.length)
    const apiMetrics = batch.filter(metric => metric.name === 'api.duration')
    if (apiMetrics.length) {
      const failed = apiMetrics.filter(metric => metric.context.outcome === 'error').length
      batch.push(normalizePerformanceMetric({
        name: 'api.error_rate',
        value: failed / apiMetrics.length,
        unit: 'ratio',
        route: pageLocation?.pathname || '/',
        context: { outcome: failed ? 'error' : 'success' }
      }))
    }
    const envelope = {
      source: 'web',
      occurredAt: now(),
      release: cleanText(release, 200),
      reason: cleanText(reason, 50),
      metrics: batch.filter(Boolean)
    }

    if (reportUrl) {
      const body = JSON.stringify(envelope)
      const sent = typeof beaconImpl === 'function' && beaconImpl(reportUrl, body)
      if (!sent && typeof fetchImpl === 'function') {
        void Promise.resolve(fetchImpl(reportUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          credentials: 'omit',
          keepalive: true
        })).catch(() => undefined)
      }
    }
    return envelope
  }

  return {
    flush,
    record,
    snapshot: () => metrics.map(metric => ({ ...metric, context: { ...metric.context } }))
  }
}

export function installBrowserPerformanceReporting({
  environment = {},
  browserWindow = globalThis.window,
  performanceApi = globalThis.performance,
  observerClass = globalThis.PerformanceObserver,
  fetchImpl = globalThis.fetch
} = {}) {
  if (!browserWindow) return null
  const reporter = createClientPerformanceReporter({
    endpoint: environment.VITE_PERFORMANCE_REPORT_URL,
    release: environment.VITE_APP_RELEASE,
    fetchImpl,
    pageLocation: browserWindow.location
  })
  const observers = []
  let cls = 0
  let clsSession = 0
  let clsSessionStart = 0
  let clsLastEntry = 0
  let inp = 0
  let lcp = 0
  let reportedCls = -1
  let reportedInp = -1
  let reportedLcp = -1

  function observe(type, callback, options = { type, buffered: true }) {
    if (typeof observerClass !== 'function') return
    try {
      const observer = new observerClass(list => callback(list.getEntries()))
      observer.observe(options)
      observers.push(observer)
    } catch {}
  }

  observe('largest-contentful-paint', entries => {
    const latest = entries.at(-1)
    if (latest) lcp = Math.max(lcp, latest.startTime || latest.renderTime || latest.loadTime || 0)
  })
  observe('layout-shift', entries => {
    for (const entry of entries) {
      if (entry.hadRecentInput) continue
      const timestamp = entry.startTime || 0
      if (timestamp - clsLastEntry > 1000 || timestamp - clsSessionStart > 5000) {
        clsSession = 0
        clsSessionStart = timestamp
      }
      clsSession += entry.value || 0
      clsLastEntry = timestamp
      cls = Math.max(cls, clsSession)
    }
  })
  observe('event', entries => {
    for (const entry of entries) inp = Math.max(inp, entry.duration || 0)
  }, { type: 'event', buffered: true, durationThreshold: 40 })
  observe('paint', entries => {
    const firstContentfulPaint = entries.find(entry => entry.name === 'first-contentful-paint')
    if (firstContentfulPaint) reporter.record({
      name: 'FCP',
      value: firstContentfulPaint.startTime,
      unit: 'ms'
    })
  })

  const navigation = performanceApi?.getEntriesByType?.('navigation')?.[0]
  if (navigation) {
    reporter.record({ name: 'navigation.duration', value: navigation.duration, unit: 'ms' })
    reporter.record({ name: 'TTFB', value: navigation.responseStart, unit: 'ms' })
  }

  function reportFinalMetrics() {
    if (lcp && lcp !== reportedLcp) {
      reporter.record({ name: 'LCP', value: lcp, unit: 'ms' })
      reportedLcp = lcp
    }
    if (inp && inp !== reportedInp) {
      reporter.record({ name: 'INP', value: inp, unit: 'ms' })
      reportedInp = inp
    }
    if (cls !== reportedCls) {
      reporter.record({ name: 'CLS', value: cls, unit: 'score' })
      reportedCls = cls
    }
  }

  const handleMetric = event => reporter.record(event.detail)
  const handleVisibility = () => {
    if (browserWindow.document?.visibilityState !== 'hidden') return
    reportFinalMetrics()
    reporter.flush('hidden')
  }
  const handlePageHide = () => {
    reportFinalMetrics()
    reporter.flush('pagehide')
  }
  browserWindow.addEventListener(CLIENT_PERFORMANCE_EVENT, handleMetric)
  browserWindow.document?.addEventListener?.('visibilitychange', handleVisibility)
  browserWindow.addEventListener('pagehide', handlePageHide)
  browserWindow.__SJZ_PERFORMANCE__ = reporter

  return {
    ...reporter,
    cleanup() {
      observers.forEach(observer => observer.disconnect())
      browserWindow.removeEventListener(CLIENT_PERFORMANCE_EVENT, handleMetric)
      browserWindow.document?.removeEventListener?.('visibilitychange', handleVisibility)
      browserWindow.removeEventListener('pagehide', handlePageHide)
      if (browserWindow.__SJZ_PERFORMANCE__ === reporter) delete browserWindow.__SJZ_PERFORMANCE__
    }
  }
}
