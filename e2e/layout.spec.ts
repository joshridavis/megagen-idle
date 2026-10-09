import { expect, test, type Page } from '@playwright/test';

// Responsive layout and keyboard access (0.41): no tab scrolls the page
// sideways at phone, tablet or desktop width, and the main loop works from
// the keyboard alone.
const TABS = ['Generators', 'Map', 'Producers', 'Research', 'Contracts', 'Pets', 'Achievements', 'Completion', 'Stats', 'Guide', 'Settings'];

for (const width of [360, 768, 1280]) {
  test(`no sideways scroll on any tab at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('./');
    await expect(page.getByLabel('Energy total')).toBeVisible();
    for (const name of TABS) {
      await page.locator(`#tab-${name.toLowerCase()}`).click();
      await expect(page.locator(`#tab-${name.toLowerCase()}`)).toHaveAttribute('aria-selected', 'true');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${name} at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}

test('the map legend fits a 375px phone, with every zone shown (1.39)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('./');
  await page.locator('#tab-map').click();
  await page.getByTestId('legend-open').click();
  await page.getByTestId('legend-toggle').click();
  await expect(page.getByTestId('legend-lake')).toBeVisible();
  const legend = page.getByTestId('map-legend');
  expect(await legend.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('click, build and switch tabs with the keyboard only', async ({ page }) => {
  await page.goto('./');
  const energy = page.getByLabel('Energy total');
  await expect(energy).toHaveText('900');
  const click = page.getByRole('button', { name: 'Generate energy' });
  await click.focus();
  await page.keyboard.press('Enter');
  await expect(energy).toHaveText('901');
  await page.getByRole('button', { name: 'Build Solar Panel' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Solar Panel #1')).toBeVisible();
  await page.getByRole('tab', { name: 'Generators' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Map' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tab', { name: 'Map' })).toBeFocused();
});

// Playtest 20 bug: hovering a card just under the pinned top bar raised the
// card over the bar and pushed its tooltip up behind it.
test('a tooltip near the pinned top bar opens below and the bar stays on top', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto('./');
  await expect(page.getByLabel('Energy total')).toBeVisible();
  await page.evaluate(() => {
    const card = document.querySelector('[data-testid="generator-card-wind"]')!;
    window.scrollBy(0, card.getBoundingClientRect().top - 40);
  });
  await page.getByTestId('generator-card-wind').getByRole('button').hover();
  const r = await page.evaluate(() => {
    const bar = document.querySelector('[data-testid="top-bar"]')!;
    const b = bar.getBoundingClientRect();
    const tip = document.getElementById('gen-tip-wind')!;
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return { barOnTop: bar.contains(hit), side: tip.dataset.side, tipTop: tip.getBoundingClientRect().top, barBottom: b.bottom };
  });
  expect(r.barOnTop).toBe(true);
  expect(r.side).toBe('below');
  expect(r.tipTop).toBeGreaterThan(r.barBottom);
});

// 1.45: with the page scrolled, a small ⚡ button by the pinned bar generates energy.
test('the small generate button by the pinned bar works at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 700 });
  await page.goto('./');
  const energy = page.getByLabel('Energy total');
  await expect(energy).toHaveText('900');
  await expect(page.getByTestId('mini-click-button')).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, 900));
  const mini = page.getByTestId('mini-click-button');
  await expect(mini).toBeVisible();
  // layout size (the pop-in animation scales it briefly)
  const box = await mini.evaluate((el) => ({ w: (el as HTMLElement).offsetWidth, h: (el as HTMLElement).offsetHeight }));
  expect(box.w).toBeGreaterThanOrEqual(44);
  expect(box.h).toBeGreaterThanOrEqual(44);
  const bar = (await page.getByTestId('top-bar').boundingBox())!;
  expect(bar.x).toBeGreaterThanOrEqual(0);
  expect(bar.x + bar.width).toBeLessThanOrEqual(360);
  await page.screenshot({ path: 'test-results/mini-click-360.png' });
  await mini.click();
  await expect(energy).toHaveText('901');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.getByTestId('mini-click-button')).toHaveCount(0);
});

