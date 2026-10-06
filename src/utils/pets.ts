import { GROW_HOURS, MAX_PET_SLOTS, PET_SLOT_UPGRADES, PETS, PETS_BY_ID, type PetDef, type PetId } from '../data/pets';
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
    pets: { ...s.pets, owned: { ...s.pets.owned, [id]: { stage: 1, growUntil: null, foundAt: now } }, active: s.pets.active ?? id },
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

/** The pet that is growing now, if any (1.57: one grows at a time). */
export function growingPet(s: Pick<S, 'pets'>): { id: PetId; until: number } | null {
  for (const [id, pet] of Object.entries(s.pets.owned)) if (pet && pet.growUntil !== null) return { id: id as PetId, until: pet.growUntil };
  return null;
}

/** Why another pet cannot start growing: one grows at a time (1.57). Null when none is growing. */
export function otherPetGrowing(s: Pick<S, 'pets'>, id: PetId): { id: PetId; until: number } | null {
  const g = growingPet(s);
  return g && g.id !== id ? g : null;
}

/** How far a growing pet is toward its next stage, 0 to 1 (1.58). */
export function growProgress(stage: number, growUntil: number, now: number): number {
  const total = GROW_HOURS[Math.min(GROW_HOURS.length, Math.max(1, stage)) - 1] * 3_600_000;
  return Math.min(1, Math.max(0, 1 - (growUntil - now) / total));
}

export function canFeed(s: S, id: PetId): boolean {
  const cost = feedCost(s, id);
  if (cost === null || otherPetGrowing(s, id)) return false;
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

/** Active slots owned, 1 to 3 (1.59). */
export const petSlots = (s: Pick<S, 'pets'>): number => Math.max(1, Math.min(MAX_PET_SLOTS, s.pets.slots ?? 1));

/** The active pets, first slot first (1.59). */
export function activePets(s: Pick<S, 'pets'>): PetId[] {
  const ids = [s.pets.active, ...(s.pets.extra ?? [])].filter((id): id is string => !!id && !!s.pets.owned[id]);
  return [...new Set(ids)].slice(0, petSlots(s)) as PetId[];
}

const withActive = (s: S, ids: PetId[]): S => ({ ...s, pets: { ...s.pets, active: ids[0] ?? null, extra: ids.slice(1) } });

/**
 * Makes a pet active (1.59): into a free slot if there is one, otherwise in
 * place of the pet in the first slot. A pet never fills two slots.
 */
export function setActivePet(s: S, id: PetId): S {
  if (!s.pets.owned[id]) return s;
  const ids = activePets(s);
  if (ids.includes(id)) return s;
  return withActive(s, ids.length < petSlots(s) ? [...ids, id] : [id, ...ids.slice(1)]);
}

/** Takes a pet out of its slot (1.59). The last active pet stays. */
export function restPet(s: S, id: PetId): S {
  const ids = activePets(s);
  if (!ids.includes(id) || ids.length <= 1) return s;
  return withActive(
    s,
    ids.filter((x) => x !== id),
  );
}

/** The next slot upgrade: its price and player level, or null when all 3 slots are owned (1.59). */
export function nextPetSlot(s: Pick<S, 'pets'>): { energy: number; playerLevel: number } | null {
  return PET_SLOT_UPGRADES[petSlots(s) - 1] ?? null;
}

/** Why the next slot cannot be bought, or null if it can (1.59). */
export function petSlotBlock(s: Pick<S, 'pets' | 'energy' | 'lifetimeEnergy'>): string | null {
  const next = nextPetSlot(s);
  if (!next) return 'All slots owned.';
  if (getPlayerLevel(s.lifetimeEnergy).level < next.playerLevel) return `Needs player level ${next.playerLevel}.`;
  if (s.energy < next.energy) return 'Not enough energy.';
  return null;
}

/** Buys the next active slot with energy (1.59). Returns the same state if not allowed. */
export function buyPetSlot(s: S): S {
  if (petSlotBlock(s)) return s;
  const next = nextPetSlot(s)!;
  return { ...s, energy: s.energy - next.energy, pets: { ...s.pets, slots: petSlots(s) + 1, extra: s.pets.extra ?? [] } };
}

/** Each active pet's bonus at its stage, as a fraction (1.59: up to 3 pets, bonuses stack). */
export function activePetBonuses(s: Pick<S, 'pets'>): { def: PetDef; value: number }[] {
  return activePets(s).map((id) => {
    const def = PETS_BY_ID[id];
    return { def, value: def.bonusByStage[Math.min(3, s.pets.owned[id]!.stage) - 1] };
  });
}

/** The first active pet's bonus, or null. */
export function activePetBonus(s: Pick<S, 'pets'>): { def: PetDef; value: number } | null {
  return activePetBonuses(s)[0] ?? null;
}

/** Adds every active pet's energy or production bonus to effect modifiers. */
export function withPetMods(mods: EffectMods, s: Pick<S, 'pets'> | undefined): EffectMods {
  const list = s?.pets ? activePetBonuses(s) : [];
  if (!list.length) return mods;
  const out: EffectMods = { ...mods, generator: { ...mods.generator }, resource: { ...mods.resource } };
  for (const b of list) {
    const bonus = b.def.bonus;
    if (bonus.kind === 'generator') for (const g of bonus.generators) out.generator[g] = (out.generator[g] ?? 0) + b.value;
    else if (bonus.kind === 'energy') out.allEnergy += b.value;
    else if (bonus.kind === 'production') {
      if (bonus.resource) out.resource[bonus.resource] = (out.resource[bonus.resource] ?? 0) + b.value;
      else out.allProduction += b.value;
    }
  }
  return out;
}

/** Extra click power from the active pets (fraction of the base click). */
export function petClickBonus(s: Pick<S, 'pets'> | undefined): number {
  const list = s?.pets ? activePetBonuses(s) : [];
  return list.reduce((sum, b) => sum + (b.def.bonus.kind === 'click' ? b.value : 0), 0);
}

/** Faster research from the active pets (1.56): added to the research speed bonus. */
export function petResearchSpeed(s: Pick<S, 'pets'> | undefined): number {
  const list = s?.pets ? activePetBonuses(s) : [];
  return list.reduce((sum, b) => sum + (b.def.bonus.kind === 'research' ? b.value : 0), 0);
}

/** Bigger contract rewards from the active pets (1.56): added to the Rewards perk. */
export function petContractBonus(s: Pick<S, 'pets'> | undefined): number {
  const list = s?.pets ? activePetBonuses(s) : [];
  return list.reduce((sum, b) => sum + (b.def.bonus.kind === 'contracts' ? b.value : 0), 0);
}
