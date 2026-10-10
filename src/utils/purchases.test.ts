import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { FREE_MAX_RESEARCH_LEVEL, SUPPORTER_ACCENT, SUPPORTER_COLOR, SUPPORTER_TITLE } from '../data/purchases';
import { RESEARCH, RESEARCH_BY_ID } from '../data/research';
import { runBalanceSim } from '../sim/balanceSim';
import { migrateSave, pickSaved } from '../store/migrations';
import { accentInfo, canUseAccent, canUseTitle, resolveAccent, titleInfo } from './achievements';
import { atFreeBoundary, entitlementsFrom, hasFullGame, needsFullGame } from './purchases';
import { getResearchBlock, startResearch } from './researchSystem';

const none = { fullGame: false, supporter: false };
/** A rich save that has done every research it may do for free. */
const atBoundary = (extra: Partial<ReturnType<typeof createInitialState>> = {}) => {
  const free = RESEARCH.filter((d) => d.requiredLevel <= FREE_MAX_RESEARCH_LEVEL).map((d) => d.id);
  return { ...createInitialState(0), energy: 1e30, resources: Object.fromEntries(Object.keys(createInitialState(0).resources).map((k) => [k, 1e30])) as ReturnType<typeof createInitialState>['resources'], researchLevel: 99, completedResearch: free, ...extra };
};

describe('the free part and the Full Game (1.95)', () => {
  it('with no store (the web build) the whole game is open', () => {
    expect(hasFullGame({ entitlements: none, storeActive: false })).toBe(true);
    expect(hasFullGame({ entitlements: none })).toBe(true);
    const s = atBoundary();
    expect(atFreeBoundary(s)).toBe(false);
    for (const d of RESEARCH) expect(getResearchBlock(s, d.id)).not.toBe('fullGame');
  });

  it('with a store and no Full Game, only research above the free level is closed', () => {
    const s = atBoundary({ storeActive: true });
    expect(hasFullGame(s)).toBe(false);
    const oil = RESEARCH_BY_ID.oil_refining;
    expect(oil.requiredLevel).toBeGreaterThan(FREE_MAX_RESEARCH_LEVEL);
    expect(needsFullGame(s, oil)).toBe(true);
    expect(getResearchBlock(s, 'oil_refining')).toBe('fullGame');
    expect(startResearch(s, 'oil_refining', 1)).toBe(s);
    // research at the free level itself is open
    const level9 = RESEARCH.find((d) => d.requiredLevel === FREE_MAX_RESEARCH_LEVEL)!;
    expect(needsFullGame(s, level9)).toBe(false);
    expect(getResearchBlock({ ...s, completedResearch: s.completedResearch.filter((x) => x !== level9.id) }, level9.id)).not.toBe('fullGame');
    expect(atFreeBoundary(s)).toBe(true);
  });

  it('nothing already researched stops counting, and the Full Game opens everything', () => {
    const s = atBoundary({ storeActive: true, completedResearch: [...atBoundary().completedResearch, 'oil_refining'] });
    expect(needsFullGame(s, RESEARCH_BY_ID.oil_refining)).toBe(false);
    const full = atBoundary({ storeActive: true, entitlements: { fullGame: true, supporter: false } });
    expect(atFreeBoundary(full)).toBe(false);
    for (const d of RESEARCH) expect(getResearchBlock(full, d.id)).not.toBe('fullGame');
  });

  it('a new player is far from the boundary', () => {
    expect(atFreeBoundary({ ...createInitialState(0), storeActive: true })).toBe(false);
  });

  it('entitlements come from what the store owns', () => {
    expect(entitlementsFrom([])).toEqual(none);
    expect(entitlementsFrom(['full_game'])).toEqual({ fullGame: true, supporter: false });
    expect(entitlementsFrom(['supporter_pack', 'full_game'])).toEqual({ fullGame: true, supporter: true });
  });
});

describe('entitlements are saved and migrated (1.95)', () => {
  it('an older save owns nothing', () => {
    const old = { ...pickSaved(createInitialState(0)) } as Record<string, unknown>;
    delete old.entitlements;
    expect(migrateSave(old, 23).entitlements).toEqual(none);
  });

  it('a save keeps what was bought', () => {
    const s = { ...createInitialState(0), entitlements: { fullGame: true, supporter: true } };
    const saved = JSON.parse(JSON.stringify(pickSaved(s)));
    expect(migrateSave(saved, 24).entitlements).toEqual({ fullGame: true, supporter: true });
  });
});

describe('the Supporter Pack is cosmetic only (1.95)', () => {
  it('its title and accent need the pack', () => {
    expect(canUseTitle({ achievements: {} }, SUPPORTER_TITLE.id)).toBe(false);
    expect(canUseAccent({ achievements: {} }, SUPPORTER_ACCENT.id)).toBe(false);
    const fan = { achievements: {}, entitlements: { fullGame: false, supporter: true } };
    expect(canUseTitle(fan, SUPPORTER_TITLE.id)).toBe(true);
    expect(canUseAccent(fan, SUPPORTER_ACCENT.id)).toBe(true);
    expect(resolveAccent(fan, 'supporter')).toBe('supporter');
    expect(resolveAccent({ achievements: {} }, 'supporter')).toBe('slate');
    expect(accentInfo('supporter').color).toBe(SUPPORTER_COLOR);
    expect(titleInfo('supporter')).toMatchObject({ name: 'Supporter', color: SUPPORTER_COLOR });
  });

  it('its color reads on the top bar (4.5:1 on slate-800)', () => {
    const lum = (hex: string) => {
      const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const ratio = (lum(SUPPORTER_COLOR) + 0.05) / (lum('#1e293b') + 0.05);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('a run with the pack, its title and accent is the same as one without; the Full Game with a store matches the web', () => {
    const hours = 40;
    const plain = runBalanceSim({ hours, stopAtCompletion: false });
    const supporter = runBalanceSim({
      hours,
      stopAtCompletion: false,
      start: {
        entitlements: { fullGame: false, supporter: true },
        settings: { ...createInitialState(0).settings, cosmetics: { title: 'supporter', accent: 'supporter' } },
      },
    });
    const strip = (r: typeof plain) => ({ ...r, finalState: { ...r.finalState, entitlements: none, settings: null } });
    expect(strip(supporter)).toEqual(strip(plain));
    const fullWithStore = runBalanceSim({ hours, stopAtCompletion: false, start: { storeActive: true, entitlements: { fullGame: true, supporter: false } } });
    expect(fullWithStore.milestones).toEqual(plain.milestones);
    expect(fullWithStore.finalState.lifetimeEnergy).toBe(plain.finalState.lifetimeEnergy);
  }, 60_000);
});
