import { expect, test } from '@playwright/test';

// The public website (1.94): a landing page at the site root, the game at /play/.

test('the landing page loads and "Play now" reaches the game, which saves at its new path', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('../');
  await expect(page).toHaveTitle(/MegaGen Idle/);
  await expect(page.getByRole('img', { name: 'MegaGen Idle', exact: true })).toBeVisible();
  await expect(page.getByTestId('pitch')).toBeVisible();
  await expect(page.getByRole('heading', { name: /March 11, 2027 to Steam, Google Play and the App Store/ })).toBeVisible();
  await expect(page.getByTestId('stores').getByRole('listitem')).toHaveCount(3);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og-image\.png$/);
  const og = await page.request.get('../og-image.png');
  expect(og.ok()).toBe(true);
  await expect(page.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', 'privacy.html');

  await page.getByTestId('play-now').click();
  await expect(page).toHaveURL(/\/play\/$/);
  const energy = page.getByLabel('Energy total');
  await expect(energy).toHaveText('900');
  const click = page.getByTestId('click-button');
  for (let i = 0; i < 3; i++) await click.click();
  await expect(energy).toHaveText('903');
  // the save outlives a reload at the new path
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

test('the landing page fits a 375px phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('../');
  await expect(page.getByTestId('play-now')).toBeVisible();
  const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scroll).toBeLessThanOrEqual(375);
});
