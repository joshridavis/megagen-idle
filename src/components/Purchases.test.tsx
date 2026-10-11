import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { FREE_MAX_RESEARCH_LEVEL } from '../data/purchases';
import { RESEARCH } from '../data/research';
import { createTestStore, noStore, type KeyValue, type PurchaseStore } from '../platform/purchases';
import { useStore } from '../store';
import AchievementsPanel from './AchievementsPanel';
import { FullGameDialog } from './Purchases';
import ResearchTree from './ResearchTree';
import SettingsPanel from './SettingsPanel';

const memory = (): KeyValue => {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
};

afterEach(async () => {
  cleanup();
  await useStore.getState().initPurchases(noStore);
  useStore.getState().resetGame();
  useStore.setState({ entitlements: { fullGame: false, supporter: false }, purchaseMessage: null, fullGameOpen: false, fullGameAutoShown: false });
});

const atBoundary = () => {
  const free = RESEARCH.filter((d) => d.requiredLevel <= FREE_MAX_RESEARCH_LEVEL).map((d) => d.id);
  useStore.setState({ researchLevel: 20, completedResearch: free });
};

describe('the test store (1.95)', () => {
  it('buys, remembers and restores; a cancelled purchase owns nothing', async () => {
    const storage = memory();
    const store = createTestStore(storage);
    expect(store.name).toBe('test');
    expect((await store.products()).map((p) => p.id)).toEqual(['full_game', 'supporter_pack']);
    expect(await store.owned()).toEqual([]);
    expect(await store.buy('full_game')).toBe(true);
    expect(await createTestStore(storage).restore()).toEqual(['full_game']);
    const no = createTestStore(memory(), () => false);
    expect(await no.buy('supporter_pack')).toBe(false);
    expect(await no.owned()).toEqual([]);
  });

  it('no store has nothing to buy', async () => {
    expect(await noStore.products()).toEqual([]);
    expect(await noStore.buy('full_game')).toBe(false);
  });
});

describe('purchases in the store (1.95)', () => {
  it('on start the store decides what is owned, not the save', async () => {
    useStore.setState({ entitlements: { fullGame: true, supporter: true } });
    await useStore.getState().initPurchases(createTestStore(memory()));
    expect(useStore.getState().storeActive).toBe(true);
    expect(useStore.getState().entitlements).toEqual({ fullGame: false, supporter: false });
  });

  it('without a store the save is kept and the game stays open', async () => {
    useStore.setState({ entitlements: { fullGame: false, supporter: true } });
    await useStore.getState().initPurchases(noStore);
    expect(useStore.getState().storeActive).toBe(false);
    expect(useStore.getState().entitlements.supporter).toBe(true);
  });

  it('a reset keeps purchases; a store that fails keeps the saved ones', async () => {
    const broken: PurchaseStore = { ...noStore, name: 'test', restore: () => Promise.reject(new Error('offline')) };
    useStore.setState({ entitlements: { fullGame: true, supporter: false } });
    await useStore.getState().initPurchases(broken);
    expect(useStore.getState().entitlements.fullGame).toBe(true);
    useStore.getState().resetGame();
    expect(useStore.getState().entitlements.fullGame).toBe(true);
  });
});

describe('the Full Game panel (1.95, a panel and a banner since 2.04)', () => {
  it('shows only at the end of the free part with a store, and goes once the Full Game is bought', async () => {
    atBoundary();
    render(
      <>
        <ResearchTree />
        <FullGameDialog />
      </>,
    );
    expect(screen.queryByTestId('full-game-banner')).toBeNull(); // no store: everything open
    expect(screen.queryByTestId('full-game-panel')).toBeNull();
    await act(async () => {
      await useStore.getState().initPurchases(createTestStore(memory()));
    });
    expect(screen.getByTestId('full-game-banner').textContent).toContain('Everything you built keeps working');
    // it opened by itself at the boundary
    const panel = screen.getByTestId('full-game-panel');
    expect(panel.textContent).toContain('Your save carries over.');
    expect(panel.textContent).toContain('Buy once. No ads. No pay-to-win.');
    expect(screen.getByTestId('buy-full_game').textContent).toContain('Test: free');
    await act(async () => {
      fireEvent.click(screen.getByTestId('buy-full_game'));
    });
    expect(useStore.getState().entitlements.fullGame).toBe(true);
    expect(screen.queryByTestId('full-game-banner')).toBeNull();
    expect(screen.getByTestId('owned-full_game')).toBeTruthy();
  });

  it('a new player with a store sees no panel', async () => {
    await useStore.getState().initPurchases(createTestStore(memory()));
    render(
      <>
        <ResearchTree />
        <FullGameDialog />
      </>,
    );
    expect(screen.queryByTestId('full-game-banner')).toBeNull();
    expect(screen.queryByTestId('full-game-panel')).toBeNull();
  });
});

describe('Settings → Purchases and the Supporter Pack (1.95)', () => {
  it('purchases show only where a store exists; the pack adds thanks in the credits and its cosmetics', async () => {
    render(<SettingsPanel />);
    expect(screen.queryByTestId('purchases-settings')).toBeNull();
    expect(screen.queryByTestId('supporter-thanks')).toBeNull();
    const storage = memory();
    await act(async () => {
      await useStore.getState().initPurchases(createTestStore(storage));
    });
    expect(screen.getByTestId('purchases-settings')).toBeTruthy();
    await act(async () => {
      fireEvent.click(screen.getByTestId('buy-supporter_pack'));
    });
    expect(screen.getByTestId('owned-supporter_pack')).toBeTruthy();
    expect(screen.getByTestId('supporter-thanks')).toBeTruthy();
    expect(useStore.getState().entitlements).toEqual({ fullGame: false, supporter: true });
    cleanup();
    render(<AchievementsPanel />);
    fireEvent.click(screen.getByTestId('accent-supporter'));
    expect(useStore.getState().settings.cosmetics.accent).toBe('supporter');
    expect(screen.getByTestId('title-option-supporter')).toBeTruthy();
  });

  it('without the pack its accent cannot be picked', () => {
    useStore.getState().setCosmetics({ accent: 'supporter', title: 'supporter' });
    expect(useStore.getState().settings.cosmetics).toEqual(createInitialState(0).settings.cosmetics);
  });
});