// 1.84: the three floating map buttons (legend, decorations, animations) fit a 375px phone, and the toggle works by keyboard.
test('the floating map buttons fit a 375px phone, animations toggle included', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto('./');
  await page.locator('#tab-map').click();
  for (const id of ['legend-open', 'decor-open', 'map-anim-toggle']) {
    const b = (await page.getByTestId(id).boundingBox())!;
    expect(b.x, id).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width, id).toBeLessThanOrEqual(375);
    expect(b.y + b.height, id).toBeLessThanOrEqual(700);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  const toggle = page.getByTestId('map-anim-toggle');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await page.screenshot({ path: 'test-results/map-buttons-375.png' });
});

// 1.47: the decorations panel fits a 375px phone and the map stays reachable above it.
test('the decorations panel fits a 375px phone and the map stays reachable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto('./');
  await page.locator('#tab-map').click();
  await page.getByTestId('decor-open').click();
  const panel = page.getByTestId('map-decorations');
  await expect(panel).toBeVisible();
  const box = (await panel.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(375);
  expect(box.y + box.height).toBeLessThanOrEqual(700);
  expect(box.height).toBeLessThanOrEqual(700 * 0.5);
  // scroll the map into the part of the screen between the pinned bar and the sheet: a tile there is not covered
  const map = page.getByTestId('site-map');
  await map.evaluate((el) => window.scrollBy(0, el.getBoundingClientRect().top - 160));
  const m = (await map.boundingBox())!;
  expect(m.y + 40).toBeLessThan(box.y);
  const hit = await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y)?.closest('[data-testid="site-map"]'), [m.x + 20, m.y + 20]);
  expect(hit).toBe(true);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.screenshot({ path: 'test-results/decor-375.png' });
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(page.getByTestId('decor-open')).toBeFocused();
});

// 1.64 (playtest 22): far down a map taller than the screen, the 🎨 button and the whole panel stay in view.
for (const [width, height] of [[1280, 520], [375, 640]] as const) {
  test(`decorations stay reachable deep in a tall map at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('./');
    await page.locator('#tab-map').click();
    const map = page.getByTestId('site-map');
    await map.evaluate((el) => window.scrollBy(0, el.getBoundingClientRect().bottom - window.innerHeight + 40));
    const button = page.getByTestId('decor-open');
    await expect(button).toBeInViewport({ ratio: 1 });
    // not under the pinned top bar
    const b = (await button.boundingBox())!;
    const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('[data-testid="decor-open"]') !== null, [b.x + b.width / 2, b.y + b.height / 2]);
    expect(hit).toBe(true);
    await button.click();
    const panel = page.getByTestId('map-decorations');
    await expect(panel).toBeInViewport({ ratio: 1 });
    await expect(page.getByTestId('decor-close')).toBeInViewport({ ratio: 1 });
    await expect(page.getByTestId('decor-done')).toBeInViewport({ ratio: 1 });
    const top = (await page.getByTestId('top-bar').boundingBox())!;
    const p = (await panel.boundingBox())!;
    if (width >= 640) expect(p.y).toBeGreaterThanOrEqual(top.y + top.height);
    await page.getByTestId('decor-done').click();
    await expect(page.getByTestId('decor-open')).toBeFocused();
  });
}

// 1.65: the legend opens from a floating button too; both buttons and the panel stay on screen deep in a tall map.
for (const [width, height] of [[1280, 520], [375, 640]] as const) {
  test(`the legend panel stays reachable deep in a tall map at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('./');
    await page.locator('#tab-map').click();
    const map = page.getByTestId('site-map');
    await map.evaluate((el) => window.scrollBy(0, el.getBoundingClientRect().bottom - window.innerHeight + 40));
    const legend = page.getByTestId('legend-open');
    const decor = page.getByTestId('decor-open');
    await expect(legend).toBeInViewport({ ratio: 1 });
    await expect(decor).toBeInViewport({ ratio: 1 });
    const l = (await legend.boundingBox())!;
    const d = (await decor.boundingBox())!;
    expect(l.x + l.width).toBeLessThanOrEqual(d.x); // side by side, no overlap
    await legend.click();
    const panel = page.getByTestId('legend-panel');
    await expect(panel).toBeInViewport({ ratio: 1 });
    await expect(page.getByTestId('legend-close')).toBeInViewport({ ratio: 1 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    if (width < 640) {
      // the sheet scrolls inside itself; its last line can be scrolled into view
      await page.getByTestId('exclusion-hint').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('exclusion-hint')).toBeInViewport();
    }
    await page.screenshot({ path: `test-results/legend-${width}.png` });
    await page.getByTestId('legend-close').click();
    await expect(page.getByTestId('legend-open')).toBeFocused();
  });
}

