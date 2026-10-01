import { useEffect } from 'react';
import { sprites } from '../assets';
import { RESEARCH_BY_ID } from '../data/research';
import { CELEBRATION_MS } from '../data/time';
import { useStore } from '../store';
import { getResearchRewards } from './researchRewards';
import { RESEARCH_ICONS } from './researchSprites';

const SPARKS = 12;

/**
 * Global "Research complete!" burst, shown over any tab when research finishes
 * during live play. Auto-hides; click to dismiss; queued completions follow.
 */
export default function ResearchCelebration() {
  const current = useStore((s) => s.celebrations[0]);
  const dismiss = useStore((s) => s.dismissCelebration);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismiss, CELEBRATION_MS);
    return () => clearTimeout(t);
  }, [current, dismiss]);

  const def = current ? RESEARCH_BY_ID[current.id] : undefined;
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-24 z-40 flex justify-center px-4">
      {def && (
        <button
          key={`${current!.id}-${current!.at}`}
          type="button"
          onClick={dismiss}
          data-testid="research-celebration"
          className="celebrate pointer-events-auto relative flex max-w-sm items-center gap-3 rounded-xl border-2 border-emerald-400 bg-slate-900 px-5 py-3 text-left shadow-[0_0_30px_rgba(89,193,53,0.5)]"
        >
          {Array.from({ length: SPARKS }, (_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="spark absolute left-1/2 top-1/2 h-2 w-2 rounded-sm bg-yellow-300"
              style={{ ['--angle' as string]: `${(360 / SPARKS) * i}deg` }}
            />
          ))}
          <img src={sprites[RESEARCH_ICONS[def.category]]} alt="" width={40} height={40} className="pixelated" />
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wide text-emerald-300">Research complete!</span>
            <span className="block text-lg font-bold">{def.name}</span>
            {getResearchRewards(def)[0] && (
              <span className="block text-sm text-emerald-100">🎁 {getResearchRewards(def)[0].text}</span>
            )}
          </span>
        </button>
      )}
    </div>
  );
}
