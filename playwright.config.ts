import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: CI,
  // Retries hide flakiness, so keep them off locally and allow one in CI only to absorb demo-site hiccups.
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'web-chromium',
      testDir: './tests/web',
      use: { ...devices['Desktop Chrome'], baseURL: 'https://www.saucedemo.com', testIdAttribute: 'data-test' },
    },
    {
      name: 'web-firefox',
      testDir: './tests/web',
      use: { ...devices['Desktop Firefox'], baseURL: 'https://www.saucedemo.com', testIdAttribute: 'data-test' },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: 'https://restful-booker.herokuapp.com',
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