// 1.63: the machine tooltip opens beside the machine and stays on screen, however the map is scrolled.
test('a machine tooltip shows beside the machine, near the top and the bottom of the screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto('./');
  await page.locator('#tab-map').click();
  const quarry = page.getByTestId('map-quarry-1');
  const tip = page.getByTestId('machine-tip');
  const bar = (await page.getByTestId('top-bar').boundingBox())!;
  // just under the pinned bar: the tip opens below the machine
  await quarry.evaluate((el, barBottom) => window.scrollBy(0, el.getBoundingClientRect().top - barBottom - 4), bar.y + bar.height);
  await quarry.hover();
  await expect(tip).toBeInViewport({ ratio: 1 });
  await expect(tip).toHaveAttribute('data-side', 'below');
  await expect(tip).toContainText('Stone Quarry');
  const q = (await quarry.boundingBox())!;
  const t = (await tip.boundingBox())!;
  expect(t.y).toBeGreaterThanOrEqual(q.y + q.height);
  // near the bottom of the screen: the tip opens above and stays on screen
  await page.mouse.move(5, 5);
  await quarry.evaluate((el) => window.scrollBy(0, el.getBoundingClientRect().bottom - window.innerHeight + 10));
  await quarry.hover();
  await expect(tip).toBeInViewport({ ratio: 1 });
  await expect(tip).toHaveAttribute('data-side', 'above');
  await page.screenshot({ path: 'test-results/machine-tip.png' });
});

/**
 * Imports a copy of the stored save through Settings → Import save, with
 * `patch` merged into its state and a research running (the save-on-close
 * safeguard would overwrite a save edited in storage before a reload).
 */
