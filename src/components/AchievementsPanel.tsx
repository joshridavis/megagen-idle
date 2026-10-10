import { sprites } from '../assets';
import { ACCENTS, ACHIEVEMENTS, DEFAULT_ACCENT, TITLE_TIERS, titleTier, type AchievementDef } from '../data/achievements';
import { useStore } from '../store';
import { SUPPORTER_ACCENT, SUPPORTER_TITLE } from '../data/purchases';
import { accentInfo, achievementProgress, canUseAccent, canUseTitle, metricValue, titleInfo } from '../utils/achievements';
import { isSupporter } from '../utils/purchases';
import ProgressBar from './ProgressBar';
import { useNumberFormat } from './useNumberFormat';

const CATEGORIES = [...new Set(ACHIEVEMENTS.map((a) => a.category))] as AchievementDef['category'][];
/** Title tiers from highest to lowest, each with its titles (1.66). */
const TIER_GROUPS = [...TITLE_TIERS].reverse().map((tier) => ({ tier, titles: ACHIEVEMENTS.filter((a) => a.tier === tier.id) }));

/** Achievements tab (0.65): every achievement with its progress, grouped by category. */
export default function AchievementsPanel() {
  const state = useStore((s) => s);
  const fmt = useNumberFormat();
  const unlocked = ACHIEVEMENTS.filter((a) => state.achievements[a.id] !== undefined).length;
  const setCosmetics = useStore((s) => s.setCosmetics);
  const cosmetics = state.settings.cosmetics ?? { title: null, accent: DEFAULT_ACCENT };
  const titles = ACHIEVEMENTS.filter((a) => a.title && canUseTitle(state, a.id));
  const chosenTier = titleInfo(cosmetics.title);
  const supporter = isSupporter(state);
  const cosOpen = state.settings.cosmeticsOpen ?? true;
  const setOpen = useStore((s) => s.setCosmeticsOpen);
  const titleName = chosenTier?.name;
  const accentName = accentInfo(cosmetics.accent).name;
  return (
    <section aria-label="Achievements" className="flex flex-col gap-4">
      <div className="rounded-lg bg-slate-800 p-3" data-testid="cosmetics">
        <h2 className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${cosOpen ? 'mb-2' : ''}`}>
          <button
            type="button"
            onClick={() => setOpen(!cosOpen)}
            aria-expanded={cosOpen}
            aria-controls="cosmetics-body"
            className="panel-title rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            data-testid="cosmetics-toggle"
          >
            <span aria-hidden="true">{cosOpen ? '▾' : '▸'}</span> Cosmetics
          </button>
          {!cosOpen && (
            <span className="text-xs font-normal text-slate-300" data-testid="cosmetics-summary">
              Title:{' '}
              <span className="font-semibold" style={{ color: chosenTier?.color }}>
                {titleName ?? 'none'}
              </span>{' '}
              · Accent: {accentName}
            </span>
          )}
        </h2>
        {cosOpen && (
        <div id="cosmetics-body">
        <div className="flex flex-wrap items-start gap-6">
          <label className="flex w-full min-w-0 max-w-xs flex-col gap-1 text-sm">
            <span className="text-xs text-slate-400">Title shown in the top bar</span>
            <select
              value={cosmetics.title ?? ''}
              onChange={(e) => setCosmetics({ title: e.target.value || null })}
              className="min-h-9 w-full min-w-0 rounded border border-slate-600 bg-slate-900 px-2 font-semibold"
              style={{ color: chosenTier?.color }}
              data-testid="title-select"
            >
              <option value="" className="text-slate-100">
                No title
              </option>
              {supporter && (
                // the Supporter Pack's own title (1.95)
                <option value={SUPPORTER_TITLE.id} style={{ color: SUPPORTER_TITLE.color }} data-testid="title-option-supporter">
                  {SUPPORTER_TITLE.name}
                </option>
              )}
              {TIER_GROUPS.map(({ tier, titles: group }) => (
                <optgroup key={tier.id} label={tier.name} data-testid={`title-group-${tier.id}`}>
                  {group.map((a) => {
                    const open = canUseTitle(state, a.id);
                    return (
                      <option key={a.id} value={a.id} disabled={!open} style={{ color: open ? tier.color : undefined }}>
                        {open ? a.name : `🔒 ${a.name}: ${a.description}`}
                      </option>
                    );
                  })}
                </optgroup>
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
                const tier = TITLE_TIERS.find((t) => t.id === x.tier)!;
                return (
                  <button
                    key={x.id}
                    type="button"
                    disabled={!open}
                    aria-pressed={cosmetics.accent === x.id}
                    onClick={() => setCosmetics({ accent: x.id })}
                    title={open ? `${x.name} (${tier.name})` : `${x.name} (${tier.name}): unlock ${x.need} achievements`}
                    className={`min-h-9 rounded border px-2 text-xs font-semibold ${cosmetics.accent === x.id ? 'border-white' : 'border-slate-600'} disabled:opacity-40`}
                    style={{ color: x.color }}
                    data-testid={`accent-${x.id}`}
                  >
                    {open ? `${x.name} · ${tier.name}` : `🔒 ${x.need} · ${tier.name}`}
                  </button>
                );
              })}
              {supporter && (
                <button
                  type="button"
                  aria-pressed={cosmetics.accent === SUPPORTER_ACCENT.id}
                  onClick={() => setCosmetics({ accent: SUPPORTER_ACCENT.id })}
                  title={`${SUPPORTER_ACCENT.name} (Supporter Pack)`}
                  className={`min-h-9 rounded border px-2 text-xs font-semibold ${cosmetics.accent === SUPPORTER_ACCENT.id ? 'border-white' : 'border-slate-600'}`}
                  style={{ color: SUPPORTER_ACCENT.color }}
                  data-testid="accent-supporter"
                >
                  {SUPPORTER_ACCENT.name} · Supporter Pack
                </button>
              )}
            </div>
          </fieldset>
        </div>
        <div className="mt-3 flex flex-col gap-2" data-testid="title-tiers">
          {TIER_GROUPS.map(({ tier, titles: group }) => (
            <div key={tier.id} data-testid={`title-tier-${tier.id}`}>
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: tier.color }}>
                {tier.name}
              </h3>
              <ul className="mt-1 flex flex-wrap gap-1">
                {group.map((a) => {
                  const open = canUseTitle(state, a.id);
                  return (
                    <li
                      key={a.id}
                      className={`rounded border px-2 py-0.5 text-xs ${open ? 'border-slate-500 font-semibold' : 'border-slate-700 text-slate-500'}`}
                      style={{ color: open ? tier.color : undefined }}
                      title={open ? `${a.name}: unlocked` : `Locked: ${a.description}`}
                      data-testid={`title-${a.id}`}
                      data-unlocked={open}
                    >
                      {open ? a.name : `🔒 ${a.name}`}
                      {!open && <span className="text-[10px] font-normal"> · {a.description}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        </div>
        )}
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
                    {a.title && (
                      <div className="text-xs text-slate-300" data-testid={`achievement-tier-${a.id}`}>
                        🎖 Unlocks the{' '}
                        <span className="font-semibold" style={{ color: titleTier(a.id)?.color }}>
                          {titleTier(a.id)?.name}
                        </span>{' '}
                        title “{a.name}”
                      </div>
                    )}
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
