import type { PerkId } from '../../data/contracts';
import type { ContractsState } from '../../types/state';
import { buyPerk, claimContract, deliverContract, updateContracts, type RewardChoice } from '../../utils/contracts';
import type { Rng } from '../../utils/rng';
import { deriveRates } from '../../utils/simulation';
import { pickSaved } from '../migrations';
import type { SliceCreator } from '../types';

export interface ContractActions {
  /** Expires, completes and offers contracts up to `now` (called by the idle engine). */
  tickContracts: (now?: number, rng?: Rng) => void;
  deliverContract: (id: string) => boolean;
  claimContract: (id: string, choice: RewardChoice, now?: number) => void;
  buyPerk: (id: PerkId) => boolean;
}

/** Grid Contracts (0.86). Game rules live in src/utils/contracts.ts. */
export const createContractSlice =
  (initial: ContractsState): SliceCreator<ContractsState & ContractActions> =>
  (set, get) => ({
    ...initial,
    tickContracts: (now = Date.now(), rng = Math.random) => {
      const s = get();
      const r = updateContracts(pickSaved(s), now, rng);
      if (r.state.contracts === s.contracts) return;
      set({ contracts: r.state.contracts }, undefined, 'contracts/tick');
      s.logEvents(
        [
          ...r.completed.map(() => ({ kind: 'event' as const, text: 'Contract complete! Choose your reward on the Contracts tab.', toast: true })),
          ...r.expired.map(() => ({ kind: 'event' as const, text: 'A contract ran out of time.', toast: false })),
          ...(r.offered.length ? [{ kind: 'event' as const, text: `${r.offered.length} new contract offer${r.offered.length > 1 ? 's' : ''}.`, toast: false }] : []),
        ],
        now,
      );
    },
    deliverContract: (id) => {
      const before = pickSaved(get());
      const after = deliverContract(before, id);
      if (after === before) return false;
      set({ energy: after.energy, resources: after.resources, contracts: after.contracts }, undefined, 'contracts/deliver');
      return true;
    },
    claimContract: (id, choice, now = Date.now()) => {
      const before = pickSaved(get());
      const after = claimContract(before, id, choice, now);
      if (after === before) return;
      set(deriveRates(after), undefined, 'contracts/claim');
    },
    buyPerk: (id) => {
      const before = pickSaved(get());
      const after = buyPerk(before, id);
      if (after === before) return false;
      set({ contracts: after.contracts }, undefined, 'contracts/perk');
      return true;
    },
  });