async function importSave(page: Page, patch: Record<string, unknown>) {
  const file = await page.waitForFunction(async (patchJson: string) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('megagen-idle');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const raw = await new Promise<unknown>((resolve) => {
      try {
        const get = db.transaction('saves', 'readonly').objectStore('saves').get('megagen-idle-save');
        get.onsuccess = () => resolve(get.result);
        get.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    db.close();
    if (typeof raw !== 'string') return false;
    const save = JSON.parse(raw);
    const state = { ...save.state, ...JSON.parse(patchJson), currentResearch: { id: 'basic_solar', startTime: Date.now(), duration: 3600 } };
    return JSON.stringify({ game: 'megagen-idle', version: save.version, exportedAt: new Date().toISOString(), state });
  }, JSON.stringify(patch));
  await page.locator('#tab-settings').click();
  await page.getByLabel('Import save file').setInputFiles({ name: 'pets.json', mimeType: 'application/json', buffer: Buffer.from((await file.jsonValue()) as string) });
  await page.getByRole('button', { name: /^Load (it|this save)/ }).click();
}

// 1.60: active pets walk along the bottom of a 375px phone without sideways
// scroll, and the research chip and the map buttons stay clickable over them.
test('walking pets leave a 375px phone usable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto('./');
  await expect(page.getByLabel('Energy total')).toBeVisible();
  // a copy of the stored save with two active pets and a running research
  const adult = { stage: 3, growUntil: null, foundAt: 0 };
  await importSave(page, { pets: { active: 'cat', extra: ['eel'], slots: 2, owned: { cat: adult, eel: adult } } });
  await expect(page.getByTestId('walking-pet-cat')).toBeVisible();
  await expect(page.getByTestId('walking-pet-eel')).toBeVisible();
  const topAt = (sel: string) =>
    page.evaluate((s) => {
      const r = document.querySelector(s)!.getBoundingClientRect();
      return !!document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest(s);
    }, sel);
  for (const tab of ['generators', 'map', 'pets', 'settings']) {
    await page.locator(`#tab-${tab}`).click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, tab).toBeLessThanOrEqual(0);
    expect(await topAt('[data-testid="research-chip-dock"] button'), `research chip on ${tab}`).toBe(true);
  }
  await page.locator('#tab-map').click();
  expect(await topAt('[data-testid="decor-open"]')).toBe(true);
  expect(await topAt('[data-testid="legend-open"]')).toBe(true);
  // the layer itself lets clicks through: only the pets take them
  expect(await page.getByTestId('pet-walkers').evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('none');
  await page.getByTestId('walking-pet-cat').dispatchEvent('click');
  await expect(page.getByTestId('walking-pet-cat')).toHaveAttribute('data-playing', 'true');
});

// Owner reports, playtest 25: a hovered generator card (raised to z-40 for its
// tooltip) covered the research chip docked at the bottom, and the walking pets.
test('the research chip and the walking pets stay on top of a hovered card', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto('./');
  await expect(page.getByLabel('Energy total')).toBeVisible();
  const adult = { stage: 3, growUntil: null, foundAt: 0 };
  await importSave(page, { pets: { active: 'cat', extra: [], slots: 1, owned: { cat: adult } } });
  // a still pet (in the middle of the screen) is easy to aim at
  await page.getByRole('checkbox', { name: /Reduce motion/ }).check();
  await page.locator('#tab-generators').click();
  await expect(page.getByTestId('research-chip-dock').locator('button')).toBeVisible();
  await expect(page.getByTestId('walking-pet-cat')).toBeVisible();
  /** Scrolls a build card under the point (x, y), hovers the card, and says whether `sel` is still on top there. */
  const onTopOfHoveredCard = async (sel: string, x: number, y: number) => {
    const card = page.locator('[data-testid^="generator-card-"]:not([data-testid*="body"])').filter({ hasNotText: '🔒' });
    const n = await card.count();
    for (let i = 0; i < n; i++) {
      const b = (await card.nth(i).boundingBox())!;
      if (b.x < x && x < b.x + b.width) {
        // the card's top 60 px above the point: hover it there, clear of the chip and the pets
        await card.nth(i).evaluate((el, yy) => window.scrollBy(0, el.getBoundingClientRect().top - yy + 60), y);
        const box = (await card.nth(i).boundingBox())!;
        expect(box.y < y && y < box.y + box.height, 'the card lies under the point').toBe(true);
        await page.mouse.move(x, box.y + 10);
        expect(await card.nth(i).evaluate((el) => getComputedStyle(el).zIndex)).toBe('40');
        return page.evaluate(([px, py, s]) => !!document.elementFromPoint(px as number, py as number)?.closest(s as string), [x, y, sel]);
      }
    }
    throw new Error(`no build card under x=${x}`);
  };
  const c = (await page.getByTestId('research-chip-dock').locator('button').boundingBox())!;
  expect(await onTopOfHoveredCard('[data-testid="research-chip-dock"]', c.x + 20, c.y + c.height / 2)).toBe(true);
  const p = (await page.getByTestId('walking-pet-cat').boundingBox())!;
  expect(await onTopOfHoveredCard('[data-testid="walking-pet-cat"]', p.x + p.width / 2, p.y + p.height / 2)).toBe(true);
});

