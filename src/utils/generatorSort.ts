import { GENERATORS, UPGRADES } from '../data/generators';
import type { Bonuses } from '../types/bonus';
import type { Generator } from '../types/generator';
import type { GeneratorSort } from '../types/state';
import { getGeneratorOutput } from './energyGeneration';

export const GENERATOR_SORTS: { id: GeneratorSort; label: string }[] = [
  { id: 'custom', label: 'Your order (fuel priority)' },
  { id: 'upgradable', label: 'Upgradable first' },
  { id: 'output-desc', label: 'Most energy/s' },
  { id: 'output-asc', label: 'Least energy/s' },
  { id: 'level-desc', label: 'Highest level' },
  { id: 'level-asc', label: 'Lowest level' },
  { id: 'type', label: 'Type' },
];

const num = (g: Generator) => Number(g.id.split('-')[1]) || 0;

/**
 * The generator list as displayed (0.96). Returns a new array; the saved
 * order (fuel priority) is never changed. Switched-off generators count as
 * 0 energy/s. Ties keep your order. 'upgradable' (playtest 14) puts upgrades
 * you can afford now first, then the rest that are not maxed, then maxed ones.
 */
export function sortGenerators(
  list: Generator[],
  mode: GeneratorSort,
  bonuses: Bonuses,
  /** For 'upgradable': whether an upgrade is affordable right now. */
  canUpgrade: (g: Generator) => boolean = () => false,
): Generator[] {
  if (mode === 'custom') return list;
  const out = getGeneratorOutput;
  const typeOrder = Object.keys(GENERATORS);
  const maxLevel = (g: Generator) => GENERATORS[g.type].maxLevel ?? UPGRADES.maxLevel;
  // affordable now first, then not maxed (cannot afford yet), then maxed
  const upgradeRank = (g: Generator) => (canUpgrade(g) ? 0 : g.level < maxLevel(g) ? 1 : 2);
  const cmp: Record<Exclude<GeneratorSort, 'custom'>, (a: Generator, b: Generator) => number> = {
    upgradable: (a, b) => upgradeRank(a) - upgradeRank(b),
    'output-desc': (a, b) => out(b, bonuses) - out(a, bonuses),
    'output-asc': (a, b) => out(a, bonuses) - out(b, bonuses),
    'level-desc': (a, b) => b.level - a.level,
    'level-asc': (a, b) => a.level - b.level,
    type: (a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type) || num(a) - num(b),
  };
  return list
    .map((g, i) => ({ g, i }))
    .sort((a, b) => cmp[mode](a.g, b.g) || a.i - b.i)
    .map((x) => x.g);
}
