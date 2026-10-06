import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import MapPanel from '../components/MapPanel';
import { DECORATION_COPIES_GOAL, DECORATION_LIMIT, DECORATION_PRICE_GROWTH, DECORATIONS, DECORATIONS_BY_ID } from '../data/decorations';
import { ACHIEVEMENTS_BY_ID } from '../data/achievements';
import { getCompletion } from './completion';
import { newlyEarned } from './achievements';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';
import { migrateSave, pickSaved, SAVE_VERSION } from '../store/migrations';
import { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { decorationPrice, isDecorationUnlocked, placeBlock, placeDecoration, removeDecoration, unlockedDecorations } from './decorations';
import { energyForLevel } from './playerLevel';
import { deriveRates } from './simulation';
import { getProducerPlacement, layoutSite } from './siteMap';

afterEach(cleanup);

const s0 = (extra: Partial<GameState> = {}): GameState => deriveRates({ ...createInitialState(0), roomCapacity: 48, energy: 1e9, ...extra });
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
    expect(once.mapDecorations[tile]).toBe('tree');
    expect(placeBlock({ ...s, ...once }, 'tree', tile)).toBe('Something is already there.');
    const full = Object.fromEntries(Array.from({ length: DECORATION_LIMIT }, (_, i) => [1000 + i, 'tree' as const]));
    expect(placeBlock({ ...s, mapDecorations: full }, 'tree', tile)).toBe(`At most ${DECORATION_LIMIT} of each.`);
    expect(removeDecoration(once.mapDecorations, tile)).toEqual({});
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

describe('decorations bought with energy (1.53)', () => {
  const unlockedAll = (extra: Partial<GameState> = {}) =>
    s0({ lifetimeEnergy: energyForLevel(20), achievements: achieved(15), contracts: { ...createInitialState(0).contracts, done: 50 }, ...extra });

  it('each copy costs more than the last, and energy is spent', () => {
    const s = s0({ lifetimeEnergy: energyForLevel(5), energy: 10_000 });
    const tile = freeTile(s);
    const base = DECORATIONS_BY_ID.tree.price;
    expect(decorationPrice(s, 'tree')).toBe(base);
    const once = placeDecoration(s, 'tree', tile)!;
    expect(once.energy).toBe(10_000 - base);
    expect(once.decorationsBought).toEqual({ tree: 1 });
    const after = { ...s, ...once };
    expect(decorationPrice(after, 'tree')).toBe(Math.round(base * DECORATION_PRICE_GROWTH));
    expect(decorationPrice({ decorationsBought: { tree: 3 } }, 'tree')).toBe(Math.round(base * DECORATION_PRICE_GROWTH ** 3));
    // the first Tree is a small early buy; the statue is a late-game sink
    expect(DECORATIONS_BY_ID.tree.price).toBeLessThan(DECORATIONS_BY_ID.statue.price / 1000);
  });

  it('cannot be placed without enough energy, and the requirements still apply', () => {
    const poor = s0({ lifetimeEnergy: energyForLevel(5), energy: DECORATIONS_BY_ID.tree.price - 1 });
    expect(placeBlock(poor, 'tree', freeTile(poor))).toBe('Not enough energy.');
    expect(placeDecoration(poor, 'tree', freeTile(poor))).toBeNull();
    const rich = s0({ energy: 1e12 });
    expect(placeBlock(rich, 'statue', freeTile(rich))).toBe('Not unlocked yet.');
  });

  it('removing refunds nothing and keeps the count, so the next copy still costs more', () => {
    const s = s0({ lifetimeEnergy: energyForLevel(5), energy: 10_000 });
    const tile = freeTile(s);
    const placed = { ...s, ...placeDecoration(s, 'tree', tile)! };
    const removed = { ...placed, mapDecorations: removeDecoration(placed.mapDecorations, tile)! };
    expect(removed.energy).toBe(placed.energy);
    expect(removed.decorationsBought.tree).toBe(1);
    expect(decorationPrice(removed, 'tree')).toBeGreaterThan(DECORATIONS_BY_ID.tree.price);
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
    const s = unlockedAll();
    const ids = (st: GameState) => newlyEarned(st).map((a) => a.id);
    expect(ids(s)).not.toContain('decor_1');
    expect(ids({ ...s, decorationsBought: { tree: 1 } })).toContain('decor_1');
    expect(ids({ ...s, decorationsBought: { tree: 6, flag: 4 } })).toContain('decor_10');
    const every = Object.fromEntries(DECORATIONS.map((d) => [d.id, 1]));
    expect(ids({ ...s, decorationsBought: every })).toContain('decor_kinds');
    expect(ids({ ...s, decorationsBought: { ...every, tree: 45 } })).toContain('decor_50');
    expect(ACHIEVEMENTS_BY_ID.decor_50).toMatchObject({ bonus: true, title: true, tier: 'epic' });
  });

  it('100% completion counts every kind once and a number bought in all', () => {
    const part = (st: Partial<GameState>) => getCompletion({ ...createInitialState(0), ...st }).parts.find((p) => p.label === 'Decorations')!;
    expect(part({}).total).toBe(DECORATIONS.length + 1);
    expect(part({}).done).toBe(0);
    const every = Object.fromEntries(DECORATIONS.map((d) => [d.id, 1]));
    expect(part({ decorationsBought: every }).done).toBe(DECORATIONS.length);
    expect(part({ decorationsBought: { ...every, tree: DECORATION_COPIES_GOAL } }).done).toBe(DECORATIONS.length + 1);
  });

  it('the panel shows each next price, red when energy is short, and placing pays it', () => {
    useStore.getState().resetGame();
    const s = s0({ lifetimeEnergy: energyForLevel(5), energy: 1500 });
    useStore.setState(s);
    const tile = freeTile(s);
    const { container } = render(<MapPanel onSelect={() => {}} />);
    fireEvent.click(screen.getByTestId('decor-open'));
    expect(screen.getByTestId('map-decorations').textContent).toContain('refunds nothing');
    const price = screen.getByTestId('decor-price-tree');
    expect(price.textContent).toContain('1K');
    expect(price.dataset.short).toBe('false');
    expect(screen.getByTestId('decor-price-flag').dataset.short).toBe('true');
    expect(screen.getByTestId('decor-price-flag').className).toContain('text-red-400');
    fireEvent.click(screen.getByTestId('decor-pick-tree'));
    const tiles = container.querySelectorAll('[data-terrain]:not([data-terrain="sea"])');
    fireEvent.click(tiles[tile]);
    expect(useStore.getState().energy).toBe(500);
    expect(screen.getByTestId('map-info').textContent).toContain('Tree placed for');
    // the next copy costs 1,600 and 500 is left: red, and a click says why
    expect(screen.getByTestId('decor-price-tree').dataset.short).toBe('true');
    const taken = new Set(layoutSite(s).placed.flatMap((p) => p.cells));
    const other = [...Array(layoutSite(s).capacity).keys()].find((c) => !taken.has(c) && c !== tile)!;
    fireEvent.click(tiles[other]);
    expect(screen.getByTestId('map-info').textContent).toContain('Not enough energy');
  });
});
