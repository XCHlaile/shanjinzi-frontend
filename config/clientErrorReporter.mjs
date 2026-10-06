function text(value, maxLength = 2000) {
  return String(value ?? '').trim().slice(0, maxLength)
}

export function createClientErrorReporter({
  endpoint = '',
  release = '',
  fetchImpl = globalThis.fetch,
  diagnostic = (...args) => globalThis.console?.error?.(...args),
  pageLocation = globalThis.location,
  now = () => new Date().toISOString()
} = {}) {
  const reportUrl = text(endpoint, 500)

  return function reportClientError(error, context = {}) {
    const normalized = error instanceof Error ? error : new Error(text(error) || 'Unknown client error')
    const event = {
      source: 'web',
      occurredAt: now(),
      release: text(release, 200),
      route: text(pageLocation?.pathname || '/', 500),
      name: text(normalized.name, 100) || 'Error',
      message: text(normalized.message),
      stack: text(normalized.stack, 8000),
      traceId: text(normalized.traceId, 200),
      context: {
        kind: text(context.kind, 100),
        info: text(context.info, 500)
      }
    }

    if (reportUrl && typeof fetchImpl === 'function') {
      void Promise.resolve(fetchImpl(reportUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        credentials: 'omit',
        keepalive: true
      })).catch(() => undefined)
    } else if (typeof diagnostic === 'function') {
      diagnostic('[client-error]', event)
    }

    return event
  }
}

export function installBrowserErrorReporting(app, {
  environment = {},
  browserWindow = globalThis.window,
  fetchImpl = globalThis.fetch
} = {}) {
  const reporter = createClientErrorReporter({
    endpoint: environment.VITE_ERROR_REPORT_URL,
    release: environment.VITE_APP_RELEASE,
    fetchImpl,
    pageLocation: browserWindow?.location
  })

  app.config.errorHandler = (error, _instance, info) => {
    reporter(error, { kind: 'vue', info })
  }
  browserWindow?.addEventListener?.('error', event => {
    reporter(event.error || event.message, { kind: 'window' })
  })
  browserWindow?.addEventListener?.('unhandledrejection', event => {
    reporter(event.reason, { kind: 'unhandledrejection' })
  })
  return reporter
}
