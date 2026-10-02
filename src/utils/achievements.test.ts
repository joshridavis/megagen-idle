import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, ACHIEVEMENTS_BY_ID, type AchievementMetric } from '../data/achievements';
import { createInitialState } from '../data/initialState';
import { RESEARCH } from '../data/research';
import { migrateSave } from '../store/migrations';
import { useStore } from '../store';
import { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { achievementProgress, metricValue, newlyEarned, unlockAchievements } from './achievements';
import { getCompletion } from './completion';
import { energyForLevel } from './playerLevel';

const s0 = (over: Partial<GameState> = {}): GameState => ({ ...createInitialState(0), ...over });
const gen = (n: number) => ({ id: `gen-${n}`, type: GeneratorType.SOLAR, isActive: true, level: 1 });

describe('achievements (0.65)', () => {
  it('has a varied, data-driven list with unique ids and every metric used', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(40);
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    const metrics = new Set(ACHIEVEMENTS.map((a) => a.metric));
    for (const m of ['lifetimeEnergy', 'clicks', 'generators', 'typesBuilt', 'typesMaxed', 'research', 'expansions', 'producers', 'playerLevel', 'contracts', 'petsFound', 'petsAdult', 'sightings', 'effectEvents', 'returns'] as AchievementMetric[]) {
      expect(metrics.has(m), m).toBe(true);
    }
    expect(ACHIEVEMENTS_BY_ID.research_all.target).toBe(RESEARCH.length);
  });

  it('each metric reads the right part of the state', () => {
    const s = s0({
      lifetimeEnergy: energyForLevel(12),
      activeGenerators: [gen(1), gen(2)],
      records: { builtTypes: [GeneratorType.SOLAR, GeneratorType.WIND], bestLevel: { solar: 10 } },
      completedResearch: ['basic_solar'],
      expansionLevel: 2,
      contracts: { ...createInitialState(0).contracts, done: 7 },
      pets: { active: 'eel', owned: { eel: { stage: 3, growUntil: null, foundAt: 0 }, cat: { stage: 1, growUntil: null, foundAt: 0 } } },
      seenEvents: { ufo: { count: 1, firstSeen: 0 }, birds: { count: 3, firstSeen: 0 }, grant: { count: 4, firstSeen: 0 } },
      stats: { clicks: 120, returns: 3 },
    });
    const v = (m: AchievementMetric) => metricValue(s, m);
    expect(v('generators')).toBe(2);
    expect(v('typesBuilt')).toBe(2);
    expect(v('typesMaxed')).toBe(1);
    expect(v('research')).toBe(1);
    expect(v('expansions')).toBe(2);
    expect(v('producers')).toBe(3);
    expect(v('playerLevel')).toBe(12);
    expect(v('contracts')).toBe(7);
    expect(v('petsFound')).toBe(2);
    expect(v('petsAdult')).toBe(1);
    expect(v('sightings')).toBe(2);
    expect(v('effectEvents')).toBe(4);
    expect(v('clicks')).toBe(120);
    expect(v('returns')).toBe(3);
    expect(achievementProgress(s, ACHIEVEMENTS_BY_ID.gens_10)).toBeCloseTo(0.2);
  });

  it('unlocks once, with the time, and never again', () => {
    const s = s0({ activeGenerators: [gen(1)] });
    const first = unlockAchievements(s, 42);
    expect(first.unlocked.map((a) => a.id)).toContain('gens_1');
    expect(first.state.achievements.gens_1).toBe(42);
    expect(newlyEarned(first.state).map((a) => a.id)).not.toContain('gens_1');
    expect(unlockAchievements(first.state, 99).state).toBe(first.state);
  });

  it('non-bonus achievements count toward completion; bonus ones do not', () => {
    const part = getCompletion(s0()).parts.find((p) => p.label === 'Achievements')!;
    expect(part.total).toBe(ACHIEVEMENTS.filter((a) => !a.bonus).length);
    expect(ACHIEVEMENTS.filter((a) => a.bonus).every((a) => ['clicks', 'sightings', 'effectEvents', 'returns'].includes(a.metric))).toBe(true);
  });

  it('the store unlocks live with a notice, counts clicks, and saves', () => {
    useStore.getState().resetGame();
    for (let i = 0; i < 100; i++) useStore.getState().clickEnergy();
    expect(useStore.getState().stats.clicks).toBe(100);
    expect(useStore.getState().achievements.clicks_100).toBeDefined();
    expect(useStore.getState().toasts.some((t) => t.text === 'Achievement unlocked: Hand Crank!')).toBe(true);
    const v14 = { ...createInitialState(0) } as Record<string, unknown>;
    delete v14.achievements;
    delete v14.stats;
    const m = migrateSave(v14, 14);
    expect(m.achievements).toEqual({});
    expect(m.stats).toEqual({ clicks: 0, returns: 0 });
  });

  it('a loaded save unlocks what it has reached without notices', () => {
    useStore.getState().resetGame();
    const toasts = useStore.getState().toasts.length;
    useStore.getState().loadSave(s0({ activeGenerators: [gen(1)] }));
    expect(useStore.getState().achievements.gens_1).toBeDefined();
    expect(useStore.getState().toasts.length).toBe(toasts);
  });
});
