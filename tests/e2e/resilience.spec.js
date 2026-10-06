import { expect, test } from '@playwright/test'

const success = data => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ code: 'SUCCESS', data })
})

async function mockParentSession(page) {
  await page.addInitScript(() => {
    localStorage.setItem('sjz_user_access_token', 'e2e-parent-token')
    localStorage.setItem('sjz_user_refresh_token', 'e2e-parent-refresh')
    localStorage.setItem('sjz_current_user', JSON.stringify({
      id: 12,
      role: 'parent',
      roles: ['PARENT'],
      realName: '测试家长'
    }))
  })
}

async function mockNewsSupportRequests(page) {
  await page.route('**/api/**', async route => {
    const pathname = new URL(route.request().url()).pathname
    if (pathname === '/api/public/news-articles/categories') {
      await route.fulfill(success({ items: [] }))
      return
    }
    if (pathname !== '/api/public/news-articles') {
      await route.fulfill(success({}))
      return
    }
    await route.fallback()
  })
}

test('a temporary server failure renders a retryable state and recovers in place', async ({ page }) => {
  await mockParentSession(page)
  let attempts = 0
  await page.route('**/api/public/news-articles?**', async route => {
    attempts += 1
    if (attempts === 1) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ code: 503, message: '资讯服务正在恢复' })
      })
      return
    }
    await route.fulfill(success({
      items: [{ id: 8, title: '恢复后的新闻', summary: '服务已经恢复' }],
      total: 1,
      totalPages: 1
    }))
  })
  await mockNewsSupportRequests(page)

  await page.goto('/news')
  await expect(page.getByRole('alert')).toContainText('服务暂时不可用')
  await page.getByRole('button', { name: '重新加载' }).click()
  await expect(page.getByRole('heading', { level: 3, name: '恢复后的新闻' })).toBeVisible()
  expect(attempts).toBe(2)
})

test('a slow response is stopped by the client timeout and can be retried', async ({ page }) => {
  await mockParentSession(page)
  let attempts = 0
  await page.route('**/api/public/news-articles?**', async route => {
    attempts += 1
    if (attempts === 1) {
      await new Promise(resolve => setTimeout(resolve, 650))
      await route.fulfill(success({ items: [], total: 0, totalPages: 0 })).catch(() => undefined)
      return
    }
    await route.fulfill(success({ items: [], total: 0, totalPages: 0 }))
  })
  await mockNewsSupportRequests(page)

  await page.goto('/news')
  await expect(page.getByRole('alert')).toContainText('请求超时')
  await page.getByRole('button', { name: '重新加载' }).click()
  await expect(page.getByText('暂无已发布新闻资讯')).toBeVisible()
  expect(attempts).toBe(2)
})

test('a business 401 clears the session and returns to login', async ({ page }) => {
  await mockParentSession(page)
  await page.route('**/api/public/news-articles?**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ code: 401, message: '登录已过期' })
  }))
  await mockNewsSupportRequests(page)

  await page.goto('/news')

  await expect(page).toHaveURL(/\/login\?redirect=.*news.*reason=expired/)
  await expect.poll(() => page.evaluate(() => ({
    accessToken: localStorage.getItem('sjz_user_access_token'),
    refreshToken: localStorage.getItem('sjz_user_refresh_token')
  }))).toEqual({ accessToken: null, refreshToken: null })
})

test('a forbidden response keeps the session and does not offer a futile retry', async ({ page }) => {
  await mockParentSession(page)
  await page.route('**/api/public/news-articles?**', route => route.fulfill({
    status: 403,
    contentType: 'application/json',
    body: JSON.stringify({ code: 403, message: '当前角色不能查看新闻' })
  }))
  await mockNewsSupportRequests(page)

  await page.goto('/news')

  await expect(page).toHaveURL(/\/news$/)
  await expect(page.getByRole('alert')).toContainText('当前账号没有权限')
  await expect(page.getByRole('button', { name: '重新加载' })).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sjz_user_access_token')))
    .toBe('e2e-parent-token')
})
