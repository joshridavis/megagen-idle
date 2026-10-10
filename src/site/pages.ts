/**
 * Builds the website's pages (2.05) at build time: vite.config.ts runs every
 * site page through `buildSitePage`, which fills its `<!-- site:... -->`
 * markers from links.ts and content.ts and adds the sharing tags. The pages
 * are plain HTML (no React); the only script is src/site/main.ts.
 *
 * Node-safe and pure apart from reading files, so it is unit-tested directly.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import manifest from '../assets/sprite-manifest.json';
import { EXPORT_STEPS, FAIR, FAQ, FEATURES, PITCH, TAGLINE } from './content';
import {
  DISCORD_URL,
  KOFI_URL,
  PRESS_EMAIL,
  SITE_URL,
  SOCIALS,
  STEAM_URL,
  STORES,
  SUPPORT_EMAIL,
  TRAILER_YOUTUBE_ID,
} from './links';
import { launchLine } from './pages-runtime';

export interface SitePage {
  /** The input file, relative to the repo root. */
  file: string;
  /** Its address on the site. */
  path: string;
  /** Listed in sitemap.xml. */
  sitemap: boolean;
}

/** Every site page; the game (play/index.html) is built alongside but is not one of them. */
export const SITE_PAGES: SitePage[] = [
  { file: 'index.html', path: '/', sitemap: true },
  { file: 'press/index.html', path: '/press/', sitemap: true },
  { file: 'privacy/index.html', path: '/privacy/', sitemap: true },
  { file: 'terms/index.html', path: '/terms/', sitemap: true },
  { file: 'support/index.html', path: '/support/', sitemap: true },
  { file: '404.html', path: '/404.html', sitemap: false },
];

/** The sharing picture: 1200×630, made from the sprites and logo by `npm run brand`; emitted as /og-image.png. */
export const OG_IMAGE = { file: 'src/assets/brand/og_1200x630.png', name: 'og-image.png', width: 1200, height: 630 };

/** Markdown the owner adds (playbook W-04), with the in-repo text shown until then. */
export const MARKDOWN_SOURCES: Record<string, { file: string; fallback: string }> = {
  privacy: { file: 'docs/legal/privacy.md', fallback: 'src/site/fallback/privacy.md' },
  terms: { file: 'docs/legal/terms.md', fallback: 'src/site/fallback/terms.md' },
  press: { file: 'docs/press.md', fallback: 'src/site/fallback/press.md' },
};

/** Screenshots in public/screens/, made by `npm run screens:site`; the first four make the gallery, all six go in the press kit. */
export const SCREENSHOTS = [
  { file: 'early-game.jpg', alt: 'The first machines: solar panels and a wind turbine, with the resources bar' },
  { file: 'site-map.jpg', alt: 'The site map with dams on the river, tidal stations on the coast and plants on the coal field' },
  { file: 'research.jpg', alt: 'The research tree with a research running' },
  { file: 'late-game.jpg', alt: 'A late-game grid with nuclear and fusion plants' },
  { file: 'pets.jpg', alt: 'The pets tab with grown-up energy pets' },
  { file: 'completion.jpg', alt: 'The Completion tab' },
];
export const SUPPORT_SCREENSHOT = { file: 'support-export.jpg', alt: 'Settings, Save: the Export save and Import save buttons' };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A sprite's source path from the manifest; Vite turns it into the built file. */
export function spriteSrc(id: string): string {
  const entry = (manifest as Record<string, { file: string }>)[id];
  if (!entry) throw new Error(`Unknown sprite "${id}"`);
  return `/src/assets/sprites/${entry.file}`;
}

// ---------- Markdown ----------

