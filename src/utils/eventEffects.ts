import { MAX_LOSS_FRACTION, type EventDef } from '../data/events';
import type { GameState } from '../types/state';
import type { Rng } from './rng';
export type { ActiveEffect } from './effectMods';
import { getProductionRates } from './resourceSystem';
import { getBonuses } from './bonuses';
import { formatNumber } from './format';
import { RESOURCE_NAMES } from '../data/resources';
import { PETS_BY_ID, type PetId } from '../data/pets';
import { addPet } from './pets';

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
      const amount = Math.max(e.min, rate * e.minutes * 60);
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
