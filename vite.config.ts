/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import pkg from './package.json';
import { BOOT_TIMEOUT_MS } from './src/data/boot';

// The loading screen in index.html (1.49) shows before any download finishes,
// so its logo is inlined (the current logo_wordmark sprite) and its timeout is
// read from src/data/boot.ts.
const bootLoader = {
  name: 'megagen-boot-loader',
  transformIndexHtml: {
    order: 'pre' as const,
    handler: (html: string) =>
      html
        .replace(
          '%BOOT_LOGO%',
          `data:image/png;base64,${readFileSync(new URL('./src/assets/sprites/ui/logo_wordmark.png', import.meta.url)).toString('base64')}`,
        )
        .replaceAll('%BOOT_TIMEOUT_MS%', String(BOOT_TIMEOUT_MS)),
  },
};

// GitHub Pages serves the site from /<repo-name>/ (git remote:
// github.com/joshridavis/megagen-idle). `build` and `preview` use it;
// dev and tests use the root.
const PAGES_BASE = '/megagen-idle/';

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? PAGES_BASE : '/',
  plugins: [bootLoader, react(), tailwindcss()],
  // Release version shown in the footer. Bump `version` in package.json in each playtest PR.
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify((process.env.GITHUB_SHA ?? '').slice(0, 7)),
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    // `npm run test:coverage` (0.18): the game rules in src/utils/ stay at 80% or more.
    coverage: {
      provider: 'v8',
      include: ['src/utils/**'],
      exclude: ['**/*.test.*'],
      reporter: ['text-summary', 'html'],
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 },
    },
  },
}));
