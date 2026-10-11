/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pkg from './package.json';
import { BOOT_TIMEOUT_MS } from './src/data/boot';
import { buildSitePage, OG_IMAGE, robotsTxt, SCREENSHOTS, SITE_PAGES, siteUrlFrom, sitemapXml } from './src/site/pages';
// @ts-expect-error plain .mjs module without types
import { zip } from './scripts/lib/zip.mjs';

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

// The website (2.05): Cloudflare Pages serves it from the domain root, so
// every page and the game use base "/". Site pages are plain HTML whose
// <!-- site:... --> markers are filled from src/site/links.ts and content.ts;
// the build also writes the sharing picture, sitemap.xml, robots.txt and the
// press kit. `npm run build:web` builds it into dist-web/ for Cloudflare.
const root = fileURLToPath(new URL('.', import.meta.url));
// Temporary (owner, after playtest 32): until Cloudflare Pages is set up, the site also
// deploys to GitHub Pages at /megagen-idle/ (.github/workflows/deploy.yml sets SITE_BASE).
const BASE = process.env.SITE_BASE || '/';
// The absolute address in the sharing tags, the sitemap and robots.txt (2.09): the GitHub Pages
// workflow sets SITE_URL to its github.io address, so link previews can fetch the picture.
const SITE_URL = siteUrlFrom(process.env.SITE_URL);
// PLAY_EDITION picks the edition of the game at /play/ (2.04 reads VITE_EDITION).
if (process.env.PLAY_EDITION && !process.env.VITE_EDITION) process.env.VITE_EDITION = process.env.PLAY_EDITION;

const sitePages = {
  name: 'megagen-site-pages',
  transformIndexHtml: {
    order: 'pre' as const,
    handler: (html: string, ctx: { path: string }) => {
      const page = SITE_PAGES.find((p) => `/${p.file}` === ctx.path || p.path === ctx.path);
      return page ? buildSitePage(html, page.path, { root, version: pkg.version, base: BASE, siteUrl: SITE_URL }) : html;
    },
  },
  generateBundle(this: { emitFile: (f: { type: 'asset'; fileName: string; source: string | Uint8Array }) => void }) {
    const file = (rel: string) => readFileSync(new URL(rel, import.meta.url));
    this.emitFile({ type: 'asset', fileName: OG_IMAGE.name, source: file(`./${OG_IMAGE.file}`) });
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(SITE_URL) });
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(SITE_URL) });
    const shots = SCREENSHOTS.filter((s) => existsSync(new URL(`./public/screens/${s.file}`, import.meta.url)));
    this.emitFile({
      type: 'asset',
      fileName: 'press-kit.zip',
      source: zip([
        { name: 'MegaGen Idle - logo.png', data: file('./src/assets/brand/logo.png') },
        { name: 'MegaGen Idle - app icon.png', data: file('./src/assets/brand/app_icon_1024.png') },
        { name: 'MegaGen Idle - key art.png', data: file('./src/assets/brand/key_scene.png') },
        ...shots.map((s, i) => ({ name: `MegaGen Idle - screenshot ${i + 1}.jpg`, data: file(`./public/screens/${s.file}`) })),
      ]),
    });
  },
};

export default defineConfig({
  base: BASE,
  plugins: [bootLoader, sitePages, react(), tailwindcss()],
  build: {
    // the site pages, and the game at /play/ (1.94). The game's entry keeps the name "index", as before.
    rollupOptions: {
      input: {
        ...Object.fromEntries(SITE_PAGES.map((p) => [p.file === 'index.html' ? 'site' : p.file.replace(/(\/index)?\.html$/, ''), resolve(root, p.file)])),
        index: resolve(root, 'play/index.html'),
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
    include: ['src/**/*.test.{ts,tsx}', 'electron/**/*.test.ts'],
    // `npm run test:coverage` (0.18): the game rules in src/utils/ stay at 80% or more.
    coverage: {
      provider: 'v8',
      include: ['src/utils/**'],
      exclude: ['**/*.test.*'],
      reporter: ['text-summary', 'html'],
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 },
    },
  },
});
