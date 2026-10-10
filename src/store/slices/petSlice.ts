import { ENTRY_ICONS } from '../../data/logIcons';
import { PETS_BY_ID, PET_REACTION_MS, PET_STAGES, type PetId } from '../../data/pets';
import type { PetsState } from '../../types/state';
import { buyPetSlot, feedPet, restPet, setActivePet, updatePets } from '../../utils/pets';
import { countPetClick } from '../../utils/petClicks';
import { deriveRates } from '../../utils/simulation';
import { pickSaved } from '../migrations';
import type { LogInput } from '../../utils/eventLog';
import type { PetReaction, SliceCreator, TransientState } from '../types';

export interface PetActions {
  /**
   * Finds pets whose condition is met and finishes growth that is due (called
   * by the idle engine). During live play a pet's stage-up is celebrated (1.58).
   */
  tickPets: (now?: number, live?: boolean) => void;
  feedPet: (id: PetId, now?: number) => boolean;
  setActivePet: (id: PetId) => void;
  /** Takes a pet out of its active slot (1.59); the last active pet stays. */
  restPet: (id: PetId) => void;
  /** Buys the next active pet slot with energy (1.59). Returns success. */
  buyPetSlot: () => boolean;
  /** A pet was petted (clicked, 1.51): counts in the stats, rate-capped. Returns whether it counted. */
  petPet: (now?: number) => boolean;
  /**
   * The walking pets celebrate or react (1.80). Ignored while one still plays,
   * so a burst of events plays only the first. Live play only: callers skip it
   * when catching up on time away.
   */
  reactPets: (reaction: { kind: 'celebrate' } | { kind: 'event'; eventId: string }, now?: number) => void;
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

/** Times of recently counted pet clicks (1.51), for the rate cap. Not saved. */
let recentPetClicks: number[] = [];

/** Energy pets (0.92). Game rules live in src/utils/pets.ts. */
export const createPetSlice =
  (initial: PetsState): SliceCreator<PetsState & Pick<TransientState, 'celebrations' | 'petReaction'> & PetActions> =>
  (set, get) => ({
    ...initial,
    celebrations: [],
    petReaction: null,
    petPet: (now = Date.now()) => {
      const r = countPetClick(recentPetClicks, now);
      recentPetClicks = r.recent;
      if (!r.counts) return false;
      set((st) => ({ stats: { ...st.stats, petClicks: (st.stats?.petClicks ?? 0) + 1 } }), undefined, 'pets/pet');
      return true;
    },
    reactPets: (reaction, now = Date.now()) => {
      const cur = get().petReaction;
      if (cur && now >= cur.at && now - cur.at < PET_REACTION_MS) return;
      set({ petReaction: { ...reaction, at: now } as PetReaction }, undefined, 'pets/react');
    },
    tickPets: (now = Date.now(), live = false) => {
      const s = get();
      const r = updatePets(pickSaved(s), now);
      if (!r.found.length && !r.grown.length) return;
      const grown = live
        ? { celebrations: [...s.celebrations, ...r.grown.map((id) => ({ kind: 'pet' as const, id, stage: r.state.pets.owned[id]?.stage ?? 1, at: now }))] }
        : {};
      set({ ...deriveRates(r.state), ...grown }, undefined, 'pets/tick');
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
