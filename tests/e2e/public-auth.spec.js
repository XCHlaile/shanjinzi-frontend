import { expect, test } from '@playwright/test'

test('public home exposes the primary product and login journeys', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1, name: /让孩子在好奇中.*遇见科技/ })).toBeVisible()
  await expect(page.getByRole('link', { name: '查看平台功能' })).toHaveAttribute('href', '/platform')
  await expect(page.getByRole('link', { name: '登录使用' })).toHaveAttribute('href', '/login')
})

test('protected pages redirect to login and preserve the intended destination', async ({ page }) => {
  await page.goto('/school/students')

  await expect(page).toHaveURL(/\/login\?redirect=\/school\/students$/)
  await expect(page.getByRole('heading', { level: 2, name: '手机验证码登录' })).toBeVisible()
})

test('a signed-in parent cannot open a school route directly', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sjz_user_access_token', 'parent-token')
    localStorage.setItem('sjz_current_user', JSON.stringify({
      id: 12,
      role: 'parent',
      roles: ['PARENT']
    }))
  })
  await page.route('**/api/**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ code: 'SUCCESS', data: {} })
  }))

  await page.goto('/school/students')

  await expect(page).toHaveURL(/\/dashboard$/)
})

test('an expired token-only session is cleared before entering a protected route', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sjz_user_access_token', 'expired-token')
    localStorage.setItem('sjz_user_refresh_token', 'expired-refresh')
  })
  await page.route('**/api/app/me', route => route.fulfill({
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify({ code: 401, message: '登录已过期' })
  }))

  await page.goto('/school/students')

  await expect(page).toHaveURL(/\/login\?redirect=.*school.*students/)
  await expect.poll(() => page.evaluate(() => ({
    accessToken: localStorage.getItem('sjz_user_access_token'),
    refreshToken: localStorage.getItem('sjz_user_refresh_token')
  }))).toEqual({ accessToken: null, refreshToken: null })
})

test('password login sends the documented payload and surfaces backend errors', async ({ page }) => {
  let requestBody
  await page.route('**/api/public/auth/login', async route => {
    requestBody = route.request().postDataJSON()
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'INVALID_CREDENTIALS', message: '手机号或密码错误', traceId: 'e2e-login' })
    })
  })

  await page.goto('/login')
  await page.getByRole('button', { name: '使用密码登录' }).click()
  await page.getByLabel('手机号').fill('13800138000')
  await page.getByLabel('密码').fill('wrong-password')
  await page.getByRole('button', { name: '密码登录' }).click()

  await expect(page.getByRole('alert')).toContainText('手机号或密码错误')
  expect(requestBody).toEqual({ phone: '13800138000', password: 'wrong-password' })
})
