import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { LAUNCH_DATE, SITE_DOMAIN, STORES } from '../data/stores';
import { launchLine, renderLanding } from './landing';

const page = () => {
  const html = readFileSync('index.html', 'utf8');
  document.body.innerHTML = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'));
};

afterEach(() => {
  document.body.innerHTML = '';
  STORES.forEach((s) => (s.url = ''));
});

describe('the landing page (1.94)', () => {
  it('names the launch date and every store before launch, and says "Out now" from launch day', () => {
    expect(launchLine(new Date('2026-10-10T12:00:00Z'))).toBe('Coming March 11, 2027 to Steam, Google Play and the App Store');
    expect(launchLine(new Date(`${LAUNCH_DATE}T12:00:00Z`))).toBe('Out now on Steam, Google Play and the App Store');
  });

  it('shows "coming soon" for a store with no page yet, and a link once it has one', () => {
    page();
    renderLanding(document, new Date('2026-10-10T12:00:00Z'));
    const items = document.querySelectorAll('[data-stores] li');
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toBe('Steam: coming soon');
    expect(items[0].querySelector('a')).toBeNull();
    STORES[0].url = 'https://store.steampowered.com/app/1/MegaGen_Idle/';
    renderLanding(document);
    const a = document.querySelector('[data-store="steam"] a') as HTMLAnchorElement;
    expect(a.href).toBe(STORES[0].url);
    expect(a.textContent).toBe('Steam');
  });

  it('has a Play now link to the game, privacy and credits, and pictures from the sprites object', () => {
    page();
    renderLanding(document);
    expect(document.querySelector('[data-testid="play-now"]')!.getAttribute('href')).toBe('play/');
    expect(document.querySelector('footer a')!.getAttribute('href')).toBe('privacy.html');
    expect(document.querySelectorAll('[data-credits] li').length).toBeGreaterThan(3);
    for (const img of document.querySelectorAll('img')) expect(img.getAttribute('src')).toBeTruthy();
  });

  it('has sharing tags, and public/CNAME holds the custom domain', () => {
    const html = readFileSync('index.html', 'utf8');
    for (const tag of ['og:title', 'og:description', 'og:image', 'og:url']) expect(html).toContain(`property="${tag}"`);
    expect(html).toContain('rel="icon"');
    expect(readFileSync('public/CNAME', 'utf8').trim()).toBe(SITE_DOMAIN);
  });
});
