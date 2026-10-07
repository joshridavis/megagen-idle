import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import MapPanel from '../components/MapPanel';
import { DECORATION_LIMIT, DECORATION_PRICE_GROWTH, DECORATIONS, DECORATIONS_BY_ID } from '../data/decorations';
import { ACHIEVEMENTS_BY_ID } from '../data/achievements';
import { getCompletion } from './completion';
import { newlyEarned } from './achievements';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';
import { migrateSave, pickSaved, SAVE_VERSION } from '../store/migrations';
import { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { buyBlock, buyDecoration, decorationPrice, isDecorationUnlocked, placeBlock, placeDecoration, removeAllDecorations, removeDecoration, unlockedDecorations } from './decorations';
import { energyForLevel } from './playerLevel';
import { deriveRates } from './simulation';
import { getProducerPlacement, layoutSite } from './siteMap';

afterEach(cleanup);

/** Owns every copy of every kind unless the test says otherwise (1.53: copies are bought before placing). */
const ALL_OWNED = Object.fromEntries(DECORATIONS.map((d) => [d.id, DECORATION_LIMIT]));
const s0 = (extra: Partial<GameState> = {}): GameState =>
  deriveRates({ ...createInitialState(0), roomCapacity: 48, energy: 1e9, decorationsBought: ALL_OWNED, ...extra });
const achieved = (n: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => [`a${i}`, 1]));
/** A free tile: inside the site and not under a machine. */
const freeTile = (s: GameState) => {
  const taken = new Set(layoutSite(s).placed.flatMap((p) => p.cells));
  return [...Array(layoutSite(s).capacity).keys()].find((c) => !taken.has(c))!;
};

