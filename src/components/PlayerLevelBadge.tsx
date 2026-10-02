import { useEffect, useRef, useState } from 'react';
import { LEVEL_UP_MS } from '../data/playerLevel';
import { useStore } from '../store';
import { getPlayerLevel } from '../utils/playerLevel';
import ProgressBar from './ProgressBar';
import { useNumberFormat } from './useNumberFormat';

/** Player level from lifetime energy (0.88), with a level-up badge. Distinct from the research level. */
export default function PlayerLevelBadge() {
  const lifetime = useStore((s) => s.lifetimeEnergy);
  const fmt = useNumberFormat();
  const lv = getPlayerLevel(lifetime);
  const seen = useRef(lv.level);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  useEffect(() => {
    if (lv.level > seen.current) {
      setLevelUp(lv.level);
      const t = setTimeout(() => setLevelUp(null), LEVEL_UP_MS);
      seen.current = lv.level;
      return () => clearTimeout(t);
    }
    seen.current = lv.level;
  }, [lv.level]);

  return (
    <div className="group relative ml-3 w-16 shrink-0 border-l border-slate-600 pl-3 text-sm sm:ml-4 sm:w-28 sm:pl-4" data-testid="player-level" tabIndex={0} aria-describedby="player-level-tip">
      <div className="text-slate-400">
        <span className="sm:hidden">Level</span>
        <span className="hidden sm:inline">Player level</span>
      </div>
      <div className="font-mono text-lg leading-tight text-sky-200" aria-label="Player level">
        {lv.level}
      </div>
      <div className="mt-1 h-2 [&>div]:h-2">
        <ProgressBar value={lv.progress} label="Progress to next player level" />
      </div>
      {levelUp !== null && (
        <span
          key={levelUp}
          aria-live="polite"
          data-testid="level-up"
          className="level-up pointer-events-none absolute -top-6 right-0 whitespace-nowrap rounded bg-sky-500 px-2 py-0.5 text-xs font-bold text-white shadow"
        >
          Level up! {levelUp}
        </span>
      )}
      <div
        id="player-level-tip"
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-50 mt-2 hidden w-60 rounded border border-slate-600 bg-slate-950 p-2 text-xs text-slate-100 shadow-xl group-hover:block group-focus:block"
      >
        Your player level grows with all the energy you have ever produced. Spending never lowers it.
        <div className="mt-1 font-mono">Lifetime energy: {fmt.num(lifetime)}</div>
        {lv.isMax ? (
          <div className="font-mono">Max level reached</div>
        ) : (
          <div className="font-mono">
            Next level at {fmt.num(lv.next)} ({fmt.num(lv.next - lifetime)} to go)
          </div>
        )}
      </div>
    </div>
  );
}
