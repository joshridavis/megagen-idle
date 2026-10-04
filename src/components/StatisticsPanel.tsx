import { useMemo, useState } from 'react';
import { sprites } from '../assets';
import { GENERATORS } from '../data/generators';
import { RESOURCE_NAMES } from '../data/resources';
import { useStore } from '../store';
import { formatDuration } from '../utils/format';
import { getStatistics } from '../utils/statistics';
import { RESOURCE_ICONS } from './CostList';
import { GENERATOR_SPRITES } from './generatorSprites';
import { useNumberFormat } from './useNumberFormat';

const pct = (share: number) => `${(share * 100).toFixed(share > 0 && share < 0.001 ? 2 : 1)}%`;
const when = (at: number) => new Date(at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
/** Generators listed one by one before "Show all". */
const TOP_GENERATORS = 10;

/** Statistics (0.39): where your energy and resources come from, and your lifetime totals. */
export default function StatisticsPanel() {
  const state = useStore((s) => s);
  const st = useMemo(() => getStatistics(state), [state]);
  const fmt = useNumberFormat();
  const [allGenerators, setAllGenerators] = useState(false);
  const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${fmt.ratePer(Math.abs(n))}`;
  const shown = allGenerators ? st.byGenerator : st.byGenerator.slice(0, TOP_GENERATORS);

  return (
    <section aria-label="Statistics" className="grid gap-4 lg:grid-cols-2">
      <div className="panel lg:col-span-2">
        <h2 className="panel-title mb-2">Totals</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3" data-testid="stats-totals">
          {[
            ['Lifetime energy', fmt.num(st.lifetimeEnergy)],
            ['Energy rate now', `+${fmt.rate(st.energyPerSecond)}/s`],
            ['Play time', formatDuration(st.playSeconds)],
            ['Clicks', fmt.num(st.clicks)],
            ['Energy from clicks', fmt.num(st.clickEnergy)],
            ['Times back after a break', fmt.num(st.returns)],
            ['Playing since', st.startedAt ? when(st.startedAt) : 'before statistics began'],
            [
              'Last offline gain',
              st.lastOffline
                ? `${when(st.lastOffline.at)}: +${fmt.num(st.lastOffline.energy)} energy after ${formatDuration(st.lastOffline.seconds)} away`
                : 'none yet',
            ],
          ].map(([label, value]) => (
            <div key={label} className={label === 'Last offline gain' ? 'col-span-2 sm:col-span-3' : undefined}>
              <dt className="text-xs text-slate-400">{label}</dt>
              <dd className="font-mono text-slate-100">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="panel">
        <h2 className="panel-title mb-2">Energy by generator type</h2>
        {st.byType.length === 0 ? (
          <p className="text-sm text-slate-400">No generators yet.</p>
        ) : (
          <ul className="space-y-2" data-testid="stats-by-type">
            {st.byType.map((t) => (
              <li key={t.type} className="text-sm">
                <div className="flex items-center gap-2">
                  <img src={sprites[GENERATOR_SPRITES[t.type].active]} alt="" width={24} height={24} className="pixelated h-6 w-6 object-contain" />
                  <span className="min-w-0 flex-1">
                    {t.name} <span className="text-xs text-slate-400">× {t.count}{t.running < t.count ? ` (${t.running} running)` : ''}</span>
                  </span>
                  <span className="font-mono text-yellow-300">+{fmt.rate(t.perSecond)}/s</span>
                  <span className="w-14 text-right font-mono text-slate-300">{pct(t.share)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded bg-slate-900" aria-hidden="true">
                  <div className="h-full bg-aap-yellow" style={{ width: `${t.share * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title mb-2">Resources per second</h2>
        <table className="w-full text-sm" data-testid="stats-resources">
          <thead>
            <tr className="text-left text-xs text-slate-400">
              <th className="py-1 font-normal">Resource</th>
              <th className="py-1 text-right font-normal">Made</th>
              <th className="py-1 text-right font-normal">Burned</th>
              <th className="py-1 text-right font-normal">Net</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {st.resources.map((r) => (
              <tr key={r.id} className="border-t border-slate-700/60">
                <td className="py-1 font-sans">
                  <span className="flex items-center gap-1.5">
                    <img src={sprites[RESOURCE_ICONS[r.id]]} alt="" width={16} height={16} className="pixelated" />
                    {RESOURCE_NAMES[r.id]}
                  </span>
                </td>
                <td className="py-1 text-right">{r.produced > 0 ? signed(r.produced) : '–'}</td>
                <td className="py-1 text-right text-orange-300">{r.burned > 0 ? signed(-r.burned) : '–'}</td>
                <td className={`py-1 text-right ${r.net < 0 ? 'text-red-300' : r.net > 0 ? 'text-emerald-300' : 'text-slate-400'}`}>
                  {r.net !== 0 ? signed(r.net) : '0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel lg:col-span-2">
        <h2 className="panel-title mb-2">Top generators</h2>
        {st.byGenerator.length === 0 ? (
          <p className="text-sm text-slate-400">No generators yet.</p>
        ) : (
          <>
            <ol className="grid gap-1 text-sm sm:grid-cols-2" data-testid="stats-by-generator">
              {shown.map((g) => (
                <li key={g.id} className="flex items-center gap-2 rounded bg-slate-900/50 px-2 py-1">
                  <span className="min-w-0 flex-1 truncate">
                    {GENERATORS[g.type].name} #{g.id.split('-')[1]}
                  </span>
                  <span className="font-mono text-yellow-300">{g.perSecond > 0 ? `+${fmt.rate(g.perSecond)}/s` : 'off'}</span>
                  <span className="w-14 text-right font-mono text-slate-300">{pct(g.share)}</span>
                </li>
              ))}
            </ol>
            {st.byGenerator.length > TOP_GENERATORS && (
              <button
                type="button"
                onClick={() => setAllGenerators((v) => !v)}
                className="mt-2 min-h-11 rounded bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600"
              >
                {allGenerators ? `Show the top ${TOP_GENERATORS}` : `Show all ${st.byGenerator.length}`}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
