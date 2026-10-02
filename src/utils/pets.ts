import { GROW_HOURS, PETS, PETS_BY_ID, type PetDef, type PetId } from '../data/pets';
import type { GameState, OwnedPet } from '../types/state';
import type { EffectMods } from './effectMods';
import { getPlayerLevel } from './playerLevel';

type S = GameState;

export const ownedPet = (s: Pick<S, 'pets'>, id: PetId): OwnedPet | undefined => s.pets.owned[id];

/** Whether a pet's find condition is met (event finds happen through random events instead). */
export function meetsFind(def: PetDef, s: S): boolean {
  const f = def.find;
  switch (f.kind) {
    case 'level':
      return getPlayerLevel(s.lifetimeEnergy).level >= f.level;
    case 'build':
      return s.records.builtTypes.includes(f.generator);
    case 'research':
      return s.completedResearch.includes(f.id);
    case 'contracts':
      return s.contracts.done >= f.count;
    default:
      return false;
  }
}

/** Adds a pet as a baby; the first pet found becomes the active one. */
export function addPet(s: S, id: PetId, now: number): S {
  if (s.pets.owned[id]) return s;
  return {
    ...s,
    pets: { owned: { ...s.pets.owned, [id]: { stage: 1, growUntil: null, foundAt: now } }, active: s.pets.active ?? id },
  };
}

export interface PetUpdate {
  state: S;
  found: PetId[];
  grown: PetId[];
}

/** Finds pets whose condition is met and finishes growth that is due (timestamp-based, offline too). */
export function updatePets(s: S, now: number): PetUpdate {
  let state = s;
  const found: PetId[] = [];
  const grown: PetId[] = [];
  const missing = PETS.filter((def) => !state.pets.owned[def.id]);
  for (const def of missing) {
    if (meetsFind(def, state)) {
      state = addPet(state, def.id, now);
      found.push(def.id);
    }
  }
  for (const [id, pet] of Object.entries(state.pets.owned)) {
    if (pet && pet.growUntil !== null && pet.growUntil <= now) {
      state = { ...state, pets: { ...state.pets, owned: { ...state.pets.owned, [id]: { ...pet, stage: pet.stage + 1, growUntil: null } } } };
      grown.push(id as PetId);
    }
  }
  return { state, found, grown };
}

/** Food needed to start growing to the next stage, or null when adult or already growing. */
export function feedCost(s: Pick<S, 'pets'>, id: PetId): number | null {
  const pet = s.pets.owned[id];
  if (!pet || pet.stage >= 3 || pet.growUntil !== null) return null;
  return PETS_BY_ID[id].feedCost[pet.stage - 1];
}

export function canFeed(s: S, id: PetId): boolean {
  const cost = feedCost(s, id);
  if (cost === null) return false;
  const food = PETS_BY_ID[id].food;
  return (food === 'energy' ? s.energy : s.resources[food]) >= cost;
}

/** Pays the food and starts growing; the pet reaches the next stage after GROW_HOURS. */
export function feedPet(s: S, id: PetId, now: number): S {
  if (!canFeed(s, id)) return s;
  const pet = s.pets.owned[id]!;
  const cost = feedCost(s, id)!;
  const food = PETS_BY_ID[id].food;
  const paid = food === 'energy' ? { energy: s.energy - cost } : { resources: { ...s.resources, [food]: s.resources[food] - cost } };
  const growUntil = now + GROW_HOURS[pet.stage - 1] * 3_600_000;
  return { ...s, ...paid, pets: { ...s.pets, owned: { ...s.pets.owned, [id]: { ...pet, growUntil } } } };
}

export function setActivePet(s: S, id: PetId): S {
  return s.pets.owned[id] && s.pets.active !== id ? { ...s, pets: { ...s.pets, active: id } } : s;
}

/** The active pet's bonus at its stage, as a fraction. */
export function activePetBonus(s: Pick<S, 'pets'>): { def: PetDef; value: number } | null {
  const id = s.pets.active as PetId | null;
  const pet = id ? s.pets.owned[id] : undefined;
  if (!id || !pet) return null;
  const def = PETS_BY_ID[id];
  return { def, value: def.bonusByStage[Math.min(3, pet.stage) - 1] };
}

/** Adds the active pet's energy or production bonus to effect modifiers. */
export function withPetMods(mods: EffectMods, s: Pick<S, 'pets'> | undefined): EffectMods {
  const b = s?.pets ? activePetBonus(s) : null;
  if (!b) return mods;
  const out: EffectMods = { ...mods, generator: { ...mods.generator }, resource: { ...mods.resource } };
  const bonus = b.def.bonus;
  if (bonus.kind === 'generator') for (const g of bonus.generators) out.generator[g] = (out.generator[g] ?? 0) + b.value;
  else if (bonus.kind === 'energy') out.allEnergy += b.value;
  else if (bonus.kind === 'production') {
    if (bonus.resource) out.resource[bonus.resource] = (out.resource[bonus.resource] ?? 0) + b.value;
    else out.allProduction += b.value;
  }
  return out;
}

/** Extra click power from the active pet (fraction of the base click). */
export function petClickBonus(s: Pick<S, 'pets'> | undefined): number {
  const b = s?.pets ? activePetBonus(s) : null;
  return b && b.def.bonus.kind === 'click' ? b.value : 0;
}
