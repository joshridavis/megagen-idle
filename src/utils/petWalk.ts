import { PET_ACTIONS, PET_WALK, type PetAction, type PetId } from '../data/pets';
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
}

/** Spread pets evenly across the screen, standing still. */
export function startWalkers(ids: PetId[], now: number): Walker[] {
  return ids.map((id, i) => {
    const x = (i + 1) / (ids.length + 1);
    return { id, from: x, x, left: false, action: 'sit', until: now };
  });
}

/** How long a walk between two positions takes (ms). */
export const walkMs = (from: number, to: number): number => Math.max(500, (Math.abs(to - from) / PET_WALK.speed) * 1000);

/** What a pet does next: an action where it stands, or a walk to a random place. */
export function nextStep(w: Walker, now: number, rng: Rng): Walker {
  if (w.action === 'walk' && rng() < PET_WALK.actionChance) {
    const action = PET_ACTIONS[Math.floor(rng() * PET_ACTIONS.length)] ?? 'sit';
    const [min, max] = PET_WALK.actionMs;
    return { ...w, from: w.x, action, until: now + min + rng() * (max - min) };
  }
  // a new target at least a little way off, kept off the very edges
  let to = 0.05 + rng() * 0.9;
  if (Math.abs(to - w.x) < 0.1) to = w.x < 0.5 ? Math.min(0.95, w.x + 0.3) : Math.max(0.05, w.x - 0.3);
  return { ...w, from: w.x, x: to, left: to < w.x, action: 'walk', until: now + walkMs(w.x, to) };
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
