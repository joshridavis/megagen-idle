import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setEditionForTests } from '../data/edition';
import { createInitialState } from '../data/initialState';
import { FREE_MAX_RESEARCH_LEVEL } from '../data/purchases';
import { RESEARCH } from '../data/research';
import * as links from '../site/links';
import { useStore } from '../store';
import { exportSave, parseSaveFile } from '../utils/saveFile';
import { atFreeBoundary } from '../utils/purchases';
import { FullGameButton, FullGameDialog, fullGameStores, SupportLink } from '../components/Purchases';
import { createTestStore, noStore, type KeyValue } from './purchases';
import { hasFullGame, hasSupporter, purchase, restore } from './entitlements';

const memory = (): KeyValue => {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
};
const savedUrls = links.STORES.map((s) => s.url);

afterEach(async () => {
  cleanup();
  setEditionForTests(null);
  links.STORES.forEach((s, i) => (s.url = savedUrls[i]));
  await useStore.getState().initPurchases(noStore);
  useStore.getState().resetGame();
  useStore.setState({ entitlements: { fullGame: false, supporter: false }, purchaseMessage: null, fullGameOpen: false, fullGameAutoShown: false });
});

describe('the entitlement layer per edition (2.04)', () => {
  it('demo: neither product, nothing to buy or restore, the store is never asked', async () => {
    setEditionForTests('demo');
    const store = createTestStore(memory());
    const buy = vi.spyOn(store, 'buy');
    await useStore.getState().initPurchases(store);
    useStore.setState({ entitlements: { fullGame: true, supporter: true } }); // an edited save
    expect(useStore.getState().storeActive).toBe(false);
    expect(hasFullGame()).toBe(false);
    expect(hasSupporter()).toBe(false);
    expect(await purchase('full_game')).toBe(false);
    expect(await restore()).toEqual([]);
    expect(buy).not.toHaveBeenCalled();
  });

  it('full: the whole game is open without a store; the Supporter Pack comes from the store', async () => {
    setEditionForTests('full');
    await useStore.getState().initPurchases(noStore);
    expect(hasFullGame()).toBe(true);
    expect(hasSupporter()).toBe(false);
    const storage = memory();
    await createTestStore(storage).buy('supporter_pack');
    await useStore.getState().initPurchases(createTestStore(storage));
    expect(hasSupporter()).toBe(true);
  });

  it('mobile: locked until the store owns full_game; an edited save unlocks nothing', async () => {
    setEditionForTests('mobile');
    useStore.setState({ entitlements: { fullGame: true, supporter: false } });
    await useStore.getState().initPurchases(noStore); // no RevenueCat yet (1.97): nothing owned
    expect(useStore.getState().storeActive).toBe(true);
    expect(hasFullGame()).toBe(false);
    await useStore.getState().initPurchases(createTestStore(memory()));
    expect(await purchase('full_game')).toBe(true);
    expect(hasFullGame()).toBe(true);
    expect(await restore()).toEqual(['full_game']);
  });

  it("the demo finds the end of the free part without the Full Game's research", () => {
    setEditionForTests('demo');
    const s = { ...createInitialState(0), completedResearch: [] as string[] };
    expect(atFreeBoundary(s)).toBe(false);
    expect(atFreeBoundary({ ...s, completedResearch: ['oil_drilling'] })).toBe(true);
  });
});