function inline(text: string): string {
  return esc(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/(^|\W)_([^_\s][^_]*)_(?=\W|$)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => `<a href="${url}"${/^https?:/.test(url) ? ' rel="noopener"' : ''}>${label}</a>`)
    .replace(/(^|[\s(])([\w.+-]+@[\w-]+\.[\w.]+\w)/g, '$1<a href="mailto:$2">$2</a>');
}

/**
 * A small Markdown renderer for the legal and press pages: headings, paragraphs,
 * lists, links, bold, italics, inline code and rules. Raw HTML is escaped.
 */
export function renderMarkdown(md: string): string {
  const out: string[] = [];
  let para: string[] = [];
  let list: { tag: 'ul' | 'ol'; items: string[] } | null = null;
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
    if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`);
    list = null;
  };
  for (const raw of md.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trimEnd();
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (!line.trim()) flush();
    else if (heading) {
      flush();
      out.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);
    } else if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      flush();
      out.push('<hr />');
    } else if (bullet || numbered) {
      const tag = bullet ? 'ul' : 'ol';
      if (para.length || (list && list.tag !== tag)) flush();
      list ??= { tag, items: [] };
      list.items.push((bullet ?? numbered)![1]);
    } else if (list && /^\s+\S/.test(raw)) list.items[list.items.length - 1] += ` ${line.trim()}`;
    else {
      if (list) flush();
      para.push(line.trim());
    }
  }
  flush();
  return out.join('\n');
}

/** The owner's Markdown if it exists, else the in-repo fallback; `root` is the repo root. */
export function markdownFor(key: keyof typeof MARKDOWN_SOURCES, root: string): { html: string; fromOwner: boolean } {
  const src = MARKDOWN_SOURCES[key];
  const own = resolve(root, src.file);
  const fromOwner = existsSync(own);
  return { html: renderMarkdown(readFileSync(fromOwner ? own : resolve(root, src.fallback), 'utf8')), fromOwner };
}

// ---------- shared parts ----------


const button = (href: string, label: string, kind: string, testId: string) =>
  href ? `<a class="btn btn-${kind}" href="${esc(href)}"${/^https?:/.test(href) ? ' rel="noopener"' : ''} data-testid="${testId}">${esc(label)}</a>` : '';

export function siteHeader(): string {
  return `<header class="site-header">
  <a class="brand" href="/" aria-label="MegaGen Idle home"><img class="pixel" src="${spriteSrc('logo_icon')}" alt="" width="32" height="32" /><span>MegaGen Idle</span></a>
  <nav aria-label="Site">
    <a href="/play/">Play</a>
    <a href="/support/">Support</a>
    <a href="/press/">Press</a>
  </nav>
</header>`;
}

export function siteFooter(version: string): string {
  const socials = SOCIALS.filter((s) => s.url)
    .map((s) => `<li><a class="social" href="${esc(s.url)}" rel="noopener" data-social="${s.id}">${esc(s.name)}</a></li>`)
    .join('');
  return `<footer class="site-footer" data-testid="site-footer">
  ${socials ? `<ul class="socials" aria-label="MegaGen Idle elsewhere">${socials}</ul>` : ''}
  <p><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
  <nav class="footer-links" aria-label="Footer">
    <a href="/privacy/">Privacy</a>
    <a href="/terms/">Terms</a>
    <a href="/press/">Press kit</a>
    <a href="/support/">Support</a>
    ${KOFI_URL ? `<a href="${esc(KOFI_URL)}" rel="noopener" data-testid="kofi">Support the developer on Ko-fi</a>` : ''}
  </nav>
  <p class="fine">© 2026 MegaGen Idle · v${esc(version)}</p>
</footer>`;
}

export function heroButtons(): string {
  return [
    button('/play/', 'Play free in your browser', 'play', 'play-now'),
    button(STEAM_URL, 'Wishlist on Steam', 'steam', 'wishlist'),
    button(DISCORD_URL, 'Join the Discord', 'discord', 'discord'),
  ].join('\n');
}

export function storeButtons(): string {
  return STORES.filter((s) => s.url)
    .map((s) => `<li>${button(s.url, s.name, 'store', `store-${s.id}`)}</li>`)
    .join('');
}

/** The trailer: a picture and a play button; YouTube loads only on click. Nothing while there is no trailer. */
export function trailer(): string {
  if (!TRAILER_YOUTUBE_ID) return '';
  const id = esc(TRAILER_YOUTUBE_ID);
  return `<section class="section" aria-labelledby="trailer-title" data-testid="trailer">
  <h2 id="trailer-title">Trailer</h2>
  <button type="button" class="trailer" data-youtube="${id}" aria-label="Play the trailer (loads YouTube)">
    <img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360" />
    <span class="trailer-play" aria-hidden="true">▶</span>
  </button>
</section>`;
}

export function featureCards(): string {
  return FEATURES.map(
    (f) => `<li class="card"><img class="pixel" src="${spriteSrc(f.sprite)}" alt="" width="64" height="64" loading="lazy" /><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></li>`,
  ).join('\n');
}

export function gallery(): string {
  return SCREENSHOTS.slice(0, 4)
    .map((s) => `<li><a href="/screens/${s.file}"><img src="/screens/${s.file}" alt="${esc(s.alt)}" width="1920" height="1080" loading="lazy" /></a></li>`)
    .join('\n');
}

export const fairList = () => FAIR.map((f) => `<li>${esc(f)}</li>`).join('');

export const faqList = () => FAQ.map((f) => `<details class="faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n');

export const exportSteps = () =>
  `<ol>${EXPORT_STEPS.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
<img class="shot" src="/screens/${SUPPORT_SCREENSHOT.file}" alt="${esc(SUPPORT_SCREENSHOT.alt)}" loading="lazy" />`;

/** JSON-LD for search engines (landing page only). */
export function videoGameJsonLd(): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'MegaGen Idle',
    description: TAGLINE,
    url: SITE_URL,
    image: `${SITE_URL}${OG_IMAGE.name}`,
    genre: ['Idle', 'Incremental', 'Simulation', 'Strategy'],
    gamePlatform: ['PC', 'Android', 'iOS', 'Web browser'],
    applicationCategory: 'Game',
    operatingSystem: 'Windows, Android, iOS, Web',
    inLanguage: 'en',
    author: { '@type': 'Organization', name: 'Joshri Games' },
    publisher: { '@type': 'Organization', name: 'Joshri Games' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', url: `${SITE_URL}play/`, description: 'The free part, in your browser' },
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

/** Canonical address, Open Graph and Twitter tags, favicons; from the page's own <title> and description. */
export function seoTags(html: string, path: string): string {
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  if (!title || !description) throw new Error(`${path}: a site page needs a <title> and a description`);
  const url = `${SITE_URL}${path.replace(/^\//, '').replace(/index\.html$/, '')}`;
  const image = `${SITE_URL}${OG_IMAGE.name}`;
  return [
    path === '/404.html' ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${url}" />`,
    '<meta name="theme-color" content="#0f172b" />',
    '<link rel="icon" type="image/png" sizes="64x64" href="/src/assets/brand/favicon_64.png" />',
    '<link rel="apple-touch-icon" href="/src/assets/brand/apple_touch_icon_256.png" />',
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="MegaGen Idle" />',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE.height}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join('\n    ');
}

/**
 * Fills one site page: every `<!-- site:name -->` marker becomes its part, and
 * the sharing tags go at the end of <head>. An unknown marker is an error.
 */
export function buildSitePage(html: string, path: string, opts: { root: string; version: string; now?: Date }): string {
  const md = (key: keyof typeof MARKDOWN_SOURCES) => markdownFor(key, opts.root).html;
  const parts: Record<string, () => string> = {
    header: siteHeader,
    footer: () => siteFooter(opts.version),
    tagline: () => esc(TAGLINE),
    pitch: () => esc(PITCH),
    'hero-buttons': heroButtons,
    launch: () => esc(launchLine(opts.now)),
    stores: storeButtons,
    trailer,
    features: featureCards,
    gallery,
    fair: fairList,
    faq: faqList,
    'export-steps': exportSteps,
    'support-email': () => `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`,
    'press-email': () => `<a href="mailto:${PRESS_EMAIL}">${PRESS_EMAIL}</a>`,
    'json-ld': videoGameJsonLd,
    privacy: () => md('privacy'),
    terms: () => md('terms'),
    press: () => md('press'),
  };
  const filled = html.replace(/<!-- site:([\w-]+) -->/g, (_m, name: string) => {
    const part = parts[name];
    if (!part) throw new Error(`${path}: unknown marker site:${name}`);
    return part();
  });
  return filled.replace('</head>', `    ${seoTags(filled, path)}\n  </head>`);
}

/** sitemap.xml for every listed page. */
export function sitemapXml(): string {
  const urls = SITE_PAGES.filter((p) => p.sitemap)
    .map((p) => `  <url><loc>${SITE_URL}${p.path.slice(1)}</loc></url>`)
    .concat(`  <url><loc>${SITE_URL}play/</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export const robotsTxt = () => `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`;
