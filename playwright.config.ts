import { defineConfig, devices } from '@playwright/test';

// Smoke tests run against the website build (`npm run build:web`, 2.05) served by `vite preview`.
// PW_CHROMIUM_PATH lets a sandbox use a pre-installed Chromium instead of
// downloading one (CI runs `npx playwright install chromium` instead).
const PORT = 4173;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    // the game lives at /play/ since the landing page took the site root (1.94); the site root is / (2.05)
    baseURL: `http://localhost:${PORT}/play/`,
    ...devices['Desktop Chrome'],
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: `npm run build:web && npx vite preview --outDir dist-web --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
