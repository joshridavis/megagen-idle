import { EVENTS_BY_ID } from '../data/events';
import {
  PET_ACTION_MS,
  PET_ACTION_WEIGHTS,
  PET_ACTIONS,
  PET_BASE_PACE,
  PET_CELEBRATION,
  PET_EVENT_REACTIONS,
  PET_GENERIC_REACTION,
  PET_MEET,
  PET_MEET_KINDS,
  PET_NEGATIVE_REACTION,
  PET_PACES,
  PET_WALK,
  type PetAction,
  type PetId,
  type PetMeetKind,
  type PetReactionDef,
} from '../data/pets';
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
  /** A celebration or event reaction playing until `until` (1.80); the pet stands still meanwhile. */
  react?: PetReactionDef;
  /** Meeting another pet (1.81): walking over (or waiting), then sharing an action together. */
  meet?: { with: PetId; kind: PetMeetKind; phase: 'approach' | 'together'; host: boolean };
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
  // a finished reaction or meeting: carry on walking, each its own way (1.80, 1.81)
  if (w.react || w.meet) w = { ...w, react: undefined, meet: undefined, action: 'rest' };
  if (w.action === 'walk' && rng() < PET_WALK.actionChance) return act(w, pickAction(rng), now, rng);
  if (w.action !== 'walk' && w.action !== 'rest' && rng() < PET_WALK.restAfterAction) return act(w, 'rest', now, rng);
  // a new target at least a little way off, kept off the very edges
  let to = 0.05 + rng() * 0.9;
  if (Math.abs(to - w.x) < 0.1) to = w.x < 0.5 ? Math.min(0.95, w.x + 0.3) : Math.max(0.05, w.x - 0.3);
  const pace = pickPace(w.id, rng);
  return { ...w, from: w.x, x: to, left: to < w.x, action: 'walk', until: now + walkMs(w.x, to, pace), pace };
}

/** A pet free to meet another: resting, not reacting or already meeting (1.81). */
export const isFree = (w: Walker): boolean => w.action === 'rest' && !w.react && !w.meet;

function pickMeetKind(rng: Rng): PetMeetKind {
  const total = PET_MEET_KINDS.reduce((n, k) => n + PET_MEET.weights[k], 0);
  let r = rng() * total;
  for (const k of PET_MEET_KINDS) {
    r -= PET_MEET.weights[k];
    if (r < 0) return k;
  }
  return 'greet';
}

/**
 * Two pets meet (1.81): the visitor walks to a spot `gap` beside the host, on
 * its own side when there is room, while the host waits facing it.
 */
export function startMeeting(host: Walker, visitor: Walker, now: number, rng: Rng, gap = PET_MEET.gap): [Walker, Walker] {
  const kind = pickMeetKind(rng);
  const fromRight = visitor.x >= host.x;
  let to = host.x + (fromRight ? gap : -gap);
  if (to > 0.95 || to < 0.05) to = host.x + (fromRight ? -gap : gap);
  to = Math.min(0.95, Math.max(0.05, to));
  const pace = pickPace(visitor.id, rng);
  const until = now + walkMs(visitor.x, to, pace);
  return [
    { ...host, from: host.x, action: 'rest', left: to < host.x, until, meet: { with: visitor.id, kind, phase: 'approach', host: true } },
    { ...visitor, from: visitor.x, x: to, left: to < visitor.x, action: 'walk', until, pace, meet: { with: host.id, kind, phase: 'approach', host: false } },
  ];
}

/** The visitor has arrived: both face each other and share the action for its PET_MEET.ms duration. */
function together(a: Walker, b: Walker, now: number, rng: Rng): [Walker, Walker] {
  const kind = a.meet!.kind;
  const [min, max] = PET_MEET.ms[kind];
  const until = now + min + rng() * (max - min);
  const action = PET_MEET.action[kind];
  const face = (w: Walker, o: Walker): Walker => ({ ...w, from: w.x, action, until, left: o.x < w.x, meet: { ...w.meet!, phase: 'together' } });
  return [face(a, b), face(b, a)];
}

