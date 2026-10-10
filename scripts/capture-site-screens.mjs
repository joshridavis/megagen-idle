// Captures the website's screenshots (2.05) with Playwright: six game scenes at
// 1920x1080 (the first four make the landing page gallery, all six go in the
// press kit) and the Settings save panel for the support page. Writes JPGs to
// public/screens/. Run with `npm run screens:site` after a visible change;
// PW_CHROMIUM_PATH points at a pre-installed Chromium if Playwright's own is
// not downloaded.
//
// It starts the Vite dev server, where the game exposes its store for checks
// like this one (never in production builds), and seeds each scene.
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'public/screens');
mkdirSync(out, { recursive: true });

const server = await createServer({ root, server: { port: 5199, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});

/** A seeded game: everything researched up to `upTo` generators, plenty of every resource, no popups. */
async function scene(page, { gens, research = 'all', producers = {}, extra = {} }) {
  await page.goto('http://localhost:5199/play/');
  await page.waitForFunction(() => window.__megagenStore);
  await page.evaluate(
    async ({ gens, research, producers, extra }) => {
      const st = window.__megagenStore;
      const { RESEARCH } = await import('/src/data/research.ts');
      const { TUTORIAL_DONE } = await import('/src/data/tutorial.ts');
      const { recordsFromGenerators } = await import('/src/utils/records.ts');
      const activeGenerators = gens.map((type, i) => ({ id: `gen-${i + 1}`, type, isActive: true, level: 3 }));
      const s = st.getState();
      const done = research === 'all' ? RESEARCH.map((r) => r.id) : RESEARCH.filter((r) => r.requiredLevel <= research).map((r) => r.id);
      st.setState({
        completedResearch: done,
        researchLevel: research === 'all' ? 40 : research,
        roomCapacity: 400,
        energy: 2.5e9,
        lifetimeEnergy: 3e9,
        resources: Object.fromEntries(Object.keys(s.resources).map((k) => [k, 50_000])),
        activeGenerators,
        records: recordsFromGenerators(activeGenerators),
        producers: { ...s.producers, ...producers },
        currentResearch: null,
        settings: { ...s.settings, tutorial: { step: TUTORIAL_DONE, replay: false } },
        ...extra,
      });
    },
    { gens, research, producers, extra },
  );
  // popups that the seeding itself sets off (level-ups, achievements, new pets)
  await page.addStyleTag({ content: '[data-testid="toast"], [data-testid$="celebration"], [data-testid$="celebration-old"], [data-testid="welcome-back"] { display: none !important; }' });
}

/** `scroll`: bring the tab bar to the top, so the tab's content fills the picture. */
async function shot(page, tab, file, scroll = true) {
  await page.locator(`#tab-${tab}`).click();
  await page.waitForTimeout(900);
  await page.locator(`#tab-${tab}`).evaluate((el, scroll) => window.scrollTo(0, scroll ? el.getBoundingClientRect().top + window.scrollY - 110 : 0), scroll);
  await page.mouse.move(4, 700); // no hover tooltips
  await page.waitForTimeout(300);
  await page.screenshot({ path: resolve(out, file), type: 'jpeg', quality: 82 });
  console.log(`public/screens/${file}`);
}

const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const MIDGAME = { energy: 4e6, lifetimeEnergy: 6e7 };
const MID = ['solar', 'solar', 'wind', 'wind', 'coal', 'hydro', 'hydro', 'tidal', 'tidal', 'gas'];
const LATE = [...MID, 'oil', 'nuclear', 'nuclear', 'fusion', 'supernova'];

await scene(page, { gens: ['solar', 'solar', 'solar', 'wind'], research: 2, extra: { energy: 1800, lifetimeEnergy: 4000 } });
await shot(page, 'generators', 'early-game.jpg', false);

await scene(page, { gens: MID, research: 9, producers: { quarry: 2, mine: 2, coalMine: 2, gasWell: 1, oilRig: 1 }, extra: MIDGAME });
await shot(page, 'map', 'site-map.jpg');

await scene(page, { gens: MID, research: 9, extra: MIDGAME });
await page.evaluate(async () => {
  const st = window.__megagenStore;
  const { RESEARCH } = await import('/src/data/research.ts');
  const done = RESEARCH.filter((r) => r.requiredLevel <= 6).map((r) => r.id);
  const next = RESEARCH.find((r) => !done.includes(r.id));
  st.setState({ completedResearch: done, researchLevel: 7, currentResearch: next ? { id: next.id, startTime: Date.now() - 1_200_000, duration: 3_600 } : null });
});
await shot(page, 'research', 'research.jpg');

await scene(page, { gens: LATE, producers: { quarry: 3, mine: 3, coalMine: 2, gasWell: 2, oilRig: 2, uraniumMine: 2, deuteriumExtractor: 2 } });
await shot(page, 'map', 'late-game.jpg');

const adult = { stage: 3, growUntil: null, foundAt: 0 };
await scene(page, {
  gens: MID,
  research: 9,
  extra: { ...MIDGAME, pets: { active: 'cat', extra: ['robodog', 'firefly'], slots: 3, owned: { cat: adult, robodog: adult, firefly: adult, hamster: adult, tortoise: { stage: 2, growUntil: Date.now() + 3_600_000, foundAt: 0 } } } },
});
await shot(page, 'pets', 'pets.jpg');

await scene(page, { gens: LATE, producers: { quarry: 3, mine: 3, coalMine: 2, gasWell: 2, oilRig: 2, uraniumMine: 2, deuteriumExtractor: 2 } });
await shot(page, 'completion', 'completion.jpg');

// the support page: Settings, the Save panel, at phone-ish width so it reads at page size
const small = await browser.newPage({ viewport: { width: 760, height: 900 } });
await scene(small, { gens: ['solar', 'wind'], research: 2 });
await small.locator('#tab-settings').click();
const save = small.locator('.panel', { has: small.getByRole('heading', { name: 'Save', exact: true }) });
await save.scrollIntoViewIfNeeded();
await save.screenshot({ path: resolve(out, 'support-export.jpg'), type: 'jpeg', quality: 85 });
console.log('public/screens/support-export.jpg');

await browser.close();
await server.close();
