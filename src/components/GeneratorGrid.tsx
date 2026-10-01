import { GENERATOR_TYPES } from '../data/generators';
import { useStore } from '../store';
import { getUnlockedGenerators } from '../store/selectors';
import { getBuildBlock } from '../utils/generatorSystem';
import GeneratorCard from './GeneratorCard';

export default function GeneratorGrid() {
  // Subscribe to the inputs that decide whether each card can be built.
  const state = useStore((s) => s);
  const unlocked = getUnlockedGenerators(state);
  return (
    <section aria-label="Build generators" className="w-full">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Build</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GENERATOR_TYPES.map((type) => (
          <GeneratorCard key={type} type={type} block={getBuildBlock(state, type, unlocked)} />
        ))}
      </div>
    </section>
  );
}