describe('map decorations (1.13)', () => {
  it('unlock with player levels, achievements and contracts', () => {
    const fresh = s0();
    expect(unlockedDecorations(fresh)).toEqual([]);
    expect(isDecorationUnlocked({ ...fresh, lifetimeEnergy: energyForLevel(5) }, 'tree')).toBe(true);
    expect(isDecorationUnlocked({ ...fresh, achievements: achieved(5) }, 'flag')).toBe(true);
    expect(isDecorationUnlocked({ ...fresh, achievements: achieved(14) }, 'windsock')).toBe(false);
    expect(isDecorationUnlocked({ ...fresh, contracts: { ...fresh.contracts, done: 10 } }, 'pond')).toBe(true);
    expect(isDecorationUnlocked({ ...fresh, contracts: { ...fresh.contracts, done: 50 } }, 'statue')).toBe(true);
    const all = { ...fresh, lifetimeEnergy: energyForLevel(20), achievements: achieved(15), contracts: { ...fresh.contracts, done: 50 } };
    expect(unlockedDecorations(all)).toHaveLength(DECORATIONS.length);
  });

  it('go on free site tiles only, up to a limit of each, and can be removed', () => {
    const s = s0({ lifetimeEnergy: energyForLevel(5) });
    const tile = freeTile(s);
    const machine = layoutSite(s).placed[0].cells[0];
    expect(placeBlock(s0(), 'tree', tile)).toBe('Not unlocked yet.');
    expect(placeBlock(s, 'tree', machine)).toBe('A machine stands there.');
    expect(placeBlock(s, 'tree', layoutSite(s).capacity)).toBe('Decorations go inside your site.');
    const once = placeDecoration(s, 'tree', tile)!;
    expect(once[tile]).toBe('tree');
    expect(placeBlock({ ...s, mapDecorations: once }, 'tree', tile)).toBe('Something is already there.');
    const full = Object.fromEntries(Array.from({ length: DECORATION_LIMIT }, (_, i) => [1000 + i, 'tree' as const]));
    expect(placeBlock({ ...s, mapDecorations: full }, 'tree', tile)).toBe(`All ${DECORATION_LIMIT} you own are placed: buy another first.`);
    expect(removeDecoration(once, tile)).toEqual({});
    expect(removeDecoration({}, tile)).toBeNull();
  });

  it('never block machines and change no rates', () => {
    const s = s0({ lifetimeEnergy: energyForLevel(5) });
    // cover every free tile with trees (ignoring the limit), then build a machine
    const taken = new Set(layoutSite(s).placed.flatMap((p) => p.cells));
    const decor = Object.fromEntries([...Array(48).keys()].filter((c) => !taken.has(c)).map((c) => [c, 'tree' as const]));
    const withSolar = (d: GameState['mapDecorations']) =>
      deriveRates({ ...s, mapDecorations: d, activeGenerators: [...s.activeGenerators, { id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 }] });
    const plain = withSolar({});
    const decorated = withSolar(decor);
    expect(layoutSite(decorated).placed.find((p) => p.key === 'gen-1')!.misplaced).toBe(false);
    expect(decorated.energyPerSecond).toBe(plain.energyPerSecond);
    expect(getProducerPlacement(decorated)).toEqual(getProducerPlacement(plain));
  });

  it('are saved, and old saves load with none', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(20);
    const old = { ...createInitialState(0) } as Record<string, unknown>;
    delete old.mapDecorations;
    expect(migrateSave(old, 19).mapDecorations).toEqual({});
    expect(pickSaved({ ...createInitialState(0), mapDecorations: { 3: 'pond' } }).mapDecorations).toEqual({ 3: 'pond' });
  });

  it('are placed and removed from the Map tab; a machine hides one', () => {
    useStore.getState().resetGame();
    const s = s0({ lifetimeEnergy: energyForLevel(5) });
    useStore.setState(s);
    const tile = freeTile(s);
    const { container } = render(<MapPanel onSelect={() => {}} />);
    fireEvent.click(screen.getByTestId('decor-open'));
    expect((screen.getByTestId('decor-pick-pond') as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByTestId('decor-pick-tree'));
    const tiles = container.querySelectorAll('[data-terrain]:not([data-terrain="sea"])');
    fireEvent.click(tiles[tile]);
    expect(useStore.getState().mapDecorations[tile]).toBe('tree');
    expect(screen.getByTestId(`decor-${tile}`)).toBeTruthy();
    // clicking a machine places nothing
    fireEvent.click(screen.getByTestId('map-quarry-1'));
    expect(screen.getByTestId('map-info').textContent).toContain('A machine stands there');
    fireEvent.click(screen.getByTestId('decor-remove'));
    fireEvent.click(tiles[tile]);
    expect(useStore.getState().mapDecorations).toEqual({});
    // a decoration under a machine is not drawn
    cleanup();
    const machine = layoutSite(s).placed[0].cells[0];
    useStore.setState({ mapDecorations: { [machine]: 'tree' } });
    render(<MapPanel onSelect={() => {}} />);
    expect(screen.queryByTestId(`decor-${machine}`)).toBeNull();
  });

  it('live in a panel over the map: open, place while open, Close and Escape end decorating (1.47, 1.64)', async () => {
    useStore.getState().resetGame();
    const s = s0({ lifetimeEnergy: energyForLevel(5) });
    useStore.setState(s);
    const tile = freeTile(s);
    const { container } = render(<MapPanel onSelect={() => {}} />);
    // nothing about decorations under the map until the button opens the panel
    expect(screen.queryByTestId('map-decorations')).toBeNull();
    expect(screen.queryByTestId('decor-pick-tree')).toBeNull();
    // the button floats on the screen (1.64), so it is reachable however far the map is scrolled
    expect(screen.getByTestId('decor-open').parentElement!.className).toContain('fixed');
    fireEvent.click(screen.getByTestId('decor-open'));
    const panel = screen.getByTestId('map-decorations');
    expect(screen.queryByTestId('decor-open')).toBeNull(); // the panel takes its place
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(document.activeElement).toBe(panel);
    // a locked one still says what unlocks it
    expect(screen.getByTestId('decor-pick-pond').textContent).toContain('🔒');
    // place with the panel open, and the map still there
    fireEvent.click(screen.getByTestId('decor-pick-tree'));
    const tiles = container.querySelectorAll('[data-terrain]:not([data-terrain="sea"])');
    fireEvent.click(tiles[tile]);
    expect(useStore.getState().mapDecorations[tile]).toBe('tree');
    expect(screen.getByTestId('map-decorations')).toBeTruthy();
    // Close ends decorating and gives focus back to the button
    fireEvent.click(screen.getByTestId('decor-close'));
    expect(screen.queryByTestId('map-decorations')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByTestId('decor-open')));
    expect(screen.getByTestId('map-info').textContent).not.toContain('Placing');
    // Escape (from anywhere) closes it too, and the tool is gone
    fireEvent.click(screen.getByTestId('decor-open'));
    fireEvent.click(screen.getByTestId('decor-pick-tree'));
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(screen.queryByTestId('map-decorations')).toBeNull();
    expect(screen.getByTestId('map-info').textContent).not.toContain('Placing');
  });
});

