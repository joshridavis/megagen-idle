import { getClickValue } from '../../utils/bonuses';
import type { EnergyState } from '../../types/state';
import { advanceTime } from '../../utils/simulation';
import { RESOURCE_IDS } from '../../data/resources';
import { LIVE_TICK_MAX_SECONDS, WELCOME_BACK_MIN_SECONDS } from '../../data/time';
import type { Resources } from '../../types/state';
import { buildAwayReport, levelsGained, takeAwaySnapshot } from '../../utils/awayReport';
import { deriveRates } from '../../utils/simulation';
import type { Celebration } from '../types';
import { pickSaved } from '../migrations';
import type { SliceCreator, TransientState } from '../types';

export interface EnergyActions {
  /** Adds production for `deltaSeconds` and stamps `now` as the last save time. */
  applyIdleGains: (deltaSeconds: number, now?: number, opts?: { catchUp?: boolean }) => void;
  /** The tab was hidden: remember the state for the return summary. */
  markHidden: (now?: number) => void;
  /** The tab is visible again: show one summary for the whole time away. */
  markVisible: (now?: number) => void;
  /** Manual click: adds the click value (research can boost it later). */
  clickEnergy: () => void;
}

/**
 * Queues live celebrations: finished research, then the player level reached
 * (0.90). Several quick level-ups show as one, for the highest level.
 */
function withCelebrations(
  s: { celebrations: Celebration[]; lifetimeEnergy: number },
  research: string[],
  lifetimeAfter: number,
  now: number,
): { celebrations?: Celebration[] } {
  const levels = levelsGained(s.lifetimeEnergy, lifetimeAfter);
  const added: Celebration[] = research.map((id) => ({ id, at: now }));
  if (!added.length && !levels) return {};
  // keep the one on screen (index 0); later pending level-ups merge into the new one
  const queue = levels ? s.celebrations.filter((c, i) => i === 0 || c.kind !== 'level') : s.celebrations;
  if (levels) added.push({ kind: 'level', level: levels.to, at: now });
  return { celebrations: [...queue, ...added] };
}

export const createEnergySlice =
  (initial: EnergyState): SliceCreator<EnergyState & Pick<TransientState, 'awaySnapshot'> & EnergyActions> =>
  (set) => ({
    ...initial,
    awaySnapshot: null,
    markHidden: (now = Date.now()) => set((s) => ({ awaySnapshot: takeAwaySnapshot(s, now) }), undefined, 'energy/hidden'),
    markVisible: (now = Date.now()) =>
      set(
        (s) => {
          const snap = s.awaySnapshot;
          if (!snap) return {};
          const report = buildAwayReport(snap, s, now);
          return { awaySnapshot: null, ...(report.awaySeconds >= WELCOME_BACK_MIN_SECONDS ? { welcomeBack: report } : {}) };
        },
        undefined,
        'energy/visible',
      ),
    applyIdleGains: (deltaSeconds, now = Date.now(), opts = {}) =>
      set(
        (s) => {
          const { state, report } = advanceTime(s, deltaSeconds, now);
          const live = deltaSeconds <= LIVE_TICK_MAX_SECONDS;
          const awaySeconds = Math.max(0, (now - s.lastSavedTimestamp) / 1000);
          // Only the catch-up after loading the game creates a summary here;
          // throttled background-tab ticks never do (see markHidden/markVisible).
          const welcome =
            opts.catchUp && awaySeconds >= WELCOME_BACK_MIN_SECONDS
              ? {
                  welcomeBack: {
                    awaySeconds,
                    creditedSeconds: report.seconds,
                    energyGained: report.energyGained,
                    resourcesGained: Object.fromEntries(
                      RESOURCE_IDS.map((id) => [id, state.resources[id] - s.resources[id]]),
                    ) as Resources,
                    completedResearch: report.completedResearch,
                    outOfFuel: report.deactivated,
                    levels: levelsGained(s.lifetimeEnergy, state.lifetimeEnergy),
                  },
                }
              : {};
          return {
            ...pickSaved(state),
            ...welcome,
            lastSavedTimestamp: now,
            ...(live ? withCelebrations(s, report.completedResearch, state.lifetimeEnergy, now) : {}),
          };
        },
        undefined,
        'energy/applyIdleGains',
      ),
    clickEnergy: () =>
      set(
        (s) => {
          const gained = getClickValue(s.completedResearch, s.energyPerSecond);
          const lifetimeEnergy = s.lifetimeEnergy + gained;
          const next = { energy: s.energy + gained, lifetimeEnergy, ...withCelebrations(s, [], lifetimeEnergy, Date.now()) };
          // a level-up changes the energy bonus
          return next.celebrations ? { ...next, ...deriveRates({ ...pickSaved(s), ...next }) } : next;
        },
        undefined,
        'energy/click',
      ),
  });
