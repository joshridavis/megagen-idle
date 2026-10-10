// Checks the built website (2.05): every site page stays under the size budget
// (its HTML plus the scripts and styles it loads, before images) and carries
// its title, description and sharing tags. `npm run build:web` runs it on
// dist-web/; the game at /play/ is not a site page and is not checked.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const PAGE_BUDGET_BYTES = 200 * 1024;
export const SITE_HTML = ['index.html', 'press/index.html', 'privacy/index.html', 'terms/index.html', 'support/index.html', '404.html'];
export const REQUIRED_TAGS = [
  /<title>[^<]*MegaGen Idle[^<]*<\/title>/,
  /<meta name="description" content="[^"]+"/,
  /<meta property="og:title" content="[^"]+"/,
  /<meta property="og:description" content="[^"]+"/,
  /<meta property="og:image" content="https:\/\/[^"]+"/,
  /<meta name="twitter:card" content="summary_large_image"/,
  /<link rel="icon"/,
];

/** The bytes a page needs before images: its HTML and every script and stylesheet it loads. */
export function pageBytes(dir, html) {
  const refs = [...html.matchAll(/<(?:script[^>]+src|link[^>]+(?:rel="(?:stylesheet|modulepreload)")[^>]*href)="([^"]+)"/g)].map((m) => m[1]);
  const more = [...html.matchAll(/<link[^>]+href="([^"]+\.(?:js|css))"/g)].map((m) => m[1]);
  const files = new Set([...refs, ...more].filter((u) => u.startsWith('/')));
  let bytes = Buffer.byteLength(html);
  for (const f of files) {
    const p = join(dir, f);
    if (existsSync(p)) bytes += statSync(p).size;
  }
  return bytes;
}

/** Problems with the site in `dir`; empty when all is well. */
export function checkSite(dir) {
  const problems = [];
  for (const page of SITE_HTML) {
    const path = join(dir, page);
    if (!existsSync(path)) {
      problems.push(`${page}: missing`);
      continue;
    }
    const html = readFileSync(path, 'utf8');
    const bytes = pageBytes(dir, html);
    if (bytes > PAGE_BUDGET_BYTES) problems.push(`${page}: ${Math.round(bytes / 1024)} KB before images, over ${PAGE_BUDGET_BYTES / 1024} KB`);
    for (const tag of REQUIRED_TAGS) if (!tag.test(html)) problems.push(`${page}: no ${tag.source}`);
    if (/MegaGen(?! Idle)/.test(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' '))) problems.push(`${page}: says "MegaGen" without "Idle"`);
  }
  for (const f of ['play/index.html', 'og-image.png', 'sitemap.xml', 'robots.txt', 'press-kit.zip']) if (!existsSync(join(dir, f))) problems.push(`${f}: missing`);
  return problems;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const dir = resolve(process.argv[2] ?? 'dist-web');
  const problems = checkSite(dir);
  for (const p of problems) console.error(`✗ ${p}`);
  if (problems.length) process.exit(1);
  for (const page of SITE_HTML) console.log(`${page}: ${Math.round(pageBytes(dir, readFileSync(join(dir, page), 'utf8')) / 1024)} KB before images`);
  console.log('Site check passed.');
}
