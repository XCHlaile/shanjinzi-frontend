import { expect, test } from '@playwright/test'

const response = data => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ code: 'SUCCESS', data })
})

test('a large conversation directory mounts only the visible virtual rows', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sjz_user_access_token', 'e2e-parent-token')
    localStorage.setItem('sjz_current_user', JSON.stringify({
      id: 12,
      role: 'parent',
      roles: ['PARENT'],
      realName: '测试家长'
    }))
  })
  const conversations = Array.from({ length: 250 }, (_, index) => ({
    conversationId: `conversation-${index}`,
    participant: {
      id: index + 100,
      realName: `联系人 ${index}`,
      roles: ['PARENT']
    },
    lastMessagePreview: `第 ${index} 条会话`,
    lastMessageAt: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(),
    unreadCount: 0
  }))

  await page.route('**/api/**', async route => {
    const pathname = new URL(route.request().url()).pathname
    if (pathname === '/api/app/messages/conversations') {
      await route.fulfill(response({
        items: conversations,
        page: 1,
        pageSize: 250,
        total: 250,
        totalPages: 1
      }))
      return
    }
    if (
      pathname === '/api/app/messages/unread-count'
      || pathname === '/api/app/notifications/unread-count'
    ) {
      await route.fulfill(response({ unreadCount: 0 }))
      return
    }
    await route.fulfill(response({ items: [], total: 0, totalPages: 0 }))
  })

  await page.goto('/messages')

  const virtualList = page.getByRole('list', { name: '最近会话列表' })
  await expect(virtualList).toBeVisible()
  await expect(page.getByText('联系人 249', { exact: true })).toBeVisible()
  expect(await page.locator('.conversation-item').count()).toBeLessThan(30)

  await virtualList.evaluate(element => { element.scrollTop = element.scrollHeight })

  await expect(page.getByText('联系人 0', { exact: true })).toBeVisible()
  expect(await page.locator('.conversation-item').count()).toBeLessThan(30)

  const metrics = await page.evaluate(() => window.__SJZ_PERFORMANCE__?.snapshot() || [])
  expect(metrics.some(metric => metric.name === 'navigation.duration')).toBe(true)
  expect(metrics.some(metric => (
    metric.name === 'api.duration'
    && metric.context.path === '/api/app/messages/conversations'
  ))).toBe(true)
})
