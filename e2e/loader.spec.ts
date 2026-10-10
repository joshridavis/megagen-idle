import { expect, test } from '@playwright/test';

// The loading screen (1.49) is drawn by index.html before any script runs.

test('the loading screen shows before the game starts and is gone after', async ({ page }) => {
  // hold the game's script back a moment, so the page without it can be checked
  let release!: () => void;
  const held = new Promise<void>((r) => (release = r));
  await page.route(/\/assets\/index-[^/]*\.js$/, async (route) => {
    await held;
    await route.continue();
  });
  await page.goto('./', { waitUntil: 'commit' }); // the module script delays DOMContentLoaded
  const loader = page.getByTestId('boot-loader');
  await expect(loader).toBeVisible();
  await expect(loader.getByText('Charging up…')).toBeVisible();
  await expect(loader.getByRole('img', { name: 'MegaGen Idle' })).toBeVisible();
  await expect(page.getByTestId('energy-display')).toHaveCount(0);
  release();
  await expect(page.getByLabel('Energy total')).toHaveText('900');
  await expect(loader).toHaveCount(0);
});

test('when the game cannot start, the loading screen says so', async ({ page }) => {
  await page.route(/\/assets\/index-[^/]*\.js$/, (route) => route.abort());
  await page.goto('./');
  await expect(page.getByTestId('boot-failed')).toHaveText('Could not load the game. Reload the page.');
  await expect(page.getByText('Charging up…')).toBeHidden();
});
