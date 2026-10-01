import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { RESEARCH } from '../data/research';
import { ROOM_TIERS } from '../data/rooms';
import { getCompletion } from '../utils/completion';
import { runBalanceSim } from './balanceSim';

describe('balance simulator (0.35)', () => {
  it('is deterministic', () => {
    const a = runBalanceSim({ hours: 6 });
    const b = runBalanceSim({ hours: 6 });
    expect(a.milestones).toEqual(b.milestones);
    expect(a.finalState.energy).toBe(b.finalState.energy);
  });

  it('a full run finishes well under 60 seconds and reaches 100% with no stalls', () => {
    const t = Date.now();
    const r = runBalanceSim();
    expect(Date.now() - t).toBeLessThan(60_000);
    expect(r.completion).toBe(1);
    expect(r.gaps).toEqual([]);
    expect(r.milestones.find((m) => m.id === 'firstGenerator')!.hours).toBeLessThan(2 / 60);
  });
});

describe('completion (0.66 groundwork)', () => {
  it('a fresh save counts only what it starts with', () => {
    const c = getCompletion(createInitialState(0));
    expect(c.parts.find((p) => p.label === 'Research')).toEqual({ label: 'Research', done: 0, total: RESEARCH.length });
    expect(c.parts.find((p) => p.label === 'Room expansions')!.total).toBe(ROOM_TIERS.length);
    expect(c.parts.find((p) => p.label === 'Producer types owned')!.done).toBe(3);
    expect(c.ratio).toBeGreaterThan(0);
    expect(c.ratio).toBeLessThan(0.2);
  });
});