describe('the "Get the Full Game" panel (2.04)', () => {
  const atBoundary = () => {
    useStore.setState({ researchLevel: 20, completedResearch: RESEARCH.filter((d) => d.requiredLevel <= FREE_MAX_RESEARCH_LEVEL).map((d) => d.id) });
  };

  it('opens by itself at most once per session; the top bar button always opens it', () => {
    setEditionForTests('demo');
    render(<FullGameDialog />);
    act(() => useStore.getState().offerFullGame('boundary'));
    expect(screen.getByTestId('full-game-panel')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByTestId('full-game-panel')).toBeNull();
    act(() => useStore.getState().offerFullGame('locked'));
    act(() => useStore.getState().offerFullGame('boundary'));
    expect(screen.queryByTestId('full-game-panel')).toBeNull();
    act(() => useStore.getState().offerFullGame('button'));
    expect(screen.getByTestId('full-game-panel')).toBeTruthy();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('full-game-panel')).toBeNull();
  });

  it('says what comes next, that the save carries over, and the promise', () => {
    setEditionForTests('demo');
    render(<FullGameDialog />);
    act(() => useStore.getState().offerFullGame('button'));
    const text = screen.getByTestId('full-game-panel').textContent!;
    for (const words of ['Oil Power Plant', 'Nuclear Fission Plant', 'Fusion Reactor', 'Micro-Supernova', 'Your save carries over.', 'Buy once. No ads. No pay-to-win.']) {
      expect(text).toContain(words);
    }
    expect(text).not.toMatch(/MegaGen(?! Idle)/);
  });

  it('web demo: a link per store with a page, or the launch line while there is none', () => {
    setEditionForTests('demo');
    render(<FullGameDialog />);
    act(() => useStore.getState().offerFullGame('button'));
    expect(screen.getByTestId('full-game-coming').textContent).toContain('March 11, 2027');
    expect(screen.queryByTestId('buy-full_game')).toBeNull();
    cleanup();
    links.STORES[0].url = 'https://store.steampowered.com/app/1/';
    links.STORES[1].url = 'https://play.google.com/store/apps/details?id=com.megagenidle.game';
    render(<FullGameDialog />);
    expect(screen.getByTestId('full-game-store-steam').getAttribute('href')).toBe('https://store.steampowered.com/app/1/');
    expect(screen.getByTestId('full-game-store-google-play')).toBeTruthy();
    expect(screen.queryByTestId('full-game-store-app-store')).toBeNull(); // empty link: hidden
  });

  it('Steam demo: only the Steam store page', () => {
    links.STORES.forEach((s) => (s.url = `https://example.com/${s.id}`));
    expect(fullGameStores('desktop').map((s) => s.id)).toEqual(['steam']);
    expect(fullGameStores('web').map((s) => s.id)).toEqual(['steam', 'google-play', 'app-store']);
  });

  it('mobile: a buy button with the store price and Restore purchases', async () => {
    setEditionForTests('mobile');
    await useStore.getState().initPurchases(createTestStore(memory()));
    render(<FullGameDialog />);
    act(() => useStore.getState().offerFullGame('button'));
    expect(screen.getByTestId('buy-full_game').textContent).toContain('Test: free');
    expect(screen.getByTestId('restore-purchases')).toBeTruthy();
    expect(screen.queryByTestId('full-game-stores')).toBeNull();
  });

  it('opens by itself at the end of the free part (mobile, locked)', async () => {
    setEditionForTests('mobile');
    await useStore.getState().initPurchases(noStore);
    atBoundary();
    const { FullGameBanner } = await import('../components/Purchases');
    render(
      <>
        <FullGameBanner />
        <FullGameDialog />
      </>,
    );
    expect(screen.getByTestId('full-game-banner')).toBeTruthy();
    expect(screen.getByTestId('full-game-panel')).toBeTruthy();
  });

  it('the top bar button: in the demo and the locked mobile edition, never in the full game', async () => {
    setEditionForTests('demo');
    render(<FullGameButton />);
    expect(screen.getByTestId('full-game-button')).toBeTruthy();
    cleanup();
    setEditionForTests('full');
    render(<FullGameButton />);
    expect(screen.queryByTestId('full-game-button')).toBeNull();
    cleanup();
    setEditionForTests('mobile');
    const storage = memory();
    await useStore.getState().initPurchases(createTestStore(storage));
    render(<FullGameButton />);
    expect(screen.getByTestId('full-game-button')).toBeTruthy();
    await act(async () => {
      await purchase('full_game');
    });
    expect(screen.queryByTestId('full-game-button')).toBeNull();
  });

  it('the Ko-fi link shows in the web demo only', () => {
    setEditionForTests('demo');
    render(<SupportLink />);
    expect(screen.getByRole('link', { name: 'Support the developer on Ko-fi' }).getAttribute('href')).toBe(links.KOFI_URL);
    cleanup();
    setEditionForTests('full');
    render(<SupportLink />);
    expect(screen.queryByTestId('support-link')).toBeNull();
  });
});

describe('a demo save carries over (2.04)', () => {
  it('loads unchanged in the full and mobile editions', () => {
    setEditionForTests('demo');
    const free = RESEARCH.filter((d) => d.requiredLevel <= 5).map((d) => d.id);
    const demo = { ...createInitialState(1_000), energy: 12_345, lifetimeEnergy: 99_999, completedResearch: free, researchLevel: free.length + 1 };
    const file = exportSave(demo, 2_000);
    const inDemo = parseSaveFile(file, 3_000);
    expect(inDemo.ok).toBe(true);
    for (const e of ['full', 'mobile'] as const) {
      setEditionForTests(e);
      const r = parseSaveFile(file, 3_000);
      expect(r.ok, e).toBe(true);
      if (r.ok && inDemo.ok) expect(r.state, e).toEqual(inDemo.state);
    }
  });

  it('the demo explains a save with Full Game progress instead of calling it damaged', () => {
    setEditionForTests('demo');
    const file = JSON.parse(exportSave(createInitialState(0), 0));
    file.state.completedResearch = ['no_such_research_from_the_full_game'];
    const r = parseSaveFile(JSON.stringify(file), 0);
    expect(r).toEqual({ ok: false, error: 'This save has progress from the Full Game, which this free version cannot open.' });
  });
});
