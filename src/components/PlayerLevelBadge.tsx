import { ACHIEVEMENTS_BY_ID } from '../data/achievements';
import { useStore } from '../store';
import { getPlayerLevel, playerLevelEnergyBonus } from '../utils/playerLevel';
import ProgressBar from './ProgressBar';
import { useNumberFormat } from './useNumberFormat';

/** Player level from lifetime energy (0.88). Distinct from the research level. Level-ups are celebrated globally (0.90). */
export default function PlayerLevelBadge() {
  const lifetime = useStore((s) => s.lifetimeEnergy);
  const fmt = useNumberFormat();
  const lv = getPlayerLevel(lifetime);
  const bonus = playerLevelEnergyBonus(lifetime);
  const titleId = useStore((s) => s.settings.cosmetics?.title ?? null);
  const title = titleId ? ACHIEVEMENTS_BY_ID[titleId]?.name : null;

  return (
    <div
      className="group relative ml-3 w-16 shrink-0 border-l border-slate-600 pl-3 text-sm sm:ml-4 sm:w-28 sm:pl-4"
      data-testid="player-level"
      tabIndex={0}
      aria-describedby="player-level-tip"
    >
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
      {title && (
        <div className="mt-1 truncate text-[10px] font-semibold text-violet-300" data-testid="player-title" title={title}>
          {title}
        </div>
      )}
      <div
        id="player-level-tip"
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-50 mt-2 hidden w-60 rounded border border-slate-600 bg-slate-950 p-2 text-xs text-slate-100 shadow-xl group-hover:block group-focus:block"
      >
        Your player level grows with all the energy you have ever produced. Spending never lowers it. Each level gives +0.1%
        energy from all generators.
        <div className="mt-1 font-mono">Bonus now: +{+(bonus * 100).toFixed(1)}% energy</div>
        <div className="font-mono">Lifetime energy: {fmt.num(lifetime)}</div>
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
