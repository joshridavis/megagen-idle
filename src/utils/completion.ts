import { GENERATOR_TYPES, GENERATORS, UPGRADES } from '../data/generators';
import { ACHIEVEMENTS } from '../data/achievements';
import { CONTRACT_MILESTONES, PERK_IDS, PERKS } from '../data/contracts';
import { DECORATION_LIMIT, DECORATIONS } from '../data/decorations';
import { PET_SLOT_UPGRADES, PETS } from '../data/pets';
import { PRODUCER_IDS, PRODUCERS } from '../data/producers';
import { RESEARCH } from '../data/research';
import { ROOM_TIERS } from '../data/rooms';
import type { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { boughtCount } from './decorations';

export interface CompletionItem {
  id: string;
  label: string;
  done: boolean;
  /** Extra state, such as "Lv 7/10". */
  detail?: string;
}

export interface CompletionPart {
  label: string;
  done: number;
  total: number;
  /** Every entry of the part, for the completion log (0.66). */
  items: CompletionItem[];
}

/**
 * How close a save is to 100% completion ("perfection", owner playtests 5-6):
 * research completed, generator types built, generator types upgraded to
 * max level (0.82), room tiers bought, producer types owned. Achievements join in 0.65.
 * Overall = done / total over all entries; each part lists its entries for the completion log.
 */
export function getCompletion(
  state: Pick<GameState, 'completedResearch' | 'records' | 'expansionLevel' | 'producers'> &
    Partial<Pick<GameState, 'contracts' | 'pets' | 'achievements' | 'decorationsBought'>>,
): { parts: CompletionPart[]; done: number; total: number; ratio: number } {
  const maxOf = (t: GeneratorType) => GENERATORS[t].maxLevel ?? UPGRADES.maxLevel;
  const part = (label: string, items: CompletionItem[]): CompletionPart => ({
    label,
    done: items.filter((i) => i.done).length,
    total: items.length,
    items,
  });
  const parts: CompletionPart[] = [
    part(
      'Research',
      RESEARCH.map((r) => ({ id: r.id, label: r.name, done: state.completedResearch.includes(r.id) })),
    ),
    part(
      'Generator types built',
      GENERATOR_TYPES.map((t) => ({ id: t, label: GENERATORS[t].name, done: state.records.builtTypes.includes(t) })),
    ),
    part(
      'Generator types at max level',
      GENERATOR_TYPES.map((t) => {
        const best = state.records.bestLevel[t] ?? 0;
        return { id: t, label: GENERATORS[t].name, done: best >= maxOf(t), detail: `Lv ${best}/${maxOf(t)}` };
      }),
    ),
    part(
      'Room expansions',
      ROOM_TIERS.map((tier, i) => ({ id: `room-${i + 1}`, label: `Expansion ${i + 1}: +${tier.capacity} room`, done: state.expansionLevel > i })),
    ),
    part(
      'Producer types owned',
      PRODUCER_IDS.map((p) => ({ id: p, label: PRODUCERS[p].name, done: (state.producers[p] ?? 0) > 0 })),
    ),
    // Grid Contracts (0.86)
    part(
      'Contracts completed',
      CONTRACT_MILESTONES.map((n) => ({
        id: `contracts-${n}`,
        label: `${n} contracts`,
        done: (state.contracts?.done ?? 0) >= n,
        detail: `${Math.min(n, state.contracts?.done ?? 0)}/${n}`,
      })),
    ),
    part(
      'Contract perks',
      PERK_IDS.flatMap((id) =>
        PERKS[id].costs.map((_, lv) => ({
          id: `perk-${id}-${lv + 1}`,
          label: PERKS[id].costs.length > 1 ? `${PERKS[id].name} ${lv + 1}` : PERKS[id].name,
          done: (state.contracts?.perks[id] ?? 0) > lv,
        })),
      ),
    ),
    // Energy pets (0.92)
    part(
      'Pets found',
      PETS.map((p) => ({ id: `pet-${p.id}`, label: state.pets?.owned[p.id] ? p.name : '???', done: !!state.pets?.owned[p.id] })),
    ),
    part(
      'Pets fully grown',
      PETS.map((p) => ({
        id: `pet-adult-${p.id}`,
        label: state.pets?.owned[p.id] ? p.name : '???',
        done: (state.pets?.owned[p.id]?.stage ?? 0) >= 3,
      })),
    ),
    // Pet slots (1.59): the 2nd and 3rd active slot
    part(
      'Pet slots',
      PET_SLOT_UPGRADES.map((_, i) => ({ id: `pet-slot-${i + 2}`, label: `Active pet slot ${i + 2}`, done: (state.pets?.slots ?? 1) >= i + 2 })),
    ),
    // Decorations (1.53): every copy of every kind (owner, playtest 24: up to 6 of a kind, so all 6 of each)
    part(
      'Decorations',
      DECORATIONS.map((d) => ({
        id: `decor-${d.id}`,
        label: d.name,
        done: boughtCount(state, d.id) >= DECORATION_LIMIT,
        detail: `${Math.min(boughtCount(state, d.id), DECORATION_LIMIT)}/${DECORATION_LIMIT} bought`,
      })),
    ),
    // Achievements (0.65); bonus ones do not count
    part(
      'Achievements',
      ACHIEVEMENTS.filter((a) => !a.bonus).map((a) => ({ id: `ach-${a.id}`, label: a.name, done: state.achievements?.[a.id] !== undefined })),
    ),
  ];
  const done = parts.reduce((s, p) => s + p.done, 0);
  const total = parts.reduce((s, p) => s + p.total, 0);
  return { parts, done, total, ratio: total ? done / total : 1 };
}

/** Completion as shown to the player: one decimal, rounded down, so 100% only when everything is done. */
export function formatCompletion(ratio: number): string {
  return `${(Math.floor(Math.max(0, Math.min(1, ratio)) * 1000) / 10).toFixed(1)}%`;
}
