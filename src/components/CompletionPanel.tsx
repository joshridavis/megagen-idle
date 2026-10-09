import { useMemo, useState } from 'react';
import { EVENTS, RARITY_LABEL, rarityColor } from '../data/events';
import { useStore } from '../store';
import { formatCompletion, getCompletion } from '../utils/completion';
import ProgressBar from './ProgressBar';

/**
 * Completion log (0.66, playtest 10): overall % and every part, each
 * expandable to show exactly what is done and what is left.
 */
export default function CompletionPanel() {
  const completedResearch = useStore((s) => s.completedResearch);
  const records = useStore((s) => s.records);
  const expansionLevel = useStore((s) => s.expansionLevel);
  const producers = useStore((s) => s.producers);
  const contracts = useStore((s) => s.contracts);
  const pets = useStore((s) => s.pets);
  const achievements = useStore((s) => s.achievements);
  // owner report, playtest 24: without this the Decorations part always read 0 bought
  const decorationsBought = useStore((s) => s.decorationsBought);
  const c = useMemo(
    () => getCompletion({ completedResearch, records, expansionLevel, producers, contracts, pets, achievements, decorationsBought }),
    [completedResearch, records, expansionLevel, producers, contracts, pets, achievements, decorationsBought],
  );
  const [open, setOpen] = useState<string | null>(null);
  const seen = useStore((s) => s.seenEvents);
  const sightings = EVENTS.filter((e) => e.animation);
  const found = sightings.filter((e) => seen[e.id]);

  return (
    <section aria-label="Completion" className="flex flex-col gap-4">
      <div className="panel">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h2 className="panel-title">Completion</h2>
          <span className="font-mono text-2xl text-sky-200" data-testid="completion-total">
            {formatCompletion(c.ratio)}
          </span>
        </div>
        <ProgressBar value={c.ratio} label="Overall completion" />
        <p className="mt-2 text-xs text-slate-400">
          {c.done} of {c.total} done. 100% means every research, every generator type built and upgraded to max level,
          every room expansion, every producer type, contract milestones, every contract perk, every pet found and grown, both pet slots, all 6 copies of every decoration, and every achievement (except bonus ones). Records are permanent: scrapping never lowers them.
        </p>
      </div>
      {c.parts.map((p) => {
        const isOpen = open === p.label;
        const id = `completion-${p.label.replace(/\W+/g, '-').toLowerCase()}`;
        return (
          <div key={p.label} className="rounded-lg bg-slate-800 p-3" data-testid={id}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${id}-list`}
              onClick={() => setOpen(isOpen ? null : p.label)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span className="font-semibold">
                <span aria-hidden="true" className="mr-1 inline-block w-3 text-slate-400">
                  {isOpen ? '▾' : '▸'}
                </span>
                {p.label}
              </span>
              <span className={`font-mono text-sm ${p.done === p.total ? 'text-emerald-400' : 'text-slate-300'}`}>
                {p.done}/{p.total} · {Math.round((p.total / c.total) * 100)}% of total
              </span>
            </button>
            <div className="mt-2">
              <ProgressBar value={p.total ? p.done / p.total : 1} label={`${p.label} completion`} />
            </div>
            {isOpen && (
              <ul id={`${id}-list`} className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                {p.items.map((it) => (
                  <li key={it.id} className={`flex items-center gap-2 rounded bg-slate-900/60 px-2 py-1 ${it.done ? 'text-slate-200' : 'text-slate-400'}`}>
                    <span aria-hidden="true" className={it.done ? 'text-emerald-400' : 'text-slate-600'}>
                      {it.done ? '✔' : '○'}
                    </span>
                    <span>
                      {it.label}
                      <span className="sr-only">{it.done ? ' (done)' : ' (not yet)'}</span>
                    </span>
                    {it.detail && <span className="ml-auto font-mono text-xs text-slate-400">{it.detail}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      <div className="rounded-lg bg-slate-800 p-3" data-testid="completion-sightings">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-semibold">Sightings discovered</h3>
          <span className="font-mono text-sm text-slate-300">
            {found.length}/{sightings.length}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Rare things happen while you watch the game. Just for fun: they do not count toward 100%.
        </p>
        <ul className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {sightings.map((e) => (
            <li key={e.id} className="flex items-center gap-2 rounded bg-slate-900/60 px-2 py-1">
              {/* 1.91: the rarity shows found or not, in the title tier color of the same name */}
              <span className={`min-w-0 break-words ${seen[e.id] ? '' : 'text-slate-500'}`}>{seen[e.id] ? e.name : '???'}</span>
              <span className="text-xs font-semibold" style={{ color: rarityColor(e.rarity) }} data-testid={`sighting-rarity-${e.id}`}>
                {RARITY_LABEL[e.rarity]}
              </span>
              {seen[e.id] && <span className="ml-auto font-mono text-xs text-slate-400">×{seen[e.id].count}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
