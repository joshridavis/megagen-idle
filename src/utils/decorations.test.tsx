import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import MapPanel from '../components/MapPanel';
import { DECORATION_LIMIT, DECORATIONS } from '../data/decorations';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';
import { migrateSave, pickSaved, SAVE_VERSION } from '../store/migrations';
import { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { isDecorationUnlocked, placeBlock, placeDecoration, removeDecoration, unlockedDecorations } from './decorations';
import { energyForLevel } from './playerLevel';
import { deriveRates } from './simulation';
import { getProducerPlacement, layoutSite } from './siteMap';

afterEach(cleanup);

const s0 = (extra: Partial<GameState> = {}): GameState => deriveRates({ ...createInitialState(0), roomCapacity: 48, ...extra });
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
    expect(placeBlock({ ...s, mapDecorations: full }, 'tree', tile)).toBe(`At most ${DECORATION_LIMIT} of each.`);
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
    expect(SAVE_VERSION).toBe(20);
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
});
