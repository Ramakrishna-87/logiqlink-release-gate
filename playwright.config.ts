import { defineConfig } from '@playwright/test';

export default defineConfig({

testDir: '.',
testMatch: [
  'tests/**/*.spec.ts',
  'evaluation/**/*.spec.ts',
],
  fullyParallel: true,
  workers: 2,
  retries: 0,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL: 'http://localhost:5173',
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    command:
      'npm run dev -- --host localhost --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer:!process.env.CI,
    timeout: 60_000,
  },
});