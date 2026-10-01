import { describe, expect, it } from 'vitest';
import { GENERATOR_TYPES } from '../data/generators';
import { createInitialState } from '../data/initialState';
import { ROOM_TIERS } from '../data/rooms';
import { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { buildGenerator, getBuildBlock } from './generatorSystem';
import { canExpandRoom, expandRoom, expansionBarPhase, getExpandBlock, getNextRoomTier, isExpansionAnimating, lastExpansionSize, isRoomNearlyFull } from './roomSystem';

const rich = (over: Partial<GameState> = {}): GameState => ({
  ...createInitialState(0),
  energy: 1e8,
  resources: { metal: 1e6, stone: 1e6, coal: 1e5, naturalGas: 1e4 },
  ...over,
});

describe('room expansion', () => {
  it('starts at 13 capacity (3 used by producers), level 0', () => {
    const s = createInitialState(0);
    expect(s.roomCapacity).toBe(13);
    expect(s.expansionLevel).toBe(0);
  });

  it('tier 1 deducts its cost and adds 10 room', () => {
    const s = expandRoom(rich());
    expect(s.roomCapacity).toBe(23);
    expect(s.expansionLevel).toBe(1);
    expect(s.energy).toBe(1e8 - 500);
    expect(s.resources.metal).toBe(1e6 - 50);
    expect(s.resources.stone).toBe(1e6 - 20);
  });

  it('tiers go in order and stop at the last', () => {
    let s = rich();
    for (const t of ROOM_TIERS) s = expandRoom(s, t.tier);
    expect(s.roomCapacity).toBe(13 + ROOM_TIERS.reduce((sum, t) => sum + t.capacity, 0));
    expect(getNextRoomTier(s.expansionLevel)).toBeNull();
    expect(getExpandBlock(s)).toBe('maxed');
    expect(expandRoom(s)).toBe(s);
  });

  it('rejects a tier that is not the next one', () => {
    const s = rich();
    expect(expandRoom(s, 2)).toBe(s);
  });

  it('is blocked without energy or resources', () => {
    expect(canExpandRoom(rich({ energy: 499 }))).toBe(false);
    expect(getExpandBlock(rich({ resources: { metal: 49, stone: 999, coal: 0, naturalGas: 0 } }))).toBe('cost');
  });

  it('building is blocked over capacity, and allowed again after expanding', () => {
    let s = rich();
    for (let i = 0; i < 5; i++) s = buildGenerator(s, GeneratorType.SOLAR, GENERATOR_TYPES);
    expect(s.roomUsed).toBe(13);
    expect(getBuildBlock(s, GeneratorType.SOLAR, GENERATOR_TYPES)).toBe('room');
    s = expandRoom(s);
    expect(getBuildBlock(s, GeneratorType.SOLAR, GENERATOR_TYPES)).toBeNull();
  });

  it('warns at 90% or more', () => {
    expect(isRoomNearlyFull({ roomUsed: 8, roomCapacity: 10 })).toBe(false);
    expect(isRoomNearlyFull({ roomUsed: 9, roomCapacity: 10 })).toBe(true);
    expect(isRoomNearlyFull({ roomUsed: 10, roomCapacity: 10 })).toBe(true);
  });
});

describe('expansion animation: room bar (playtest 7 redesign, absorbs 0.21)', () => {
  it('the new room slides in over the first half, holds, then settles', () => {
    expect(expansionBarPhase(null)).toEqual({ building: false, reveal: 1 });
    expect(expansionBarPhase(0)).toEqual({ building: true, reveal: 0 });
    expect(expansionBarPhase(500)).toEqual({ building: true, reveal: 0.5 });
    expect(expansionBarPhase(1000)).toEqual({ building: true, reveal: 1 });
    expect(expansionBarPhase(1999)).toEqual({ building: true, reveal: 1 });
    expect(expansionBarPhase(2000)).toEqual({ building: false, reveal: 1 });
    expect(expansionBarPhase(-1)).toEqual({ building: false, reveal: 1 });
  });

  it('is driven only by the expansion timestamp', () => {
    const s = expandRoom(rich(), undefined, 5_000);
    expect(s.lastExpansionAt).toBe(5_000);
    expect(lastExpansionSize(s.expansionLevel)).toBe(10);
    expect(isExpansionAnimating(s.lastExpansionAt, 4_999)).toBe(false);
    expect(isExpansionAnimating(s.lastExpansionAt, 5_000)).toBe(true);
    expect(isExpansionAnimating(s.lastExpansionAt, 7_000)).toBe(false);
  });

  it('a blocked expansion starts no animation', () => {
    const s = expandRoom(rich({ energy: 0 }), undefined, 5_000);
    expect(s.lastExpansionAt).toBeNull();
    expect(isExpansionAnimating(s.lastExpansionAt, 5_500)).toBe(false);
  });
});

describe('room tiers (playtest 7: more, finite)', () => {
  it('there are 8 tiers, in order, each bigger and dearer than the last', () => {
    expect(ROOM_TIERS).toHaveLength(8);
    ROOM_TIERS.forEach((t, i) => {
      expect(t.tier).toBe(i + 1);
      if (i > 0) {
        expect(t.capacity).toBeGreaterThan(ROOM_TIERS[i - 1].capacity);
        expect(t.energy).toBeGreaterThan(ROOM_TIERS[i - 1].energy);
        expect(t.resources.metal!).toBeGreaterThan(ROOM_TIERS[i - 1].resources.metal!);
      }
    });
  });
});
