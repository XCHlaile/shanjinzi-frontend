const NETWORK_CODES = new Set(['NETWORK_ERROR', 'ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'])

function numericStatus(error) {
  const candidates = [error?.status, error?.statusCode, error?.response?.status, error?.code]
  for (const candidate of candidates) {
    const value = Number(candidate)
    if (Number.isInteger(value) && value >= 100 && value <= 599) return value
  }
  return 0
}

function rawMessage(error) {
  if (typeof error === 'string') return error.trim()
  return String(error?.message || error?.msg || '').trim()
}

function looksLikeNetworkFailure(error, message) {
  if (error instanceof TypeError) return true
  if (NETWORK_CODES.has(String(error?.code || '').toUpperCase())) return true
  return /failed to fetch|network(?:error| request failed)|网络连接失败/i.test(message)
}

function looksLikeTimeout(error, message) {
  if (String(error?.name || '') === 'TimeoutError') return true
  return /timeout|timed out|请求超时/i.test(message)
}

const statesByStatus = Object.freeze({
  400: ['validation', '提交内容需要检查', false],
  401: ['unauthorized', '登录状态已失效', false],
  403: ['forbidden', '当前账号没有权限', false],
  404: ['not-found', '内容不存在或已被移除', false],
  408: ['timeout', '请求超时', true],
  409: ['conflict', '数据已发生变化', true],
  422: ['validation', '提交内容需要检查', false],
  429: ['rate-limit', '操作过于频繁', true]
})

export function normalizeErrorState(error, {
  fallback = '暂时无法完成此操作',
  networkOnline = typeof navigator === 'undefined' ? true : navigator.onLine !== false
} = {}) {
  if (!error) return null
  const status = numericStatus(error)
  const message = rawMessage(error)
  const isTimeout = looksLikeTimeout(error, message)
  const isNetwork = !networkOnline || looksLikeNetworkFailure(error, message)

  if (String(error?.name || '') === 'AbortError') {
    return { kind: 'cancelled', title: '请求已取消', message: '', hint: '', retryable: false, status }
  }
  if (isTimeout) {
    return {
      kind: 'timeout',
      title: '请求超时',
      message: '服务器响应时间较长，本次请求已停止。',
      hint: '请确认网络稳定后重新加载。',
      retryable: true,
      status: status || 408
    }
  }
  if (isNetwork) {
    return {
      kind: 'network',
      title: networkOnline ? '网络连接异常' : '当前设备已离线',
      message: networkOnline ? '未能连接到服务，请检查网络后重试。' : '恢复网络连接后即可继续。',
      hint: '',
      retryable: true,
      status
    }
  }

  const statusState = statesByStatus[status]
    || (status >= 500 ? ['server', '服务暂时不可用', true] : null)
  const [kind, title, retryable] = statusState || ['unknown', '暂时无法完成', true]
  const defaultMessage = ({
    unauthorized: '请重新登录后继续。',
    forbidden: '当前角色无法访问或操作这项内容。',
    'not-found': '请返回上一页或刷新列表后重试。',
    conflict: '请重新加载最新数据后再操作。',
    'rate-limit': '请稍候片刻再试。',
    server: '服务端暂时没有完成请求，请稍后重试。',
    validation: '请检查输入内容后再次提交。'
  })[kind] || fallback

  return {
    kind,
    title,
    message: message || defaultMessage,
    hint: retryable && kind === 'unknown' ? '若问题持续，请稍后再试。' : '',
    retryable,
    status
  }
}

export function userErrorMessage(error, fallback) {
  return normalizeErrorState(error, { fallback })?.message || fallback
}

export function attachErrorState(error) {
  if (!error || typeof error !== 'object') return error
  const state = normalizeErrorState(error)
  error.kind ||= state?.kind || 'unknown'
  error.retryable ??= Boolean(state?.retryable)
  return error
}
