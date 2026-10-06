import { expect, test } from '@playwright/test'

const jsonResponse = data => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ code: 'SUCCESS', data })
})

test('school roster becomes a touch-friendly card directory on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => {
    localStorage.setItem('sjz_user_access_token', 'e2e-school-token')
    localStorage.setItem('sjz_current_user', JSON.stringify({
      id: 31,
      role: 'school',
      roles: ['SCHOOL_ADMIN'],
      realName: 'School Admin',
      schoolId: 3,
      schoolName: 'Sunrise School'
    }))
  })

  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/public/students') {
      await route.fulfill(jsonResponse({
        items: [{
          id: 41,
          name: 'Student One',
          studentNo: 'S-0041',
          schoolId: 3,
          schoolName: 'Sunrise School',
          classId: 7,
          className: 'Class One',
          enrollmentStatus: 'ENROLLED',
          status: 'ACTIVE',
          createdAt: '2026-08-01T08:00:00'
        }],
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1
      }))
      return
    }
    if (url.pathname === '/api/public/students/41/guardians') {
      await route.fulfill(jsonResponse([{ id: 91, status: 'ACTIVE' }]))
      return
    }
    if (url.pathname === '/api/public/students/41') {
      await route.fulfill(jsonResponse({
        id: 41,
        name: 'Student One',
        studentNo: 'S-0041',
        schoolId: 3,
        classes: [{ classId: 7, className: 'Class One' }]
      }))
      return
    }
    await route.fulfill(jsonResponse({}))
  })

  await page.goto('/school/students')

  const card = page.locator('.student-table tbody tr').first()
  await expect(card).toBeVisible()
  await expect(card).toContainText('Student One')

  const layout = await card.evaluate(element => {
    const table = element.closest('table')
    const actions = [...element.querySelectorAll('button')]
    return {
      display: getComputedStyle(element).display,
      tableMinWidth: getComputedStyle(table).minWidth,
      cardRight: element.getBoundingClientRect().right,
      viewportWidth: document.documentElement.clientWidth,
      actionHeights: actions.map(button => button.getBoundingClientRect().height)
    }
  })

  expect(layout.display).toBe('block')
  expect(layout.tableMinWidth).toBe('0px')
  expect(layout.cardRight).toBeLessThanOrEqual(layout.viewportWidth)
  expect(layout.actionHeights.every(height => height >= 44)).toBe(true)
})

test('school class directory also becomes a mobile card list without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => {
    localStorage.setItem('sjz_user_access_token', 'e2e-school-token')
    localStorage.setItem('sjz_current_user', JSON.stringify({
      id: 31,
      role: 'school',
      roles: ['SCHOOL_ADMIN'],
      realName: 'School Admin',
      schoolId: 3,
      schoolName: 'Sunrise School'
    }))
  })

  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/public/classes') {
      await route.fulfill(jsonResponse({
        items: [{
          id: 7,
          schoolId: 3,
          name: 'Class One',
          gradeName: 'Grade One',
          sortOrder: 1,
          status: 'ACTIVE',
          updatedAt: '2026-08-01T08:00:00'
        }],
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1
      }))
      return
    }
    if (url.pathname === '/api/open/users') {
      await route.fulfill(jsonResponse({
        items: [],
        page: 1,
        pageSize: 100,
        total: 0,
        totalPages: 0
      }))
      return
    }
    await route.fulfill(jsonResponse({}))
  })

  await page.goto('/school/classes')

  const card = page.locator('.data-table tbody tr').first()
  await expect(card).toBeVisible()
  await expect(card).toContainText('Class One')

  const layout = await card.evaluate(element => ({
    display: getComputedStyle(element).display,
    tableMinWidth: getComputedStyle(element.closest('table')).minWidth,
    cardRight: element.getBoundingClientRect().right,
    viewportWidth: document.documentElement.clientWidth,
    actionHeights: [...element.querySelectorAll('button')]
      .map(button => button.getBoundingClientRect().height)
  }))

  expect(layout.display).toBe('block')
  expect(layout.tableMinWidth).toBe('0px')
  expect(layout.cardRight).toBeLessThanOrEqual(layout.viewportWidth)
  expect(layout.actionHeights.every(height => height >= 44)).toBe(true)
})

test('admin user directory requests the selected server page and uses mobile cards', async ({ page }) => {
  const requestedPages = []
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => {
    localStorage.setItem('sjz_admin_access_token', 'e2e-admin-token')
    localStorage.setItem('sjz_admin_display_name', 'E2E Admin')
  })

  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/admin/users') {
      const pageNumber = Number(url.searchParams.get('page') || 1)
      const pageSize = Number(url.searchParams.get('pageSize') || 20)
      requestedPages.push({ page: pageNumber, pageSize })
      await route.fulfill(jsonResponse({
        items: [{
          id: pageNumber * 100,
          phone: `1380000${String(pageNumber).padStart(4, '0')}`,
          realName: `User Page ${pageNumber}`,
          roleCode: 'PARENT',
          schoolId: 3,
          schoolName: 'Sunrise School',
          status: 'ACTIVE',
          createdAt: '2026-08-01T08:00:00'
        }],
        page: pageNumber,
        pageSize,
        total: 45,
        totalPages: 3
      }))
      return
    }
    if (url.pathname === '/api/public/schools') {
      await route.fulfill(jsonResponse({
        items: [{ id: 3, name: 'Sunrise School', status: 'ACTIVE' }],
        page: 1,
        pageSize: 100,
        total: 1,
        totalPages: 1
      }))
      return
    }
    await route.fulfill(jsonResponse({}))
  })

  await page.goto('http://127.0.0.1:3102/users')

  const mobileCard = page.locator('.mobile-record').first()
  await expect(mobileCard).toBeVisible()
  await expect(mobileCard).toContainText('User Page 1')
  await expect(page.locator('.desktop-table')).toBeHidden()

  await page.locator('.directory-footer .btn-next').click()

  await expect(mobileCard).toContainText('User Page 2')
  await expect.poll(() => requestedPages.at(-1)).toEqual({ page: 2, pageSize: 20 })
})