// 1.69: the Cosmetics section folds away; the Achievements tab fits a 360px phone open or closed.
test('the Cosmetics section opens and closes with no sideways scroll at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('./');
  await page.locator('#tab-achievements').click();
  const toggle = page.getByTestId('cosmetics-toggle');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(await overflow()).toBeLessThanOrEqual(0);
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByTestId('cosmetics-summary')).toBeVisible();
  await expect(page.getByTestId('title-tiers')).toHaveCount(0);
  expect(await overflow()).toBeLessThanOrEqual(0);
  await page.screenshot({ path: 'test-results/cosmetics-closed-360.png' });
  await page.keyboard.press(' ');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
});

// 1.70: Remove all and its question fit a 375px phone.
test('Remove all decorations and its question fit a 375px phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto('./');
  await expect(page.getByLabel('Energy total')).toBeVisible();
  await importSave(page, { decorationsBought: { tree: 1, flag: 1 }, mapDecorations: { 10: 'tree', 11: 'flag' } });
  await page.locator('#tab-map').click();
  await page.getByTestId('decor-open').click();
  const onScreen = async (testId: string) => {
    const box = (await page.getByTestId(testId).boundingBox())!;
    expect(box.x, testId).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, testId).toBeLessThanOrEqual(375);
    expect(box.y, testId).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height, testId).toBeLessThanOrEqual(700);
  };
  await onScreen('decor-remove-all');
  await page.getByTestId('decor-remove-all').click();
  await expect(page.getByTestId('decor-remove-all-confirm')).toBeVisible();
  await onScreen('decor-remove-all-yes');
  await onScreen('decor-remove-all-cancel');
  await page.screenshot({ path: 'test-results/decor-remove-all-375.png' });
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('decor-remove-all-confirm')).toHaveCount(0);
  await expect(page.getByTestId('map-decorations')).toBeVisible();
  await expect(page.getByTestId('decor-remove-all')).toBeFocused();
  await page.getByTestId('decor-remove-all').click();
  await page.getByTestId('decor-remove-all-yes').click();
  await expect(page.getByTestId('decor-remove-all')).toBeDisabled();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

// 1.71: working machines animate on a large site; switched-off ones stay still.
test('working machines animate on the map at 1280px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./');
  await expect(page.getByLabel('Energy total')).toBeVisible();
  const types = ['solar', 'wind', 'coal', 'hydro', 'tidal', 'gas', 'oil', 'nuclear', 'fusion', 'supernova'];
  const activeGenerators = types.flatMap((type) => [1, 2].map((i) => ({ id: `${type}-${i}`, type, isActive: !(type === 'solar' && i === 2), level: 1 })));
  const producers = { quarry: 2, mine: 2, coalMine: 2, gasWell: 2, oilRig: 2, uraniumMine: 2, deuteriumExtractor: 2 };
  await importSave(page, { activeGenerators, producers, roomCapacity: 400, resources: { coal: 1e9, stone: 1e9, metal: 1e9, naturalGas: 1e9, oil: 1e9, uranium: 1e9, deuterium: 1e9 } });
  await page.locator('#tab-map').click();
  await expect(page.locator('[data-anim="on"]').first()).toBeVisible();
  expect(await page.locator('.frame-b').count()).toBeGreaterThan(0);
  for (const fx of ['glint', 'smoke', 'steam', 'glow', 'bubbles']) expect(await page.locator(`[data-fx="${fx}"]`).count(), fx).toBeGreaterThan(0);
  expect(await page.locator('[data-frame2="producer_quarry_2"]').count()).toBeGreaterThan(0);
  await expect(page.locator('[data-testid="map-solar-2"] [data-testid="machine-sprite"]')).toHaveAttribute('data-anim', 'still');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.getByTestId('site-map').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/machines-animated-1280.png' });
});
