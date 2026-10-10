import { describe, expect, it } from 'vitest';
import manifest from '../assets/sprite-manifest.json';
import { ACHIEVEMENTS } from '../data/achievements';
import { DECORATION_LIMIT, DECORATIONS } from '../data/decorations';
import { createInitialState } from '../data/initialState';
import { getCompletion } from './completion';
import { buyDecoration, decorationPrice, placeDecoration, isDecorationUnlocked } from './decorations';
import { energyForLevel } from './playerLevel';
import { layoutSite } from './siteMap';

const NEW = ['flowerbed', 'bench', 'hedge', 'rock_garden', 'picnic', 'fountain', 'weather_station', 'plaque'] as const;

describe('more decorations (1.54)', () => {
  it('eight new kinds, each with a generated 16x16 sprite', () => {
    expect(DECORATIONS).toHaveLength(14);
    for (const id of NEW) {
      const d = DECORATIONS.find((x) => x.id === id)!;
      expect(d, id).toBeDefined();
      expect((manifest as Record<string, { width: number; height: number }>)[d.sprite]).toMatchObject({ width: 16, height: 16 });
    }
  });

  it('prices spread from the early to the late game', () => {
    const prices = NEW.map((id) => decorationPrice({}, id));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(prices[0]).toBeLessThanOrEqual(5_000);
    expect(prices[prices.length - 1]).toBeGreaterThanOrEqual(10_000_000);
  });

  it('a new kind can be bought and placed once unlocked', () => {
    const s = { ...createInitialState(0), lifetimeEnergy: energyForLevel(8), energy: 1e6 };
    expect(isDecorationUnlocked(s, 'flowerbed')).toBe(true);
    const bought = buyDecoration(s, 'flowerbed')!;
    expect(bought.decorationsBought.flowerbed).toBe(1);
    expect(bought.energy).toBe(1e6 - 2_000);
    const after = { ...s, ...bought };
    const taken = new Set(layoutSite(after).placed.flatMap((p) => p.cells));
    const tile = [...Array(layoutSite(after).capacity).keys()].find((c) => !taken.has(c))!;
    expect(placeDecoration(after, 'flowerbed', tile)).toEqual({ [tile]: 'flowerbed' });
  });

  it('they count toward completion and Landscape Architect (all copies of every kind)', () => {
    const all = Object.fromEntries(DECORATIONS.map((d) => [d.id, DECORATION_LIMIT]));
    const missing = { ...all, plaque: DECORATION_LIMIT - 1 };
    const s = createInitialState(0);
    expect(getCompletion({ ...s, decorationsBought: all }).ratio).toBeGreaterThan(getCompletion({ ...s, decorationsBought: missing }).ratio);
    expect(ACHIEVEMENTS.find((a) => a.id === 'decor_30')!.target).toBe(14 * DECORATION_LIMIT);
  });
});
