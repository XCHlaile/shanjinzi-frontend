import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3065',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.platform === 'win32' ? { channel: 'msedge' } : {})
      }
    }
  ],
  webServer: [
    {
      command: 'pnpm build:web && pnpm preview:web',
      url: 'http://127.0.0.1:3065',
      env: { VITE_REQUEST_TIMEOUT_MS: '300' },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000
    },
    {
      command: 'pnpm build:admin && pnpm preview:admin',
      url: 'http://127.0.0.1:3102',
      env: { VITE_REQUEST_TIMEOUT_MS: '300' },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000
    }
  ]
})
