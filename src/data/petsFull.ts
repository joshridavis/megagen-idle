import { GeneratorType } from '../types/generator';
import type { PetDef } from './pets';

/**
 * The energy pets found through the Full Game's machines (2.04). Kept apart so the demo bundle
 * leaves them out; src/data/pets.ts merges them back after the pet named in `after`. Bonus
 * sizes are written out (pets.ts's `stages` would be a circular import).
 */
export const FULL_PET_DEFS: { after: string; items: PetDef[] }[] = [
  {
    after: 'beetle',
    items: [
      {
        id: 'jellyfish',
        name: 'Glowing Jellyfish',
        description: 'Drifts in the cooling pond, glowing softly. Boosts uranium production.',
        find: { kind: 'build', generator: GeneratorType.NUCLEAR },
        hint: 'Build a Nuclear Fission Plant.',
        bonus: { kind: 'production', resource: 'uranium' },
        bonusByStage: [0.075, 0.15, 0.3], // stages(0.3) in pets.ts: Baby 1x, Young 2x, Adult 4x of a quarter
        food: 'energy',
        feedCost: [500_000, 10_000_000],
      },
    ],
  },
  {
    after: 'owl',
    items: [
      {
        id: 'axolotl',
        name: 'Atomic Axolotl',
        description: 'Glows happily in the reactor cooling tanks. Boosts fission and fusion plants.',
        find: { kind: 'build', generator: GeneratorType.FUSION },
        hint: 'Build a Fusion Reactor.',
        bonus: { kind: 'generator', generators: [GeneratorType.NUCLEAR, GeneratorType.FUSION] },
        bonusByStage: [0.025, 0.05, 0.1], // stages(0.1)
        food: 'energy',
        feedCost: [20_000_000, 400_000_000],
      },
    ],
  },
];
