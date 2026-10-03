import { defineConfig } from '@playwright/test';
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3100';
export default defineConfig({
  testDir: './tests', fullyParallel: true, retries: 0, workers: 2,
  reporter: 'list',
  use: {
    baseURL, viewport: { width: 1440, height: 900 },
    launchOptions: { ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : { channel: 'msedge' }) },
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev -- --port 3100', url: baseURL,
    reuseExistingServer: !process.env.CI, timeout: 120000
  }
});
