import { GENERATORS } from '../data/generators';
import { BASE_CLICK_VALUE } from '../data/player';
import { RESEARCH_BY_ID } from '../data/research';
import type { BonusType } from '../types/research';
import type { GameState, ResourceId } from '../types/state';
import { EVENTS_BY_ID } from '../data/events';
import { getBonuses, getEnergyBonuses } from './bonuses';
import { getEffectMods, type ActiveEffect } from './effectMods';
import { getPlayerLevel, playerLevelEnergyBonus } from './playerLevel';
import { baseOutput, calculateEnergyRate } from './energyGeneration';
import { getFuelUseRates, getProductionRates } from './resourceSystem';
import { activePetBonus, withPetMods } from './pets';
import { getPlacementBonuses, getProducerPlacement } from './siteMap';
import type { PetsState } from '../types/state';

type Pets = PetsState['pets'];

/** The active pet as a row, named so players can see it working (playtest 15). */
const petSource = (name: string) => `${name} (pet)`;

export interface RateModifier {
  /** Where the boost comes from, e.g. a research name. */
  source: string;
  /** Fraction, 0.1 = +10%. Absent for flat changes such as fuel use. */
  percent?: number;
  /** What this boost adds, in the breakdown's unit. */
  amount: number;
}

/** How a rate is built up: base, then each boost. Reusable for resources later. */
export interface RateBreakdown {
  base: number;
  modifiers: RateModifier[];
  total: number;
}

/**
 * Additive percentage boosts of one bonus type from completed research,
 * applied to `base`. Matches how bonuses combine in getBonuses.
 */
export function breakdownFromResearch(base: number, completedResearch: string[], type: BonusType): RateBreakdown {
  const modifiers: RateModifier[] = [];
  for (const id of completedResearch) {
    const def = RESEARCH_BY_ID[id];
    for (const e of def?.effects ?? []) {
      if (e.type === type && e.value !== 0) modifiers.push({ source: def.name, percent: e.value, amount: base * e.value });
    }
  }
  return { base, modifiers, total: base + modifiers.reduce((sum, m) => sum + m.amount, 0) };
}

/** Energy per second: base from running generators, then research boosts. */
export function getEnergyBreakdown(
  state: Pick<GameState, 'activeGenerators' | 'completedResearch'> & {
    lifetimeEnergy?: number;
    activeEffects?: ActiveEffect[];
    pets?: Pets;
    /** With these, map placement bonuses count too (1.05). */
    producers?: GameState['producers'];
    roomCapacity?: number;
    mapPins?: Record<string, number>;
  },
): RateBreakdown {
  const running = state.activeGenerators.filter((g) => g.isActive);
  const base = running.reduce((sum, g) => sum + baseOutput(g), 0);
  const research = breakdownFromResearch(base, state.completedResearch, 'globalEnergy');
  const modifiers = [...research.modifiers];
  const level = playerLevelEnergyBonus(state.lifetimeEnergy ?? 0);
  if (level > 0) {
    modifiers.push({ source: `Player level ${getPlayerLevel(state.lifetimeEnergy ?? 0).level}`, percent: level, amount: base * level });
  }
  // timed random events (0.85)
  for (const a of state.activeEffects ?? []) {
    const def = EVENTS_BY_ID[a.id];
    const e = def?.effect;
    if (e?.kind !== 'timed' || !e.energy) continue;
    const affected = e.generator ? running.filter((g) => g.type === e.generator).reduce((sum, g) => sum + baseOutput(g), 0) : base;
    modifiers.push({ source: `${def.name} (event)`, percent: e.energy, amount: affected * e.energy });
  }
  const pet = state.pets ? activePetBonus({ pets: state.pets }) : null;
  if (pet && pet.value > 0) {
    const b = pet.def.bonus;
    const affected = b.kind === 'generator' ? running.filter((g) => b.generators.includes(g.type)).reduce((sum, g) => sum + baseOutput(g), 0) : b.kind === 'energy' ? base : 0;
    if (affected > 0) modifiers.push({ source: petSource(pet.def.name), percent: pet.value, amount: affected * pet.value });
  }
  const placement =
    state.producers && state.roomCapacity !== undefined
      ? getPlacementBonuses({ activeGenerators: state.activeGenerators, producers: state.producers, completedResearch: state.completedResearch, roomCapacity: state.roomCapacity, mapPins: state.mapPins })
      : {};
  const placed = running.reduce((sum, g) => sum + baseOutput(g) * (placement[g.id] ?? 0), 0);
  if (placed > 0) modifiers.push({ source: 'Placement on the map', amount: placed });
  // matches getGeneratorOutput, which never goes below 0 per generator
  const total = calculateEnergyRate(state.activeGenerators, getEnergyBonuses(state), {
    ...withPetMods(getEffectMods(state.activeEffects), state.pets ? { pets: state.pets } : undefined),
    placement,
  });
  return { base, modifiers, total };
}

