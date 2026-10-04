import { sprites } from '../assets';
import { ACCENTS, ACHIEVEMENTS, type AchievementDef } from '../data/achievements';
import { useStore } from '../store';
import { achievementProgress, canUseAccent, canUseTitle, metricValue } from '../utils/achievements';
import ProgressBar from './ProgressBar';
import { useNumberFormat } from './useNumberFormat';

const CATEGORIES = [...new Set(ACHIEVEMENTS.map((a) => a.category))] as AchievementDef['category'][];

/** Achievements tab (0.65): every achievement with its progress, grouped by category. */
export default function AchievementsPanel() {
  const state = useStore((s) => s);
  const fmt = useNumberFormat();
  const unlocked = ACHIEVEMENTS.filter((a) => state.achievements[a.id] !== undefined).length;
  const setCosmetics = useStore((s) => s.setCosmetics);
  const cosmetics = state.settings.cosmetics ?? { title: null, accent: 'amber' };
  const titles = ACHIEVEMENTS.filter((a) => a.title && canUseTitle(state, a.id));
  return (
    <section aria-label="Achievements" className="flex flex-col gap-4">
      <div className="rounded-lg bg-slate-800 p-3" data-testid="cosmetics">
        <h2 className="mb-2 panel-title">Cosmetics</h2>
        <div className="flex flex-wrap items-start gap-6">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs text-slate-400">Title shown in the top bar</span>
            <select
              value={cosmetics.title ?? ''}
              onChange={(e) => setCosmetics({ title: e.target.value || null })}
              className="min-h-9 rounded border border-slate-600 bg-slate-900 px-2"
              data-testid="title-select"
            >
              <option value="">No title</option>
              {titles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-500">
              {titles.length} of {ACHIEVEMENTS.filter((a) => a.title).length} titles unlocked
            </span>
          </label>
          <fieldset className="flex flex-col gap-1">
            <legend className="text-xs text-slate-400">Accent color</legend>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((x) => {
                const open = canUseAccent(state, x.id);
                return (
                  <button
                    key={x.id}
                    type="button"
                    disabled={!open}
                    aria-pressed={cosmetics.accent === x.id}
                    onClick={() => setCosmetics({ accent: x.id })}
                    title={open ? x.name : `${x.name}: unlock ${x.need} achievements`}
                    className={`min-h-9 rounded border px-2 text-xs font-semibold ${x.text} ${cosmetics.accent === x.id ? 'border-white' : 'border-slate-600'} disabled:opacity-40`}
                    data-testid={`accent-${x.id}`}
                  >
                    {open ? x.name : `🔒 ${x.need}`}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="panel-title">
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
                    {a.title && <div className="text-xs text-violet-300">🎖 Unlocks the title “{a.name}”</div>}
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
