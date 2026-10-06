import { expect, test } from '@playwright/test'

async function mockTeacherSession(page) {
  const user = {
    id: 21,
    role: 'teacher',
    realName: '林老师',
    schoolId: 3,
    schoolName: '东方幼儿园'
  }

  await page.addInitScript(sessionUser => {
    window.localStorage.setItem('sjz_user_access_token', 'e2e-teacher-token')
    window.localStorage.setItem('sjz_current_user', JSON.stringify(sessionUser))
  }, user)

  await page.route('**/api/app/me', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(user)
  }))
  await page.route('**/api/app/teacher-workbench/summary', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      stats: {
        classCount: 2,
        studentCount: 48,
        todayMomentCount: 3,
        unreadMessageCount: 4,
        unreadNotificationCount: 5,
        availableCompetitionCount: 6
      }
    })
  }))
}

test('teacher workbench prioritizes the next task and groups the remaining work', async ({ page }) => {
  await mockTeacherSession(page)
  await page.goto('/dashboard')

  await expect(page.getByRole('heading', { level: 1, name: '教师工作台' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: '从负责班级开始今天的工作' })).toBeVisible()
  await expect(page.getByRole('link', { name: '查看班级学生' })).toHaveAttribute('href', '/teacher/classes')
  await expect(page.getByRole('heading', { level: 2, name: '工作概览' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: '全部工作' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: '班级与成长' })).toBeVisible()
  await expect(page.getByText('48', { exact: true })).toBeVisible()
})

test('mobile role navigation reveals grouped destinations without flattening every module', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockTeacherSession(page)
  await page.goto('/dashboard')

  const menuButton = page.locator('button.menu-toggle')
  await expect(menuButton).toHaveAccessibleName('打开菜单')
  await menuButton.click()
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  await expect(menuButton).toHaveAccessibleName('关闭菜单')

  const navigation = page.getByRole('navigation', { name: '主导航' })
  const group = navigation.locator('details.nav-group').filter({ hasText: '班级与成长' })
  await group.locator('summary').click()
  await expect(group.getByRole('link', { name: '班级学生' })).toBeVisible()
  await expect(group.getByRole('link', { name: '成长档案' })).toBeVisible()
  await expect(group.getByRole('link', { name: '发布动态' })).toBeVisible()
})