describe('decorations bought with energy, then placed freely (1.53, owner playtest 24)', () => {
  const unlockedAll = (extra: Partial<GameState> = {}) =>
    s0({ lifetimeEnergy: energyForLevel(20), achievements: achieved(15), contracts: { ...createInitialState(0).contracts, done: 50 }, ...extra });

  it('each copy is bought once with energy, the next costing more, up to 6 of a kind', () => {
    const s = s0({ lifetimeEnergy: energyForLevel(5), energy: 10_000, decorationsBought: {} });
    const base = DECORATIONS_BY_ID.tree.price;
    expect(decorationPrice(s, 'tree')).toBe(base);
    const once = buyDecoration(s, 'tree')!;
    expect(once).toEqual({ energy: 10_000 - base, decorationsBought: { tree: 1 } });
    expect(decorationPrice({ ...s, ...once }, 'tree')).toBe(Math.round(base * DECORATION_PRICE_GROWTH));
    expect(decorationPrice({ decorationsBought: { tree: 3 } }, 'tree')).toBe(Math.round(base * DECORATION_PRICE_GROWTH ** 3));
    expect(buyBlock({ ...s, energy: 1e12, decorationsBought: { tree: DECORATION_LIMIT } }, 'tree')).toBe(`All ${DECORATION_LIMIT} bought.`);
    // the first Tree is a small early buy; the statue is a late-game sink
    expect(DECORATIONS_BY_ID.tree.price).toBeLessThan(DECORATIONS_BY_ID.statue.price / 1000);
  });

  it('cannot be bought without enough energy, and the requirements still apply', () => {
    const poor = s0({ lifetimeEnergy: energyForLevel(5), energy: DECORATIONS_BY_ID.tree.price - 1, decorationsBought: {} });
    expect(buyBlock(poor, 'tree')).toBe('Not enough energy.');
    expect(buyDecoration(poor, 'tree')).toBeNull();
    expect(buyBlock(s0({ energy: 1e12 }), 'statue')).toBe('Not unlocked yet.');
  });

  it('only owned copies can be placed, and placing, removing and placing again costs nothing', () => {
    const s = s0({ lifetimeEnergy: energyForLevel(5), energy: 10_000, decorationsBought: {} });
    const tile = freeTile(s);
    expect(placeBlock(s, 'tree', tile)).toBe('Buy one first.');
    const owned = { ...s, ...buyDecoration(s, 'tree')! };
    const placed = { ...owned, mapDecorations: placeDecoration(owned, 'tree', tile)! };
    expect(placed.energy).toBe(owned.energy);
    // the one copy is on the map: a second tile needs another copy
    const taken = new Set(layoutSite(s).placed.flatMap((p) => p.cells));
    const other = [...Array(layoutSite(s).capacity).keys()].find((c) => !taken.has(c) && c !== tile)!;
    expect(placeBlock(placed, 'tree', other)).toBe('All 1 you own are placed: buy another first.');
    // remove it and place it elsewhere, for free, as often as you like
    let st = placed;
    for (let i = 0; i < 3; i++) {
      st = { ...st, mapDecorations: removeDecoration(st.mapDecorations, i % 2 ? other : tile)! };
      st = { ...st, mapDecorations: placeDecoration(st, 'tree', i % 2 ? tile : other)! };
    }
    expect(st.energy).toBe(owned.energy);
    expect(st.decorationsBought.tree).toBe(1);
  });

  it('old saves keep their decorations, counted as bought for free', () => {
    const old = { ...createInitialState(0), mapDecorations: { 3: 'tree', 4: 'tree', 9: 'pond' } } as Record<string, unknown>;
    delete old.decorationsBought;
    const migrated = migrateSave(old, 21);
    expect(migrated.mapDecorations).toEqual({ 3: 'tree', 4: 'tree', 9: 'pond' });
    expect(migrated.decorationsBought).toEqual({ tree: 2, pond: 1 });
    expect(migrated.energy).toBe(createInitialState(0).energy);
    expect(migrateSave({ ...createInitialState(0), mapDecorations: {} }, 21).decorationsBought).toEqual({});
    expect(pickSaved({ ...createInitialState(0), decorationsBought: { lamp: 2 } }).decorationsBought).toEqual({ lamp: 2 });
  });

  it('achievements unlock with decorations bought and kinds bought', () => {
    const s = unlockedAll({ decorationsBought: {} });
    const ids = (st: GameState) => newlyEarned(st).map((a) => a.id);
    expect(ids(s)).not.toContain('decor_1');
    expect(ids({ ...s, decorationsBought: { tree: 1 } })).toContain('decor_1');
    expect(ids({ ...s, decorationsBought: { tree: 6, flag: 4 } })).toContain('decor_10');
    const every = Object.fromEntries(DECORATIONS.map((d) => [d.id, 1]));
    expect(ids({ ...s, decorationsBought: every })).toContain('decor_kinds');
    expect(ids({ ...s, decorationsBought: { ...every, tree: 6, flag: 6, pond: 6, windsock: 6, lamp: 4 } })).not.toContain('decor_30'); // 29
    expect(ids({ ...s, decorationsBought: ALL_OWNED })).toContain('decor_30'); // every copy (1.78)
    expect(ACHIEVEMENTS_BY_ID.decor_30).toMatchObject({ bonus: true, title: true, tier: 'epic' });
  });

  it('Landscape Architect needs every copy of every kind, and an old save keeps it (1.78)', () => {
    const s = unlockedAll({ decorationsBought: {} });
    const ids = (st: GameState) => newlyEarned(st).map((a) => a.id);
    const all = DECORATIONS.length * DECORATION_LIMIT;
    expect(ACHIEVEMENTS_BY_ID.decor_30.target).toBe(all);
    expect(ACHIEVEMENTS_BY_ID.decor_30.description).toBe(`Own all ${all} decorations.`);
    // one copy short of all of them
    const oneShort = { ...ALL_OWNED, [DECORATIONS[0].id]: DECORATION_LIMIT - 1 };
    expect(ids({ ...s, decorationsBought: oneShort })).not.toContain('decor_30');
    // 30 bought, enough before 1.78, is no longer enough
    const thirty = Object.fromEntries(DECORATIONS.map((d, i) => [d.id, i < 5 ? 6 : 0]));
    expect(ids({ ...s, decorationsBought: thirty })).not.toContain('decor_30');
    // a save that earned it at 30 keeps it: achievements are never taken away
    const earned = migrateSave({ ...s, decorationsBought: thirty, achievements: { decor_30: 123 } }, SAVE_VERSION);
    expect(earned.achievements.decor_30).toBe(123);
    expect(ids(earned)).not.toContain('decor_30');
  });

  it('100% completion counts all 6 copies of every kind (owner, playtest 24)', () => {
    const part = (st: Partial<GameState>) => getCompletion({ ...createInitialState(0), ...st }).parts.find((p) => p.label === 'Decorations')!;
    expect(part({}).total).toBe(DECORATIONS.length);
    expect(part({}).done).toBe(0);
    const one = Object.fromEntries(DECORATIONS.map((d) => [d.id, 1]));
    expect(part({ decorationsBought: one }).done).toBe(0);
    expect(part({ decorationsBought: one }).items[0].detail).toBe(`1/${DECORATION_LIMIT} bought`);
    expect(part({ decorationsBought: { ...one, tree: DECORATION_LIMIT } }).done).toBe(1);
    expect(part({ decorationsBought: ALL_OWNED }).done).toBe(DECORATIONS.length);
  });

  it('the panel buys copies, shows prices red when short, and places owned copies for free', () => {
    useStore.getState().resetGame();
    const s = s0({ lifetimeEnergy: energyForLevel(5), energy: 1500, decorationsBought: {} });
    useStore.setState(s);
    const tile = freeTile(s);
    const { container } = render(<MapPanel onSelect={() => {}} />);
    fireEvent.click(screen.getByTestId('decor-open'));
    expect(screen.getByTestId('map-decorations').textContent).toContain('for free');
    expect((screen.getByTestId('decor-pick-tree') as HTMLButtonElement).disabled).toBe(true); // none owned yet
    expect(screen.getByTestId('decor-price-tree').textContent).toContain('1K');
    expect(screen.getByTestId('decor-price-tree').dataset.short).toBe('false');
    fireEvent.click(screen.getByTestId('decor-buy-tree'));
    expect(useStore.getState().energy).toBe(500);
    expect(useStore.getState().decorationsBought.tree).toBe(1);
    expect(screen.getByTestId('decor-count-tree').textContent).toBe('0/1 placed · 1/6 owned');
    // the next copy costs 1,600 and 500 is left: red and disabled
    expect(screen.getByTestId('decor-price-tree').dataset.short).toBe('true');
    expect((screen.getByTestId('decor-buy-tree') as HTMLButtonElement).disabled).toBe(true);
    // place, remove and place again: energy stays at 500
    fireEvent.click(screen.getByTestId('decor-pick-tree'));
    const tiles = container.querySelectorAll('[data-terrain]:not([data-terrain="sea"])');
    fireEvent.click(tiles[tile]);
    expect(useStore.getState().mapDecorations[tile]).toBe('tree');
    fireEvent.click(screen.getByTestId('decor-remove'));
    fireEvent.click(tiles[tile]);
    expect(useStore.getState().mapDecorations).toEqual({});
    fireEvent.click(screen.getByTestId('decor-pick-tree'));
    fireEvent.click(tiles[tile]);
    expect(useStore.getState().mapDecorations[tile]).toBe('tree');
    expect(useStore.getState().energy).toBe(500);
  });
});

