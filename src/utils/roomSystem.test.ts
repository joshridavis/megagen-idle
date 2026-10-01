import { describe, expect, it } from 'vitest';
import { GENERATOR_TYPES } from '../data/generators';
import { createInitialState } from '../data/initialState';
import { ROOM_TIERS } from '../data/rooms';
import { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { buildGenerator, getBuildBlock } from './generatorSystem';
import { canExpandRoom, expandRoom, expansionSegmentPhase, getExpandBlock, getNextRoomTier, isExpansionAnimating, lastExpansionSize, isRoomNearlyFull } from './roomSystem';

const rich = (over: Partial<GameState> = {}): GameState => ({
  ...createInitialState(0),
  energy: 1e6,
  resources: { metal: 1e4, stone: 1e4, coal: 0, naturalGas: 0 },
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
    expect(s.energy).toBe(1e6 - 500);
    expect(s.resources.metal).toBe(1e4 - 50);
    expect(s.resources.stone).toBe(1e4 - 20);
  });

  it('tiers go in order and stop at the last', () => {
    let s = rich();
    for (const t of ROOM_TIERS) s = expandRoom(s, t.tier);
    expect(s.roomCapacity).toBe(13 + 10 + 15 + 25);
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

describe('expansion animation: meter grows (playtest 4, absorbs 0.21)', () => {
  it('new segments appear one by one as scaffolding, then settle', () => {
    // 10 old segments, 10 new (indices 10..19), 2000 ms
    expect(expansionSegmentPhase(5, 10, 20, 0)).toBe('done'); // old segment untouched
    expect(expansionSegmentPhase(10, 10, 20, 0)).toBe('building'); // first new appears at once
    expect(expansionSegmentPhase(19, 10, 20, 0)).toBe('hidden'); // last not yet
    expect(expansionSegmentPhase(19, 10, 20, 1200)).toBe('building'); // all shown by 60%
    expect(expansionSegmentPhase(19, 10, 20, 2000)).toBe('done'); // settled at the end
    expect(expansionSegmentPhase(19, 10, 20, null)).toBe('done'); // no expansion yet
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
