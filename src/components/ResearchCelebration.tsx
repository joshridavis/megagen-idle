import { useEffect } from 'react';
import { sprites } from '../assets';
import { ENERGY_BONUS_PER_LEVEL, PLAYER_LEVEL_BONUS_CAP } from '../data/playerLevel';
import { RESEARCH_BY_ID } from '../data/research';
import { CELEBRATION_MS } from '../data/time';
import { useStore } from '../store';
import { getResearchRewards } from './researchRewards';
import { RESEARCH_ICONS } from './researchSprites';

const SPARKS = 12;

/** Total player level energy bonus at a level, e.g. "1.4%". */
function levelBonusText(level: number): string {
  return `${+(Math.min(PLAYER_LEVEL_BONUS_CAP, (level - 1) * ENERGY_BONUS_PER_LEVEL) * 100).toFixed(1)}%`;
}

/**
 * Global "Research complete!" and "Level up!" (0.90) burst, shown over any tab when research finishes
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

  const def = current && current.kind !== 'level' ? RESEARCH_BY_ID[current.id] : undefined;
  const level = current?.kind === 'level' ? current.level : null;
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-24 z-40 flex justify-center px-4">
      {level !== null && (
        <button
          key={`level-${level}-${current!.at}`}
          type="button"
          onClick={dismiss}
          data-testid="level-celebration"
          className="celebrate pointer-events-auto relative flex max-w-sm items-center gap-3 rounded-xl border-2 border-sky-400 bg-slate-900 px-5 py-3 text-left shadow-[0_0_30px_rgba(36,159,222,0.5)]"
        >
          {Array.from({ length: SPARKS }, (_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="spark absolute left-1/2 top-1/2 h-2 w-2 rounded-sm bg-sky-300"
              style={{ ['--angle' as string]: `${(360 / SPARKS) * i}deg` }}
            />
          ))}
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 font-mono text-lg font-bold text-white">
            {level}
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wide text-sky-300">Level up!</span>
            <span className="block text-lg font-bold">Player level {level}</span>
            <span className="block text-sm text-sky-100">🎁 +{levelBonusText(level)} energy from all generators</span>
          </span>
        </button>
      )}
      {def && (
        <button
          key={`${def.id}-${current!.at}`}
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
