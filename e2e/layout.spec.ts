import { expect, test } from '@playwright/test';

// Responsive layout and keyboard access (0.41): no tab scrolls the page
// sideways at phone, tablet or desktop width, and the main loop works from
// the keyboard alone.
const TABS = ['Generators', 'Map', 'Producers', 'Research', 'Contracts', 'Pets', 'Achievements', 'Completion', 'Guide', 'Settings'];

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
