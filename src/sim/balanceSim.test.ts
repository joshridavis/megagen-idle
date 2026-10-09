import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { RESEARCH } from '../data/research';
import { ROOM_TIERS } from '../data/rooms';
import { getCompletion } from '../utils/completion';
import { PACING_TARGETS } from '../data/pacingTargets';
import { runBalanceSim } from './balanceSim';

describe('balance simulator (0.35)', () => {
  it('is deterministic', () => {
    const a = runBalanceSim({ hours: 6 });
    const b = runBalanceSim({ hours: 6 });
    expect(a.milestones).toEqual(b.milestones);
    expect(a.finalState.energy).toBe(b.finalState.energy);
  });

  it('a full run finishes within 2 minutes and reaches 100% with no stalls', () => {
    const t = Date.now();
    const r = runBalanceSim();
    expect(Date.now() - t).toBeLessThan(120_000);
    expect(r.completion).toBe(1);
    expect(r.gaps).toEqual([]);
    expect(r.milestones.find((m) => m.id === 'firstGenerator')!.hours).toBeLessThan(2 / 60);
    // every pacing target holds, the early ones and the slower middle and late game (1.87)
    for (const target of PACING_TARGETS) {
      const m = r.milestones.find((x) => x.id === target.id);
      expect(m, target.id).toBeDefined();
      expect(m!.hours, target.id).toBeGreaterThanOrEqual(target.hours[0]);
      expect(m!.hours, target.id).toBeLessThanOrEqual(target.hours[1]);
    }
    // map layouts (1.05) made a run take several seconds: allow it, within the budget above.
    // The runner timeout sits above that budget so the check above decides, even when the
    // full suite runs in parallel. 1.86's scarcer fuel made the run longer (327 h, about 50 s
    // alone in a cloud sandbox, 67 s with the suite in parallel): the budget went from 60 s to 120 s.
  }, 180_000);
});

describe('completion (0.66 groundwork)', () => {
  it('a fresh save counts only what it starts with', () => {
    const c = getCompletion(createInitialState(0));
    expect(c.parts.find((p) => p.label === 'Research')).toMatchObject({ label: 'Research', done: 0, total: RESEARCH.length });
    expect(c.parts.find((p) => p.label === 'Room expansions')!.total).toBe(ROOM_TIERS.length);
    expect(c.parts.find((p) => p.label === 'Producer types owned')!.done).toBe(3);
    expect(c.ratio).toBeGreaterThan(0);
    expect(c.ratio).toBeLessThan(0.2);
  });
});
