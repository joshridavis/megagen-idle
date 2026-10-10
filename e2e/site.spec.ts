import { expect, test } from '@playwright/test';

// The website (1.94, 2.05): the landing page at the site root, the game at
// /play/, and the press, privacy, terms, support and 404 pages.

const PAGES = ['/', '/press/', '/privacy/', '/terms/', '/support/', '/404.html'];

for (const width of [360, 1280]) {
  test(`every site page loads at ${width}px without sideways scroll or errors`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const path of PAGES) {
      const res = await page.goto(path);
      expect(res?.ok(), path).toBe(true);
      await expect(page).toHaveTitle(/MegaGen Idle/);
      await expect(page.getByTestId('site-footer')).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
    }
    expect(errors).toEqual([]);
  });
}

test('the landing page: empty links hide their buttons; the sharing picture, sitemap, robots and press kit are served', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'MegaGen Idle', level: 1 })).toBeVisible();
  await expect(page.getByTestId('launch')).toHaveText('Coming March 11, 2027 to PC, Android and iPhone');
  // Steam, Discord, the store pages and the trailer have no link yet
  await expect(page.getByTestId('wishlist')).toHaveCount(0);
  await expect(page.getByTestId('discord')).toHaveCount(0);
  await expect(page.getByTestId('stores').locator('a')).toHaveCount(0);
  await expect(page.getByTestId('trailer')).toHaveCount(0);
  await expect(page.getByTestId('features').locator('li')).toHaveCount(6);
  await expect(page.getByTestId('gallery').locator('img')).toHaveCount(4);
  for (const f of ['og-image.png', 'sitemap.xml', 'robots.txt', 'press-kit.zip', 'screens/early-game.jpg']) {
    const res = await page.request.get(`/${f}`);
    expect(res.ok(), f).toBe(true);
  }
  // the old privacy address still leads to the page
  await page.goto('/privacy.html');
  await expect(page).toHaveURL(/\/privacy\/$/);
});

test('"Play free in your browser" reaches the game at /play/, which saves and reloads', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByTestId('play-now').click();
  await expect(page).toHaveURL(/\/play\/$/);
  const energy = page.getByLabel('Energy total');
  await expect(energy).toHaveText('900');
  const click = page.getByTestId('click-button');
  for (let i = 0; i < 3; i++) await click.click();
  await expect(energy).toHaveText('903');
  await expect
    .poll(() => page.evaluate(() => new Promise<boolean>((resolve) => {
      const req = indexedDB.open('megagen-idle');
      req.onerror = () => resolve(false);
      req.onsuccess = () => {
        try {
          const get = req.result.transaction('saves', 'readonly').objectStore('saves').get('megagen-idle-save');
          get.onsuccess = () => resolve(typeof get.result === 'string' && JSON.parse(get.result).state.energy >= 903);
          get.onerror = () => resolve(false);
        } catch {
          resolve(false);
        }
      };
    })))
    .toBe(true);
  await page.reload();
  await expect(energy).not.toHaveText('900');
  expect(errors).toEqual([]);
});
