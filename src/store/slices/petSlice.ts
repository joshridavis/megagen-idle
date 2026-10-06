import { ENTRY_ICONS } from '../../data/logIcons';
import { PETS_BY_ID, PET_STAGES, type PetId } from '../../data/pets';
import type { PetsState } from '../../types/state';
import { buyPetSlot, feedPet, restPet, setActivePet, updatePets } from '../../utils/pets';
import { deriveRates } from '../../utils/simulation';
import { pickSaved } from '../migrations';
import type { LogInput } from '../../utils/eventLog';
import type { SliceCreator } from '../types';

export interface PetActions {
  /** Finds pets whose condition is met and finishes growth that is due (called by the idle engine). */
  tickPets: (now?: number) => void;
  feedPet: (id: PetId, now?: number) => boolean;
  setActivePet: (id: PetId) => void;
  /** Takes a pet out of its active slot (1.59); the last active pet stays. */
  restPet: (id: PetId) => void;
  /** Buys the next active pet slot with energy (1.59). Returns success. */
  buyPetSlot: () => boolean;
}

/** Log entries for pets found and grown, each kind with its own icon (1.40). */
export function petLogEntries(found: PetId[], grown: PetId[], owned: PetsState['pets']['owned']): LogInput[] {
  return [
    ...found.map((id) => ({ kind: 'event' as const, icon: ENTRY_ICONS.petFound, text: `New pet: ${PETS_BY_ID[id].name}! See the Pets tab.`, toast: true })),
    ...grown.map((id) => ({
      kind: 'event' as const,
      icon: ENTRY_ICONS.petGrown,
      text: `${PETS_BY_ID[id].name} grew up: now ${PET_STAGES[(owned[id]?.stage ?? 1) - 1].toLowerCase()}.`,
      toast: true,
    })),
  ];
}

/** Energy pets (0.92). Game rules live in src/utils/pets.ts. */
export const createPetSlice =
  (initial: PetsState): SliceCreator<PetsState & PetActions> =>
  (set, get) => ({
    ...initial,
    tickPets: (now = Date.now()) => {
      const s = get();
      const r = updatePets(pickSaved(s), now);
      if (!r.found.length && !r.grown.length) return;
      set(deriveRates(r.state), undefined, 'pets/tick');
      s.logEvents(petLogEntries(r.found, r.grown, r.state.pets.owned), now);
    },
    feedPet: (id, now = Date.now()) => {
      const before = pickSaved(get());
      const after = feedPet(before, id, now);
      if (after === before) return false;
      set({ energy: after.energy, resources: after.resources, pets: after.pets }, undefined, 'pets/feed');
      return true;
    },
    setActivePet: (id) => {
      const before = pickSaved(get());
      const after = setActivePet(before, id);
      if (after !== before) set(deriveRates(after), undefined, 'pets/active');
    },
    restPet: (id) => {
      const before = pickSaved(get());
      const after = restPet(before, id);
      if (after !== before) set(deriveRates(after), undefined, 'pets/rest');
    },
    buyPetSlot: () => {
      const before = pickSaved(get());
      const after = buyPetSlot(before);
      if (after === before) return false;
      set({ energy: after.energy, pets: after.pets }, undefined, 'pets/slot');
      return true;
    },
  });
