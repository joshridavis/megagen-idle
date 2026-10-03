import { EVENTS_BY_ID, type EventDef } from '../data/events';
import { GENERATORS } from '../data/generators';
import { MAP_COLUMNS, SEA_COLUMNS } from '../data/map';
import { PRODUCERS } from '../data/producers';
import type { GeneratorType } from '../types/generator';
import type { ProducerId } from '../types/resource';
import type { GameState } from '../types/state';
import { applyEventEffect } from './eventEffects';
import type { Rng } from './rng';
import { layoutSite, terrainOfCell } from './siteMap';

/** A map event in progress (1.12): where it plays, and until when it can be clicked. Not saved. */
export interface MapEventState {
  id: string;
  at: number;
  /** The machine it happens to, if any. */
  key?: string;
  /** Tiles it plays over (site cells; for the sea, cells counted in view columns past the site). */
  cells: number[];
  generatorType?: GeneratorType;
  producer?: ProducerId;
  /** While before this time, the player can click it for its effect. */
  claimUntil?: number;
}

const pick = <T,>(list: T[], rng: Rng): T | undefined => (list.length ? list[Math.floor(rng() * list.length)] : undefined);

/** Picks what a map event happens to, or null if there is nothing fitting (no coal plant for a fire). */
export function pickMapTarget(s: GameState, def: EventDef, rng: Rng, now: number): MapEventState | null {
  const m = def.map;
  if (!m) return null;
  const site = layoutSite(s);
  const base: MapEventState = { id: def.id, at: now, cells: [] };
  if (m.claimSeconds) base.claimUntil = now + m.claimSeconds * 1000;
  switch (m.target) {
    case 'generator': {
      const running = new Set(s.activeGenerators.filter((g) => g.isActive).map((g) => g.id));
      const p = pick(
        site.placed.filter((x) => x.kind === 'generator' && running.has(x.id) && (!m.generatorType || x.type === m.generatorType)),
        rng,
      );
      return p ? { ...base, key: p.key, cells: p.cells, generatorType: p.type as GeneratorType } : null;
    }
    case 'producer': {
      const p = pick(
        site.placed.filter((x) => x.kind === 'producer'),
        rng,
      );
      return p ? { ...base, key: p.key, cells: p.cells, producer: p.id as ProducerId } : null;
    }
    case 'river': {
      const cells: number[] = [];
      for (let c = 0; c < site.capacity; c++) if (terrainOfCell(c) === 'river') cells.push(c);
      return cells.length ? { ...base, cells } : null;
    }
    case 'sea':
    case 'sky': {
      // the sea is drawn past the site's columns; the sky event uses the top rows
      const row = Math.floor(rng() * 4);
      const cells = m.target === 'sea' ? [row * (MAP_COLUMNS + SEA_COLUMNS) + MAP_COLUMNS] : [];
      return { ...base, cells };
    }
  }
}

/**
 * Applies a map event's effect for its target: a lightning strike boosts the
 * struck generator's type, a delivery brings that producer's resource.
 */
export function applyMapEvent(s: GameState, ev: MapEventState, now: number, rng: Rng): { state: GameState; text: string } {
  const def = EVENTS_BY_ID[ev.id];
  if (!def?.effect) return { state: s, text: def?.text ?? '' };
  let d: EventDef = def;
  if (def.effect.kind === 'grant-resource' && ev.producer) {
    d = { ...def, effect: { ...def.effect, resource: PRODUCERS[ev.producer].resource } };
  }
  if (def.effect.kind === 'timed' && ev.generatorType && !def.effect.generator) {
    // Saved with the struck type, so it boosts just that type (playtest 19.3):
    // a strike on a type already boosted adds its time to the running boost,
    // and a strike on another type gets its own boost and timer.
    const type = ev.generatorType;
    const list = s.activeEffects ?? [];
    const running = list.find((a) => a.id === def.id && a.generator === type && a.until > now);
    const until = (running ? running.until : now) + def.effect.minutes * 60_000;
    const rest = list.filter((a) => !(a.id === def.id && a.generator === type));
    const name = GENERATORS[type].name;
    const pct = Math.round((def.effect.energy ?? 0) * 100);
    const text = running
      ? `Lightning struck a ${name} again: the +${pct}% for your ${name}s runs ${def.effect.minutes} minutes longer.`
      : `Lightning struck a ${name}: +${pct}% from your ${name}s for ${def.effect.minutes} minutes.`;
    return { state: { ...s, activeEffects: [...rest, { id: def.id, until, generator: type }] }, text };
  }
  return applyEventEffect(s, d, now, rng);
}