/** Options for stepWalkers: the gap between two meeting pets, as a share of the walking width. */
export interface StepOptions {
  gap?: number;
}

/**
 * Advances every walker whose walk or action is over; keeps the list in step
 * with the active pets (new ones join, rested ones leave). Now and then two
 * resting pets meet (1.81); only one meeting at a time.
 */
export function stepWalkers(walkers: Walker[], ids: PetId[], now: number, rng: Rng, opts: StepOptions = {}): Walker[] {
  const kept = walkers.filter((w) => ids.includes(w.id));
  const fresh = startWalkers(ids, now).filter((w) => !kept.some((k) => k.id === w.id));
  // a pet whose partner left the screen goes its own way
  const all = [...kept, ...fresh].map((w) => (w.meet && !kept.some((k) => k.id === w.meet!.with) ? { ...w, meet: undefined, action: 'rest' as const, from: positionAt(w, now), x: positionAt(w, now), until: now } : w));
  const next = [...all];
  const done = new Set<number>();
  for (let i = 0; i < next.length; i++) {
    const w = next[i];
    if (done.has(i) || now < w.until) continue;
    if (w.meet?.phase === 'approach') {
      const j = next.findIndex((o) => o.id === w.meet!.with);
      [next[i], next[j]] = together(w, next[j], now, rng);
      done.add(i).add(j);
      continue;
    }
    next[i] = nextStep(w, now, rng);
  }
  const free = next.map((w, i) => (isFree(w) ? i : -1)).filter((i) => i >= 0);
  if (free.length >= 2 && !next.some((w) => w.meet) && rng() < PET_MEET.chancePerTick) {
    const h = free[Math.floor(rng() * free.length)];
    const others = free.filter((i) => i !== h);
    const v = others[Math.floor(rng() * others.length)];
    [next[h], next[v]] = startMeeting(next[h], next[v], now, rng, opts.gap);
  }
  return next.every((w, i) => w === all[i]) && all.length === walkers.length && all.every((w, i) => w === walkers[i]) ? walkers : next;
}

/** Where a pet stands at `now` (0 to 1): partway along its walk, or where it is. */
export function positionAt(w: Walker, now: number): number {
  if (w.action !== 'walk') return w.x;
  const total = walkMs(w.from, w.x, w.pace);
  const done = Math.min(1, Math.max(0, 1 - (w.until - now) / total));
  return w.from + (w.x - w.from) * done;
}

/** What the pets play for a reaction from the store (1.80): the celebration, an event's own reaction, 😨 for a bad one, else 👀. */
export function reactionDef(r: { kind: 'celebrate' } | { kind: 'event'; eventId: string }): PetReactionDef {
  if (r.kind === 'celebrate') return PET_CELEBRATION;
  const own = PET_EVENT_REACTIONS[r.eventId];
  if (own) return own;
  return EVENTS_BY_ID[r.eventId]?.negative ? PET_NEGATIVE_REACTION : PET_GENERIC_REACTION;
}

/**
 * Every pet stops where it is and plays the reaction until `until` (1.80),
 * whatever it was doing (a nap included), then walks on.
 */
export function applyReaction(walkers: Walker[], react: PetReactionDef, now: number, until: number): Walker[] {
  return walkers.map((w) => {
    const x = positionAt(w, now);
    return { ...w, from: x, x, action: 'rest', until, react, meet: undefined };
  });
}

/** Clears reactions that are over (used while the pets stand still, when no step runs). */
export function endReactions(walkers: Walker[], now: number): Walker[] {
  return walkers.some((w) => w.react && now >= w.until) ? walkers.map((w) => (w.react && now >= w.until ? { ...w, react: undefined } : w)) : walkers;
}
