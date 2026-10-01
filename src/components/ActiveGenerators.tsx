import { useMemo, useState } from 'react';
import { sprites } from '../assets';
import { GENERATORS } from '../data/generators';
import { useStore } from '../store';
import type { Generator } from '../types/generator';
import { getBonuses } from '../utils/bonuses';
import { getGeneratorOutput } from '../utils/energyGeneration';
import { GENERATOR_SPRITES } from './generatorSprites';

const NO_REFUND_TEXT = 'No refund: scrapping removes the generator for good and frees its room.';

function statusOf(g: Generator) {
  if (g.isActive) return { text: 'Running', className: 'text-emerald-400' };
  if (g.outOfFuel) return { text: 'Out of fuel', className: 'text-red-400' };
  return { text: 'Off', className: 'text-slate-400' };
}

export default function ActiveGenerators() {
  const generators = useStore((s) => s.activeGenerators);
  const toggle = useStore((s) => s.toggleGenerator);
  const scrap = useStore((s) => s.scrapGenerator);
  const [confirming, setConfirming] = useState<string | null>(null);
  const completed = useStore((s) => s.completedResearch);
  const bonuses = useMemo(() => getBonuses(completed), [completed]);
  return (
    <section aria-label="Your generators" className="w-full">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Your generators ({generators.length})
      </h2>
      {generators.length === 0 ? (
        <p className="rounded-lg bg-slate-800 p-3 text-sm text-slate-400">
          None yet. Build one above: a Solar Panel costs 10 metal.
        </p>
      ) : (
        <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
          {generators.map((g, i) => {
            const def = GENERATORS[g.type];
            const status = statusOf(g);
            const name = `${def.name} #${i + 1}`;
            return (
              <li key={g.id} className="rounded-lg bg-slate-800 p-2" data-testid={`generator-${g.id}`}>
                <div className="flex items-center gap-3">
                <img
                  src={sprites[g.isActive ? GENERATOR_SPRITES[g.type].active : GENERATOR_SPRITES[g.type].inactive]}
                  alt=""
                  className="pixelated h-12 w-12 object-contain"
                />
                <div className="flex-1">
                  <div className="font-medium">{name}</div>
                  <div className="text-xs">
                    <span className={status.className}>{status.text}</span>
                    <span className="text-slate-400"> · +{getGeneratorOutput(g, bonuses).toFixed(1)} energy/s · {def.roomCost} room</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(g.id)}
                  aria-pressed={g.isActive}
                  aria-label={`${g.isActive ? 'Turn off' : 'Turn on'} ${name}`}
                  className={`min-h-11 min-w-16 rounded px-3 py-2 text-sm font-semibold ${g.isActive ? 'bg-slate-600 hover:bg-slate-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                >
                  {g.isActive ? 'Turn off' : 'Turn on'}
                </button>
                {confirming !== g.id && (
                  <span className="group relative">
                    <button
                      type="button"
                      onClick={() => setConfirming(g.id)}
                      aria-label={`Scrap ${name}`}
                      aria-describedby={`scrap-tip-${g.id}`}
                      className="min-h-11 rounded px-2 py-2 text-sm text-slate-400 hover:bg-slate-700 hover:text-red-300"
                    >
                      Scrap
                    </button>
                    <span
                      id={`scrap-tip-${g.id}`}
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full right-0 z-30 mb-1 hidden w-52 rounded bg-slate-950 p-2 text-xs text-slate-200 shadow-lg group-hover:block group-has-focus-visible:block"
                    >
                      {NO_REFUND_TEXT}
                    </span>
                  </span>
                )}
                </div>
                {confirming === g.id && (
                  <div role="alert" className="mt-2 flex flex-wrap items-center gap-2 rounded bg-red-950/60 p-2 text-sm text-red-100">
                    <span className="flex-1">{NO_REFUND_TEXT}</span>
                    <button
                      type="button"
                      onClick={() => {
                        scrap(g.id);
                        setConfirming(null);
                      }}
                      aria-label={`Confirm scrap ${name}`}
                      className="min-h-11 rounded bg-red-700 px-3 py-2 font-semibold hover:bg-red-600"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      autoFocus
                      onClick={() => setConfirming(null)}
                      aria-label={`Cancel scrap ${name}`}
                      className="min-h-11 rounded bg-slate-600 px-3 py-2 font-semibold hover:bg-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
