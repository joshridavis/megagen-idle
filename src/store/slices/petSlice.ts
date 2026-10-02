import { PETS_BY_ID, PET_STAGES, type PetId } from '../../data/pets';
import type { PetsState } from '../../types/state';
import { feedPet, setActivePet, updatePets } from '../../utils/pets';
import { deriveRates } from '../../utils/simulation';
import { pickSaved } from '../migrations';
import type { SliceCreator } from '../types';

export interface PetActions {
  /** Finds pets whose condition is met and finishes growth that is due (called by the idle engine). */
  tickPets: (now?: number) => void;
  feedPet: (id: PetId, now?: number) => boolean;
  setActivePet: (id: PetId) => void;
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
      s.logEvents(
        [
          ...r.found.map((id) => ({ kind: 'event' as const, text: `New pet: ${PETS_BY_ID[id].name}! See the Pets tab.`, toast: true })),
          ...r.grown.map((id) => ({
            kind: 'event' as const,
            text: `${PETS_BY_ID[id].name} grew up: now ${PET_STAGES[(r.state.pets.owned[id]?.stage ?? 1) - 1].toLowerCase()}.`,
            toast: true,
          })),
        ],
        now,
      );
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
  });
