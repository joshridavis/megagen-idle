import { defineConfig, devices } from '@playwright/test';

// Smoke tests run against the production build served by `vite preview`.
// PW_CHROMIUM_PATH lets a sandbox use a pre-installed Chromium instead of
// downloading one (CI runs `npx playwright install chromium` instead).
const PORT = 4173;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/megagen-idle/`,
    ...devices['Desktop Chrome'],
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/megagen-idle/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
