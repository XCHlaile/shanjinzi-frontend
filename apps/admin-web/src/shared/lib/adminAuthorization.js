export function handleAdminAuthorizationError(error, {
  feedback,
  onUnauthorized = () => {}
} = {}) {
  if (error?.status === 401) {
    feedback?.error?.('登录已过期，请重新登录')
    onUnauthorized()
    return true
  }
  if (error?.status === 403) {
    feedback?.error?.('当前账号无权执行此操作')
    return true
  }
  return false
}
