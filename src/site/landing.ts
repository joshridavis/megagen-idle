import { sprites } from '../assets';
import keyScene from '../assets/brand/key_scene.png';
import { ART_CREDITS, LIBRARY_CREDITS } from '../data/credits';
import { LAUNCH_DATE, LAUNCH_DATE_TEXT, STORES, type StorePage } from '../data/stores';

/** "Coming March 11, 2027 to Steam, Google Play and the App Store" (or "Out now on …" from launch day). */
export function launchLine(now: Date = new Date()): string {
  const names = STORES.map((s) => (s.id === 'app-store' ? `the ${s.name}` : s.name));
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names.join('');
  return now.toISOString().slice(0, 10) >= LAUNCH_DATE ? `Out now on ${list}` : `Coming ${LAUNCH_DATE_TEXT} to ${list}`;
}

function storeItem(s: StorePage): HTMLLIElement {
  const li = document.createElement('li');
  li.dataset.store = s.id;
  if (s.url) {
    const a = document.createElement('a');
    a.href = s.url;
    a.rel = 'noopener';
    a.textContent = s.name;
    a.className = 'store-link';
    li.append(a);
  } else {
    li.className = 'store-soon';
    li.textContent = `${s.name}: coming soon`;
  }
  return li;
}

function creditItem(c: { name: string; what: string; license: string; url: string }): HTMLLIElement {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = c.url;
  a.rel = 'noopener';
  a.textContent = c.name;
  li.append(a, ` — ${c.what} (${c.license})`);
  return li;
}

/** Fills the landing page's data-driven parts: the launch line, store links and credits. */
export function renderLanding(root: ParentNode = document, now: Date = new Date()): void {
  // pictures come from the typed sprites object, never hard-coded paths
  root.querySelector<HTMLImageElement>('[data-img="logo"]')?.setAttribute('src', sprites.logo_wordmark);
  root.querySelector<HTMLImageElement>('[data-img="key-scene"]')?.setAttribute('src', keyScene);
  const line = root.querySelector('[data-launch]');
  if (line) line.textContent = launchLine(now);
  root.querySelector('[data-stores]')?.replaceChildren(...STORES.map(storeItem));
  root.querySelector('[data-credits]')?.replaceChildren(...[...ART_CREDITS, ...LIBRARY_CREDITS].map(creditItem));
}