describe('remove all decorations at once (1.70)', () => {
  it('is pure: empties the map, or null when nothing is placed', () => {
    expect(removeAllDecorations({})).toBeNull();
    expect(removeAllDecorations({ 3: 'tree', 9: 'flag' })).toEqual({});
  });

  /** A site with a tree and a flag on free tiles, and one tree hidden under a machine. */
  const decorated = () => {
    useStore.getState().resetGame();
    const s = s0({ lifetimeEnergy: energyForLevel(20), achievements: achieved(15) });
    const taken = new Set(layoutSite(s).placed.flatMap((p) => p.cells));
    const [a, b] = [...Array(layoutSite(s).capacity).keys()].filter((c) => !taken.has(c));
    const machine = layoutSite(s).placed[0].cells[0];
    useStore.setState({ ...s, mapDecorations: { [a]: 'tree', [b]: 'flag', [machine]: 'tree' } });
    return { a, s };
  };

  it('is disabled with nothing placed', () => {
    useStore.getState().resetGame();
    useStore.setState(s0({ lifetimeEnergy: energyForLevel(5) }));
    render(<MapPanel onSelect={() => {}} />);
    fireEvent.click(screen.getByTestId('decor-open'));
    expect((screen.getByTestId('decor-remove-all') as HTMLButtonElement).disabled).toBe(true);
  });

  it('asks first; Cancel and Escape change nothing and keep the panel open', async () => {
    decorated();
    const before = useStore.getState().mapDecorations;
    render(<MapPanel onSelect={() => {}} />);
    fireEvent.click(screen.getByTestId('decor-open'));
    const button = screen.getByTestId('decor-remove-all');
    fireEvent.click(button);
    const confirm = screen.getByTestId('decor-remove-all-confirm');
    expect(confirm.textContent).toContain('Take all 3 decorations off the map?');
    expect(confirm.textContent).toContain('You keep every copy');
    fireEvent.click(screen.getByTestId('decor-remove-all-cancel'));
    expect(screen.queryByTestId('decor-remove-all-confirm')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(button));
    fireEvent.click(button);
    fireEvent.keyDown(screen.getByTestId('decor-remove-all-cancel'), { key: 'Escape' });
    expect(screen.queryByTestId('decor-remove-all-confirm')).toBeNull();
    expect(screen.getByTestId('map-decorations')).toBeTruthy();
    expect(useStore.getState().mapDecorations).toBe(before);
  });

  it('empties the map for free, keeps every copy, and the copies can be placed again for free', () => {
    const { a } = decorated();
    const { energy, decorationsBought } = useStore.getState();
    render(<MapPanel onSelect={() => {}} />);
    fireEvent.click(screen.getByTestId('decor-open'));
    fireEvent.click(screen.getByTestId('decor-remove-all'));
    fireEvent.click(screen.getByTestId('decor-remove-all-yes'));
    const after = useStore.getState();
    expect(after.mapDecorations).toEqual({});
    expect(after.energy).toBe(energy);
    expect(after.decorationsBought).toEqual(decorationsBought);
    expect(screen.getByTestId('map-info').textContent).toContain('All decorations removed: place them again any time for free.');
    expect((screen.getByTestId('decor-remove-all') as HTMLButtonElement).disabled).toBe(true);
    expect(useStore.getState().placeDecoration('tree', a)).toBe(true);
    expect(useStore.getState().energy).toBe(energy);
  });
});
