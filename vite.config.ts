/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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
// dev and tests use the root. Once the custom domain megagenidle.com is on
// (1.94, docs/PUBLIC_RELEASE.md), the deploy workflow sets SITE_BASE=/ and
// SITE_URL=https://megagenidle.com/ from the repository's Actions variables.
const PAGES_BASE = process.env.SITE_BASE || '/megagen-idle/';
const SITE_URL = process.env.SITE_URL || 'https://joshridavis.github.io/megagen-idle/';
const SITE_DESCRIPTION =
  'MegaGen Idle: an idle game about generating energy. Build solar panels, dams and reactors, research better machines, and keep earning while you are away. Free in your browser.';

// The landing page (1.94): sharing tags, the version, and the key scene at a
// fixed name (og-image.png) so link previews can point at it.
const landingPage = {
  name: 'megagen-landing',
  transformIndexHtml: (html: string) =>
    html.replaceAll('%SITE_URL%', SITE_URL).replaceAll('%SITE_DESCRIPTION%', SITE_DESCRIPTION).replaceAll('%APP_VERSION%', pkg.version),
  generateBundle(this: { emitFile: (f: { type: 'asset'; fileName: string; source: Buffer }) => void }) {
    this.emitFile({ type: 'asset', fileName: 'og-image.png', source: readFileSync(new URL('./src/assets/brand/key_scene.png', import.meta.url)) });
  },
};

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? PAGES_BASE : '/',
  plugins: [bootLoader, landingPage, react(), tailwindcss()],
  build: {
    // two pages: the landing page at the site root, the game at /play/ (1.94).
    // The game's entry keeps the name "index", as before.
    rollupOptions: {
      input: {
        site: fileURLToPath(new URL('./index.html', import.meta.url)),
        index: fileURLToPath(new URL('./play/index.html', import.meta.url)),
      },
    },
  },
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
