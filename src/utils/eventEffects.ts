import { MAX_LOSS_FRACTION, type EventDef } from '../data/events';
import type { GameState } from '../types/state';
import type { GeneratorType } from '../types/generator';
import type { Rng } from './rng';
export type { ActiveEffect } from './effectMods';
import { getProductionRates } from './resourceSystem';
import { getBonuses } from './bonuses';
import { getPlayerLevel } from './playerLevel';
import { formatNumber } from './format';
import { RESOURCE_NAMES } from '../data/resources';
import { PETS_BY_ID, type PetId } from '../data/pets';
import { addPet } from './pets';
import { GENERATORS } from '../data/generators';
import { baseOutput } from './energyGeneration';

/** Whether an event's extra condition holds. */
export function meetsRequirement(
  def: EventDef,
  s: Pick<GameState, 'activeGenerators' | 'currentResearch' | 'resources' | 'producers'> & Partial<Pick<GameState, 'pets'>>,
): boolean {
  switch (def.requires) {
    case 'research-running':
      return s.currentResearch !== null;
    case 'two-running':
      return s.activeGenerators.filter((g) => g.isActive).length >= 2;
    case 'gas-or-oil':
      return s.resources.naturalGas >= 1 || s.resources.oil >= 1;
    case 'coal-mine':
      return (s.producers.coalMine ?? 0) > 0;
    case 'pet-missing':
      return def.effect?.kind === 'find-pet' && !s.pets?.owned[def.effect.pet];
    default:
      return true;
  }
}

/**
 * Applies an effect event to the state (0.85). Pure: returns the new state
 * and the log text. Timed effects of the same kind refresh rather than stack.
 * Negative effects never remove anything permanently and never take more than
 * MAX_LOSS_FRACTION of a resource. The caller re-derives rates.
 */
export function applyEventEffect(s: GameState, def: EventDef, now: number, rng: Rng): { state: GameState; text: string } {
  const e = def.effect;
  if (!e) return { state: s, text: def.text };
  const fmt = (n: number) => formatNumber(n, s.settings.notation);
  switch (e.kind) {
    case 'timed': {
      const until = now + e.minutes * 60_000;
      const rest = (s.activeEffects ?? []).filter((a) => a.id !== def.id);
      return { state: { ...s, activeEffects: [...rest, { id: def.id, until }] }, text: def.text };
    }
    case 'grant-energy': {
      const amount = Math.max(e.min, s.energyPerSecond * e.minutes * 60);
      return {
        state: { ...s, energy: s.energy + amount, lifetimeEnergy: s.lifetimeEnergy + amount },
        text: `${def.text} +${fmt(amount)} energy.`,
      };
    }
    case 'grant-resource': {
      const rate = getProductionRates(s.producers, getBonuses(s.completedResearch))[e.resource];
      const levelFactor = 1 + (e.perLevel ?? 0) * (getPlayerLevel(s.lifetimeEnergy ?? 0).level - 1);
      const amount = Math.max(e.min, rate * e.minutes * 60) * levelFactor;
      return {
        state: { ...s, resources: { ...s.resources, [e.resource]: s.resources[e.resource] + amount } },
        text: `${def.text} +${fmt(amount)} ${RESOURCE_NAMES[e.resource].toLowerCase()}.`,
      };
    }
    case 'research-boost': {
      const r = s.currentResearch;
      if (!r) return { state: s, text: def.text };
      return { state: { ...s, currentResearch: { ...r, startTime: r.startTime - r.duration * 1000 * e.fraction } }, text: def.text };
    }
    case 'grid-fault': {
      const running = s.activeGenerators.filter((g) => g.isActive);
      if (!running.length) return { state: s, text: def.text };
      const hit = running[Math.floor(rng() * running.length) % running.length];
      return {
        state: { ...s, activeGenerators: s.activeGenerators.map((g) => (g.id === hit.id ? { ...g, isActive: false } : g)) },
        text: def.text,
      };
    }
    case 'lose-resource': {
      const resources = { ...s.resources };
      const lost: string[] = [];
      for (const id of e.resources) {
        const n = Math.floor(resources[id] * Math.min(e.fraction, MAX_LOSS_FRACTION));
        if (n > 0) {
          resources[id] -= n;
          lost.push(`${fmt(n)} ${RESOURCE_NAMES[id].toLowerCase()}`);
        }
      }
      return { state: { ...s, resources }, text: lost.length ? `${def.text} −${lost.join(', −')}.` : def.text };
    }
    case 'find-pet':
      return { state: addPet(s, e.pet as PetId, now), text: `${def.text} New pet: ${PETS_BY_ID[e.pet as PetId]?.name}!` };
  }
}

/**
 * Exactly what a running timed effect does right now (playtest 15), e.g.
 * "−30% energy from Solar Panels: −1.2 energy/s from your 4 Solar Panels".
 */
/** The event as it acts now: a map event may have picked the generator type it boosts (1.12). */
export function effectiveDef(def: EventDef, active?: { generator?: GeneratorType }): EventDef {
  const e = def.effect;
  return active?.generator && e?.kind === 'timed' ? { ...def, effect: { ...e, generator: active.generator } } : def;
}

export function describeEffect(
  def: EventDef,
  s: Pick<GameState, 'activeGenerators' | 'producers' | 'completedResearch'>,
  fmtRate: (n: number) => string,
): string {
  const e = def.effect;
  if (e?.kind !== 'timed') return def.text;
  const parts: string[] = [];
  const sign = (n: number) => (n >= 0 ? '+' : '−');
  if (e.energy) {
    const gens = s.activeGenerators.filter((g) => g.isActive && (!e.generator || g.type === e.generator));
    const base = gens.reduce((sum, g) => sum + baseOutput(g), 0);
    const what = e.generator ? `${GENERATORS[e.generator].name}s` : 'all generators';
    const amount = base * e.energy;
    parts.push(
      `${sign(e.energy)}${Math.round(Math.abs(e.energy) * 100)}% energy from ${what}: ${sign(amount)}${fmtRate(Math.abs(amount))} energy/s` +
        (e.generator ? ` from your ${gens.length} running` : ''),
    );
  }
  if (e.production) {
    const rates = getProductionRates(s.producers, getBonuses(s.completedResearch));
    const ids = e.resource ? [e.resource] : (Object.keys(rates) as (keyof typeof rates)[]).filter((id) => rates[id] > 0);
    const what = e.resource ? RESOURCE_NAMES[e.resource].toLowerCase() : 'all producers';
    const detail = ids.map((id) => `${sign(e.production!)}${fmtRate(Math.abs(rates[id] * e.production!))} ${RESOURCE_NAMES[id].toLowerCase()}/s`).join(', ');
    parts.push(`${sign(e.production)}${Math.round(Math.abs(e.production) * 100)}% output from ${what}${detail ? `: ${detail}` : ''}`);
  }
  return parts.join('; ');
}