/** Energy per click: base click value, click power boosts, then the energy/s share (capped). */
export function getClickBreakdown(completedResearch: string[], energyPerSecond = 0, pets?: Pets): RateBreakdown {
  const power = breakdownFromResearch(BASE_CLICK_VALUE, completedResearch, 'clickPower');
  const pet = pets ? activePetBonus({ pets }) : null;
  if (pet && pet.def.bonus.kind === 'click' && pet.value > 0) {
    const amount = BASE_CLICK_VALUE * pet.value;
    power.modifiers.push({ source: petSource(pet.def.name), percent: pet.value, amount });
    power.total += amount;
  }
  const share = getBonuses(completedResearch).clickRateShare;
  if (share <= 0) return power;
  const raw = breakdownFromResearch(1, completedResearch, 'clickRateShare').total - 1;
  const capped = share < raw ? ' (capped)' : '';
  const modifiers = [
    ...power.modifiers,
    { source: `${Math.round(share * 100)}% of your energy/s${capped}`, amount: share * Math.max(0, energyPerSecond) },
  ];
  return { base: power.base, modifiers, total: power.total + modifiers[modifiers.length - 1].amount };
}

/**
 * Net per-second change of one resource: base production from producers,
 * research production boosts, then fuel burned by running generators
 * (after fuel efficiency) as a negative modifier.
 */
export function getResourceBreakdown(
  state: Pick<GameState, 'producers' | 'activeGenerators' | 'completedResearch'> & {
    activeEffects?: ActiveEffect[];
    pets?: Pets;
    /** With these, map placement bonuses count too (1.18). */
    roomCapacity?: number;
    mapPins?: Record<string, number>;
  },
  id: ResourceId,
): RateBreakdown {
  const base = getProductionRates(state.producers)[id];
  const boosts = breakdownFromResearch(base, state.completedResearch, 'resourceProduction').modifiers;
  const specific = id === 'metal' ? 'metalProduction' : id === 'stone' ? 'stoneProduction' : null;
  if (specific) boosts.push(...breakdownFromResearch(base, state.completedResearch, specific).modifiers);
  for (const a of state.activeEffects ?? []) {
    const def = EVENTS_BY_ID[a.id];
    const e = def?.effect;
    if (e?.kind !== 'timed' || !e.production || (e.resource && e.resource !== id) || base <= 0) continue;
    boosts.push({ source: `${def.name} (event)`, percent: e.production, amount: base * e.production });
  }
  const pet = state.pets ? activePetBonus({ pets: state.pets }) : null;
  if (pet && pet.value > 0 && base > 0 && pet.def.bonus.kind === 'production' && (!pet.def.bonus.resource || pet.def.bonus.resource === id)) {
    boosts.push({ source: petSource(pet.def.name), percent: pet.value, amount: base * pet.value });
  }
  if (state.roomCapacity !== undefined && base > 0) {
    const placed = getProducerPlacement({ ...state, roomCapacity: state.roomCapacity })[id] ?? 0;
    if (placed > 0) boosts.push({ source: 'Placement on the map', percent: placed, amount: base * placed });
  }
  const bonuses = getBonuses(state.completedResearch);
  const burn = getFuelUseRates(state.activeGenerators, bonuses)[id];
  const modifiers: RateModifier[] = [...boosts];
  if (burn > 0) {
    const burners = state.activeGenerators.filter((g) => g.isActive && (GENERATORS[g.type]?.maintenanceCost?.[id] ?? 0) > 0);
    const eff = bonuses.fuelEfficiency > 0 ? ` (−${Math.round(bonuses.fuelEfficiency * 100)}% from research)` : '';
    modifiers.push({ source: `Fuel for ${burners.length} running generator${burners.length === 1 ? '' : 's'}${eff}`, amount: -burn });
  }
  return { base, modifiers, total: base + modifiers.reduce((sum, m) => sum + m.amount, 0) };
}
