import { expect, test, type Page } from '@playwright/test';
/**
 * Waits until the game's IndexedDB save (written asynchronously by
 * localforage) satisfies `check`, so a reload cannot race the save.
 * Polls the real stored value; no fixed sleeps.
 */
async function waitForSaved(page: Page, check: string) {
  await page.waitForFunction(
    async (body) =>
      new Promise<boolean>((resolve) => {
        const req = indexedDB.open('megagen-idle');
        req.onerror = () => resolve(false);
        req.onsuccess = () => {
          const db = req.result;
          try {
            const get = db.transaction('saves', 'readonly').objectStore('saves').get('megagen-idle-save');
            get.onsuccess = () => {
              db.close();
              const raw = get.result;
              if (typeof raw !== 'string') return resolve(false);
              const state = JSON.parse(raw).state;
              resolve(Boolean(new Function('state', `return (${body});`)(state)));
            };
            get.onerror = () => resolve(false);
          } catch {
            db.close();
            resolve(false);
          }
        };
      }),
    check,
  );
}


// End-to-end smoke test: no real-time waits. Playwright's auto-waiting
// assertions poll the UI; nothing depends on the idle clock advancing.
test('load, click, build, research, reload: state persists', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('./');
  const energy = page.getByLabel('Energy total');
  await expect(energy).toHaveText('900');

  // click for energy
  const click = page.getByRole('button', { name: 'Generate energy' });
  for (let i = 0; i < 5; i++) await click.click();
  await expect(energy).toHaveText('905');

  // build the first generator (900 energy + 10 metal)
  await page.getByRole('button', { name: 'Build Solar Panel' }).click();
  await expect(page.getByText('Solar Panel #1')).toBeVisible();
  await expect(page.getByLabel('Energy rate')).toHaveText('+0.50/s');

  // earn enough for the first research by clicking (250 energy)
  for (let i = 0; i < 250; i++) await click.click();

  // start research
  await page.getByRole('tab', { name: 'Research' }).click();
  await page.getByTestId('research-node-basic_solar').click();
  await page.getByRole('button', { name: 'Start research' }).click();
  await expect(page.getByRole('dialog').getByRole('progressbar')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText('Researching: Basic Solar')).toBeVisible();

  // reload: generator and research survive (wait for the async save first)
  await waitForSaved(page, "state.currentResearch?.id === 'basic_solar' && state.activeGenerators.length === 1");
  await page.reload();
  await expect(page.getByText('Solar Panel #1')).toBeVisible();
  await page.getByRole('tab', { name: 'Research' }).click();
  await expect(page.getByText('Researching: Basic Solar')).toBeVisible();

  expect(errors).toEqual([]);
});

// Save-on-close safeguard (0.76): simulate a tab that closes before the
// asynchronous IndexedDB save lands by dropping every IndexedDB write after
// the game has loaded. Only the synchronous backup can carry the action over
// the reload. Deterministic: no timing involved.
test('actions just before closing the tab are not lost', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByLabel('Energy total')).toHaveText('900');
  await page.evaluate(() => {
    const noop = function (this: IDBObjectStore) {
      return {} as IDBRequest;
    };
    IDBObjectStore.prototype.put = noop;
    IDBObjectStore.prototype.add = noop;
  });
  await page.getByRole('button', { name: 'Build Solar Panel' }).click();
  await page.reload();
  await expect(page.getByText('Solar Panel #1')).toBeVisible();
});
