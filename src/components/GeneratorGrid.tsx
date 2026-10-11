import { GENERATOR_TYPES, GENERATORS } from '../data/generators';
import { useStore } from '../store';
import { getUnlockedGenerators } from '../store/selectors';
import { getEnergyBonuses } from '../utils/bonuses';
import { getBuildBlock } from '../utils/generatorSystem';
import GeneratorCard from './GeneratorCard';
import { GENERATOR_SPRITES } from './generatorSprites';
import { FullGameLockedCard } from './Purchases';

export default function GeneratorGrid() {
  // Subscribe to the inputs that decide whether each card can be built.
  const state = useStore((s) => s);
  const unlocked = getUnlockedGenerators(state);
  const bonuses = getEnergyBonuses(state);
  return (
    <section aria-label="Build generators" className="w-full">
      <h2 className="mb-2 panel-title">Build</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GENERATOR_TYPES.map((type) =>
          // the demo's stand-ins for the Full Game's machines (2.04)
          GENERATORS[type].fullGame ? (
            <FullGameLockedCard key={type} name={GENERATORS[type].name} sprite={GENERATOR_SPRITES[type].active} testId={`generator-card-${type}`} />
          ) : (
            <GeneratorCard key={type} type={type} block={getBuildBlock(state, type, unlocked, bonuses)} bonuses={bonuses} />
          ),
        )}
      </div>
    </section>
  );
}
