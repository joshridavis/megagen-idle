import { useState } from 'react';
import { sprites } from '../assets';
import { GUIDE } from '../data/guide';
import { MAX_OFFLINE_SECONDS } from '../data/time';
import { useStore } from '../store';
import { formatHours } from '../utils/format';

const fill = (text: string) => text.replace('{offline}', formatHours(MAX_OFFLINE_SECONDS));

/** How the game works, one short section per topic (0.40, playtest 11). */
export default function GuidePanel() {
  const [open, setOpen] = useState<string | null>(GUIDE[0].id);
  const replay = useStore((s) => s.replayTutorial);
  return (
    <section aria-label="Guide" className="flex max-w-3xl flex-col gap-2">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">How to play</h2>
        <button type="button" onClick={replay} className="min-h-11 text-sm text-sky-300 hover:text-sky-200">
          ▶ Replay the tutorial
        </button>
      </div>
      {GUIDE.map((g) => {
        const isOpen = open === g.id;
        return (
          <div key={g.id} className="rounded-lg bg-slate-800" data-testid={`guide-${g.id}`}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`guide-${g.id}-body`}
              onClick={() => setOpen(isOpen ? null : g.id)}
              className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left font-semibold"
            >
              <img src={sprites[g.icon]} alt="" className="pixelated h-8 w-8 object-contain" />
              <span className="flex-1">{g.title}</span>
              <span aria-hidden="true" className="text-slate-400">
                {isOpen ? '▾' : '▸'}
              </span>
            </button>
            {isOpen && (
              <div id={`guide-${g.id}-body`} className="space-y-2 px-3 pb-3 text-sm text-slate-300">
                {g.paragraphs.map((p, i) => (
                  <p key={i}>{fill(p)}</p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
