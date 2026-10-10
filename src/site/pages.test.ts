import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../data/achievements';
// @ts-expect-error plain .mjs module without types
import { checkSite, PAGE_BUDGET_BYTES } from '../../scripts/check-site.mjs';
// @ts-expect-error plain .mjs module without types
import { crc32, zip } from '../../scripts/lib/zip.mjs';
import { FAQ, FEATURES } from './content';
import * as links from './links';
import { buildSitePage, heroButtons, MARKDOWN_SOURCES, markdownFor, renderMarkdown, SITE_PAGES, sitemapXml, siteFooter, spriteSrc, storeButtons, trailer } from './pages';
import { launchLine } from './pages-runtime';

const root = resolve(__dirname, '../..');
const build = (file: string, path: string) => buildSitePage(readFileSync(resolve(root, file), 'utf8'), path, { root, version: '9.9.9', now: new Date('2026-10-10T12:00:00Z') });
const asDom = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const saved = links.STORES.map((s) => s.url);
afterEach(() => links.STORES.forEach((s, i) => (s.url = saved[i])));

describe('the website pages (2.05)', () => {
  it.each(SITE_PAGES)('$path builds with a title, a description and the sharing tags', ({ file, path }) => {
    const html = build(file, path);
    const doc = asDom(html);
    expect(doc.title).toMatch(/MegaGen Idle/);
    expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')).toBeTruthy();
    for (const p of ['og:title', 'og:description', 'og:image', 'og:url']) expect(doc.querySelector(`meta[property="${p}"]`)?.getAttribute('content'), p).toBeTruthy();
    expect(doc.querySelector('meta[property="og:image"]')!.getAttribute('content')).toBe(`${links.SITE_URL}og-image.png`);
    expect(doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
    expect(doc.querySelector('link[rel="icon"]')).not.toBeNull();
    // every marker filled; the shared header and footer on every page
    expect(html).not.toMatch(/<!-- site:/);
    expect(doc.querySelector('.site-header a[href="/play/"]')).not.toBeNull();
    expect(doc.querySelector('[data-testid="site-footer"] a[href="/privacy/"]')).not.toBeNull();
    expect(doc.body.textContent).toContain('© 2026 MegaGen Idle');
  });

  it('the landing page: hero, launch line, six feature cards, four screenshots, Fair by design, the FAQ and JSON-LD', () => {
    const doc = asDom(build('index.html', '/'));
    expect(doc.querySelector('[data-testid="play-now"]')!.textContent).toBe('Play free in your browser');
    expect(doc.querySelector('[data-testid="play-now"]')!.getAttribute('href')).toBe('/play/');
    expect(doc.querySelector('[data-testid="launch"]')!.textContent).toBe('Coming March 11, 2027 to PC, Android and iPhone');
    expect(doc.querySelectorAll('[data-testid="features"] li')).toHaveLength(6);
    expect(doc.querySelectorAll('[data-testid="gallery"] img')).toHaveLength(4);
    expect(doc.querySelectorAll('details.faq')).toHaveLength(FAQ.length);
    const ld = JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(ld['@type']).toBe('VideoGame');
    expect(ld.name).toBe('MegaGen Idle');
    // the canonical address of the site root
    expect(doc.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe(links.SITE_URL);
  });

  it('feature cards use manifest sprites, never hard-coded paths', () => {
    for (const f of FEATURES) expect(spriteSrc(f.sprite)).toMatch(/^\/src\/assets\/sprites\/.+\.png$/);
    expect(() => spriteSrc('no_such_sprite')).toThrow();
  });

  it('an empty link hides its button or embed; a filled one shows it', () => {
    // as shipped: Steam, Discord, the stores and the trailer are empty
    expect(heroButtons()).not.toContain('Wishlist on Steam');
    expect(heroButtons()).not.toContain('Join the Discord');
    expect(storeButtons()).toBe('');
    expect(trailer()).toBe('');
    links.STORES[1].url = 'https://play.google.com/store/apps/details?id=com.megagenidle.game';
    expect(asDom(storeButtons()).querySelector('a')!.textContent).toBe('Google Play');
    // the footer lists only the socials that have a link
    const footer = asDom(siteFooter('1.0.0'));
    const shown = [...footer.querySelectorAll('[data-social]')].map((a) => a.getAttribute('data-social'));
    expect(shown).toEqual(links.SOCIALS.filter((s) => s.url).map((s) => s.id));
    expect(shown).not.toContain('discord');
    expect(footer.querySelector('[data-testid="kofi"]')!.getAttribute('href')).toBe(links.KOFI_URL);
    expect(footer.body.textContent).toContain(links.SUPPORT_EMAIL);
  });

  it('says "Out now" from launch day', () => {
    expect(launchLine(new Date('2026-10-10T12:00:00Z'))).toBe('Coming March 11, 2027 to PC, Android and iPhone');
    expect(launchLine(new Date(`${links.LAUNCH_DATE}T12:00:00Z`))).toBe('Out now on PC, Android and iPhone');
  });

  it('privacy, terms and press show the in-repo text until the owner adds the Markdown files', () => {
    for (const key of Object.keys(MARKDOWN_SOURCES) as (keyof typeof MARKDOWN_SOURCES)[]) {
      const { html, fromOwner } = markdownFor(key, root);
      expect(html).toMatch(/<h1>/);
      if (!fromOwner) expect(readFileSync(resolve(root, MARKDOWN_SOURCES[key].fallback), 'utf8').length).toBeGreaterThan(50);
    }
    const privacy = asDom(build('privacy/index.html', '/privacy/'));
    expect(privacy.body.textContent).toContain('Delete my account');
    const press = asDom(build('press/index.html', '/press/'));
    expect(press.querySelector('[data-testid="press-kit"]')!.getAttribute('href')).toBe('/press-kit.zip');
    const support = asDom(build('support/index.html', '/support/'));
    expect(support.querySelector('img.shot')).not.toBeNull();
    expect(support.querySelectorAll('ol li').length).toBeGreaterThanOrEqual(3);
  });

  it('renders Markdown: headings, paragraphs, lists, links, emphasis; raw HTML is escaped', () => {
    const html = renderMarkdown('# Title\n\nSome **bold** and *soft* text\nover two lines.\n\n- one [link](https://example.com)\n- two\n\n1. first\n2. second\n\n<script>x</script>\n\nMail support@megagenidle.com');
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<p>Some <strong>bold</strong> and <em>soft</em> text over two lines.</p>');
    expect(html).toContain('<ul><li>one <a href="https://example.com" rel="noopener">link</a></li><li>two</li></ul>');
    expect(html).toContain('<ol><li>first</li><li>second</li></ol>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('<a href="mailto:support@megagenidle.com">support@megagenidle.com</a>');
  });

  it('lists every public page in the sitemap, not the 404 page', () => {
    const xml = sitemapXml();
    for (const p of ['', 'play/', 'press/', 'privacy/', 'terms/', 'support/']) expect(xml).toContain(`<loc>${links.SITE_URL}${p}</loc>`);
    expect(xml).not.toContain('404');
  });

  it('the screenshots exist at 1920x1080 for the gallery and the press kit', () => {
    const shots = readdirSync(resolve(root, 'public/screens')).filter((f) => f.endsWith('.jpg'));
    expect(shots.length).toBeGreaterThanOrEqual(7);
    const jpgSize = (file: string) => {
      const b = readFileSync(resolve(root, 'public/screens', file));
      for (let i = 2; i < b.length; ) {
        const marker = b[i + 1];
        const len = b.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xc2) return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
        i += 2 + len;
      }
      return null;
    };
    for (const f of ['early-game.jpg', 'site-map.jpg', 'research.jpg', 'late-game.jpg', 'pets.jpg', 'completion.jpg']) expect(jpgSize(f), f).toEqual({ width: 1920, height: 1080 });
  });
});

describe('the site check run by build:web (2.05)', () => {
  let dir = '';
  afterEach(() => dir && rmSync(dir, { recursive: true, force: true }));

  const write = (rel: string, body: string | Buffer) => {
    mkdirSync(join(dir, rel, '..'), { recursive: true });
    writeFileSync(join(dir, rel), body);
  };

  it('passes a built site and fails one over budget or missing its tags', () => {
    dir = mkdtempSync(join(tmpdir(), 'site-'));
    for (const p of SITE_PAGES) write(p.file, build(p.file, p.path).replace('/src/site/main.ts', '/assets/main.js'));
    write('assets/main.js', 'x'.repeat(1000));
    for (const f of ['play/index.html', 'og-image.png', 'sitemap.xml', 'robots.txt', 'press-kit.zip']) write(f, 'x');
    expect(checkSite(dir)).toEqual([]);
    write('assets/main.js', 'x'.repeat(PAGE_BUDGET_BYTES));
    expect(checkSite(dir).some((p: string) => p.includes('over 200 KB'))).toBe(true);
    write('assets/main.js', 'x');
    write('terms/index.html', '<html><head><title>Terms</title></head><body>MegaGen</body></html>');
    const problems = checkSite(dir).join('\n');
    expect(problems).toContain('terms/index.html: no');
    expect(problems).toContain('terms/index.html: says "MegaGen" without "Idle"');
  });

  it('the press-kit zip is a valid store-only archive', () => {
    dir = mkdtempSync(join(tmpdir(), 'zip-'));
    const data = Buffer.from('hello press');
    const z: Buffer = zip([{ name: 'a.txt', data }]);
    expect(z.readUInt32LE(0)).toBe(0x04034b50);
    expect(z.readUInt32LE(14)).toBe(crc32(data));
    expect(crc32(Buffer.from('123456789'))).toBe(0xcbf43926);
    expect(z.subarray(30 + 5, 30 + 5 + data.length).toString()).toBe('hello press');
    expect(z.readUInt32LE(z.length - 22)).toBe(0x06054b50);
  });
});

describe('the full name, never "MegaGen" alone (trademark, 2.05)', () => {
  const ALONE = /MegaGen(?!\s?Idle)/;

  it('no player-facing text in the game or on the site says "MegaGen" without "Idle"', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(tsx?|html|md|json)$/.test(f) && !/\.test\./.test(f)) files.push(p);
      }
    };
    for (const d of ['src', 'electron', 'play', 'press', 'privacy', 'terms', 'support']) walk(resolve(root, d));
    files.push(resolve(root, 'index.html'), resolve(root, '404.html'));
    const hits = files.flatMap((f) => {
      // comments are not player-facing
      const code = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1').replace(/<!--[\s\S]*?-->/g, '');
      return code.split('\n').filter((l) => ALONE.test(l)).map((l) => `${f.slice(root.length + 1)}: ${l.trim()}`);
    });
    expect(hits).toEqual([]);
  });

  it('the 2-billion-energy achievement keeps its id under the new name', () => {
    const a = ACHIEVEMENTS.find((x) => x.id === 'energy_2b')!;
    expect(a.name).toBe('Mega Generator');
    expect(ACHIEVEMENTS.every((x) => !ALONE.test(x.name) && !ALONE.test(x.description))).toBe(true);
  });
});
