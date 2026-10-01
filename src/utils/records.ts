import type { Generator } from '../types/generator';
import type { GeneratorRecords } from '../types/state';

/** Records implied by a list of generators (used by save migration). */
export function recordsFromGenerators(generators: Generator[]): GeneratorRecords {
  return generators.reduce<GeneratorRecords>(noteGenerator, { builtTypes: [], bestLevel: {} });
}

/** Adds a built or upgraded generator to the records; never lowers anything. */
export function noteGenerator(records: GeneratorRecords, g: Pick<Generator, 'type' | 'level'>): GeneratorRecords {
  const builtTypes = records.builtTypes.includes(g.type) ? records.builtTypes : [...records.builtTypes, g.type];
  const best = records.bestLevel[g.type] ?? 0;
  const bestLevel = g.level > best ? { ...records.bestLevel, [g.type]: g.level } : records.bestLevel;
  return builtTypes === records.builtTypes && bestLevel === records.bestLevel ? records : { builtTypes, bestLevel };
}
