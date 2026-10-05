import { describe, expect, it } from 'vitest';
import type { ResearchDef } from '../types/research';
import { RESEARCH, RESEARCH_BY_ID } from './research';

/** Returns every pair that breaks the "higher level takes longer" rule. */
export function durationRuleViolations(tree: ResearchDef[]): string[] {
  const byId = Object.fromEntries(tree.map((r) => [r.id, r]));
  const out: string[] = [];
  for (const a of tree) {
    for (const b of tree) {
      if (a.requiredLevel < b.requiredLevel && b.duration <= a.duration) {
        out.push(`${b.id} (level ${b.requiredLevel}) must take longer than ${a.id} (level ${a.requiredLevel})`);
      }
    }
    for (const p of a.prerequisites) {
      if (byId[p] && a.duration <= byId[p].duration) out.push(`${a.id} must take longer than its prerequisite ${p}`);
    }
  }
  return out;
}

describe('research durations (playtest 3)', () => {
  it('every research takes longer than all lower-level research and its prerequisites', () => {
    expect(durationRuleViolations(RESEARCH)).toEqual([]);
  });

  it('the rule check catches a violation', () => {
    const bad = RESEARCH.map((r) => (r.id === 'wind_power' ? { ...r, duration: 60 } : r));
    expect(durationRuleViolations(bad).length).toBeGreaterThan(0);
  });

  it('uses the playtest 3 durations', () => {
    // the playtest 3 durations, 25% longer since playtest 19.3, in whole minutes
    expect(RESEARCH_BY_ID.basic_solar.duration).toBe(13 * 60);
    expect(RESEARCH_BY_ID.wind_power.duration).toBe(38 * 60);
    expect(RESEARCH_BY_ID.fossil_fuels.duration).toBe(56 * 60);
  });
});

describe('three starting research (playtest 8)', () => {
  it('the tree has three roots: Basic Solar, Basic Mining, Fossil Fuels 101', () => {
    const roots = RESEARCH.filter((r) => r.prerequisites.length === 0).map((r) => r.id);
    expect(roots.sort()).toEqual(['basic_mining', 'basic_solar', 'fossil_fuels']);
  });
  it('Basic Mining starts the resource upgrades', () => {
    for (const id of ['better_picks', 'controlled_blasting', 'modular_mines']) {
      expect(RESEARCH_BY_ID[id].prerequisites).toEqual(['basic_mining']);
    }
    expect(RESEARCH_BY_ID.basic_mining.effects).toEqual([{ type: 'resourceProduction', value: 0.1 }]);
  });
});

describe('research level gates (playtest 22, 1.62)', () => {
  it('every research can be reached: completing research in some order never gets stuck', () => {
    const done = new Set<string>();
    let progressed = true;
    while (progressed) {
      progressed = false;
      for (const r of RESEARCH) {
        if (done.has(r.id)) continue;
        const level = 1 + done.size;
        if (level >= r.requiredLevel && r.prerequisites.every((p) => done.has(p))) {
          done.add(r.id);
          progressed = true;
        }
      }
    }
    expect(RESEARCH.filter((r) => !done.has(r.id)).map((r) => r.id)).toEqual([]);
  });

  it('the upper research needs most of the tree done first', () => {
    const top = Math.max(...RESEARCH.map((r) => r.requiredLevel));
    // level = 1 + research completed: the last research needs all but one of the others
    expect(top - 1).toBeGreaterThanOrEqual(RESEARCH.length - 2);
    expect(RESEARCH_BY_ID.stellar_harvest.requiredLevel).toBe(top);
    expect(RESEARCH_BY_ID.nuclear_fission.requiredLevel).toBeGreaterThanOrEqual(15);
    expect(RESEARCH_BY_ID.fusion_ignition.requiredLevel).toBeGreaterThanOrEqual(25);
  });
});
