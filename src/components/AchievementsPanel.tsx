import { sprites } from '../assets';
import { ACHIEVEMENTS, type AchievementDef } from '../data/achievements';
import { useStore } from '../store';
import { achievementProgress, metricValue } from '../utils/achievements';
import ProgressBar from './ProgressBar';
import { useNumberFormat } from './useNumberFormat';

const CATEGORIES = [...new Set(ACHIEVEMENTS.map((a) => a.category))] as AchievementDef['category'][];

/** Achievements tab (0.65): every achievement with its progress, grouped by category. */
export default function AchievementsPanel() {
  const state = useStore((s) => s);
  const fmt = useNumberFormat();
  const unlocked = ACHIEVEMENTS.filter((a) => state.achievements[a.id] !== undefined).length;
  return (
    <section aria-label="Achievements" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Achievements ({unlocked}/{ACHIEVEMENTS.length})
        </h2>
        <span className="text-xs text-slate-400">Bonus achievements depend on luck or play style and do not count toward 100%.</span>
      </div>
      {CATEGORIES.map((cat) => (
        <div key={cat}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-200">{cat}</h3>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS.filter((a) => a.category === cat).map((a) => {
              const at = state.achievements[a.id];
              const done = at !== undefined;
              const value = Math.min(metricValue(state, a.metric), a.target);
              return (
                <li
                  key={a.id}
                  className={`flex gap-3 rounded-lg border p-2 ${done ? 'border-yellow-500/60 bg-slate-800' : 'border-slate-700 bg-slate-800/60'}`}
                  data-testid={`achievement-${a.id}`}
                  data-unlocked={done}
                >
                  <img src={sprites[done ? 'achievement_unlocked' : 'achievement_locked']} alt="" width={32} height={32} className="pixelated h-8 w-8 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${done ? 'text-yellow-200' : 'text-slate-300'}`}>{a.name}</span>
                      {a.bonus && <span className="rounded bg-slate-700 px-1 text-[10px] uppercase text-slate-300">Bonus</span>}
                    </div>
                    <div className="text-xs text-slate-400">{a.description}</div>
                    {done ? (
                      <div className="text-xs text-emerald-400">Unlocked {new Date(at).toLocaleDateString()}</div>
                    ) : (
                      <div className="mt-1">
                        <ProgressBar value={achievementProgress(state, a)} label={`${a.name} progress`} />
                        <div className="text-right font-mono text-[10px] text-slate-400">
                          {fmt.num(value)} / {fmt.num(a.target)}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
