import { expect, test } from '@playwright/test';

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
