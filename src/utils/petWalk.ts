import { PET_ACTION_MS, PET_ACTION_WEIGHTS, PET_ACTIONS, PET_BASE_PACE, PET_PACES, PET_WALK, type PetAction, type PetId } from '../data/pets';
import type { Rng } from './rng';

/**
 * One walking pet (1.60): where it is (0 = left edge, 1 = right edge), where it
 * heads, and what it is doing until when. Pure, so the timer in the
 * component only applies it.
 */
export interface Walker {
  id: PetId;
  /** Position at the start of the current walk, 0 to 1. */
  from: number;
  /** Where the pet is heading (or stands, during an action), 0 to 1. */
  x: number;
  /** Facing left (walking toward a smaller x). */
  left: boolean;
  /** What the pet does now: walking, or an action. */
  action: 'walk' | PetAction;
  /** When the current walk or action ends (ms). */
  until: number;
  /** Speed of the current walk as a multiple of PET_WALK.speed (1.79); 1 when missing. */
  pace?: number;
}

/** Spread pets evenly across the screen, resting a moment before they set off. */
export function startWalkers(ids: PetId[], now: number): Walker[] {
  return ids.map((id, i) => {
    const x = (i + 1) / (ids.length + 1);
    return { id, from: x, x, left: false, action: 'rest', until: now + PET_ACTION_MS.rest[0] };
  });
}

/** How long a walk between two positions takes at a pace (ms). */
export const walkMs = (from: number, to: number, pace = 1): number => Math.max(500, (Math.abs(to - from) / (PET_WALK.speed * pace)) * 1000);

/** A pace for one walk (1.79): a stroll, a walk or a trot by PET_PACES, times the pet's own base pace. */
export function pickPace(id: PetId, rng: Rng): number {
  const total = PET_PACES.reduce((n, p) => n + p.weight, 0);
  let r = rng() * total;
  let pace: number = PET_PACES[PET_PACES.length - 1].pace;
  for (const p of PET_PACES) {
    r -= p.weight;
    if (r < 0) {
      pace = p.pace;
      break;
    }
  }
  return pace * (PET_BASE_PACE[id] ?? 1);
}

/** An action picked by PET_ACTION_WEIGHTS. */
function pickAction(rng: Rng): PetAction {
  const total = PET_ACTIONS.reduce((n, a) => n + PET_ACTION_WEIGHTS[a], 0);
  let r = rng() * total;
  for (const a of PET_ACTIONS) {
    r -= PET_ACTION_WEIGHTS[a];
    if (r < 0) return a;
  }
  return 'rest';
}

/** Starts an action where the pet stands, for its PET_ACTION_MS duration. */
function act(w: Walker, action: PetAction, now: number, rng: Rng): Walker {
  const [min, max] = PET_ACTION_MS[action];
  return { ...w, from: w.x, action, until: now + min + rng() * (max - min) };
}

/**
 * What a pet does next (owner, playtest 25: pets stop often and do nothing for
 * a while): after a walk it usually stops for an action; after an action it
 * may rest before walking on; after resting it walks.
 */
export function nextStep(w: Walker, now: number, rng: Rng): Walker {
  if (w.action === 'walk' && rng() < PET_WALK.actionChance) return act(w, pickAction(rng), now, rng);
  if (w.action !== 'walk' && w.action !== 'rest' && rng() < PET_WALK.restAfterAction) return act(w, 'rest', now, rng);
  // a new target at least a little way off, kept off the very edges
  let to = 0.05 + rng() * 0.9;
  if (Math.abs(to - w.x) < 0.1) to = w.x < 0.5 ? Math.min(0.95, w.x + 0.3) : Math.max(0.05, w.x - 0.3);
  const pace = pickPace(w.id, rng);
  return { ...w, from: w.x, x: to, left: to < w.x, action: 'walk', until: now + walkMs(w.x, to, pace), pace };
}

/**
 * Advances every walker whose walk or action is over; keeps the list in step
 * with the active pets (new ones join, rested ones leave).
 */
export function stepWalkers(walkers: Walker[], ids: PetId[], now: number, rng: Rng): Walker[] {
  const kept = walkers.filter((w) => ids.includes(w.id));
  const fresh = startWalkers(ids, now).filter((w) => !kept.some((k) => k.id === w.id));
  const all = [...kept, ...fresh];
  const next = all.map((w) => (now >= w.until ? nextStep(w, now, rng) : w));
  return next.every((w, i) => w === all[i]) && all.length === walkers.length ? walkers : next;
}
