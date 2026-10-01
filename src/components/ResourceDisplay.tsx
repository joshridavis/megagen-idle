import { useMemo } from 'react';
import { sprites } from '../assets';
import { RESOURCE_IDS, RESOURCE_NAMES } from '../data/resources';
import { useStore } from '../store';
import { selectFuelUseRates, selectProductionRates, selectResources } from '../store/selectors';
import type { ResourceId } from '../types/state';
import { FUEL_CLASS, RESOURCE_ICONS } from './CostList';


const formatRate = (perSecond: number) => {
  const sign = perSecond > 0 ? '+' : perSecond < 0 ? '−' : '';
  return `${sign}${Math.abs(perSecond).toFixed(2)}/s`;
};

export default function ResourceDisplay() {
  const resources = useStore(selectResources);
  const producers = useStore((s) => s.producers);
  const generators = useStore((s) => s.activeGenerators);
  const rates = useMemo(() => {
    const prod = selectProductionRates({ producers });
    const fuel = selectFuelUseRates({ activeGenerators: generators });
    return Object.fromEntries(RESOURCE_IDS.map((id) => [id, prod[id] - fuel[id]])) as Record<ResourceId, number>;
  }, [producers, generators]);

  return (
    <section aria-label="Resources" className="w-full rounded-lg bg-slate-800 p-3">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Resources</h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RESOURCE_IDS.map((id) => (
          <li key={id} className="flex items-center gap-2 rounded bg-slate-900/60 px-2 py-1" data-testid={`resource-${id}`}>
            <img src={sprites[RESOURCE_ICONS[id]]} alt="" width={24} height={24} className="pixelated" />
            <div className="leading-tight">
              <div className="text-xs text-slate-400">{RESOURCE_NAMES[id]}</div>
              <div className="font-mono">
                <span aria-label={`${RESOURCE_NAMES[id]} amount`}>{Math.floor(resources[id]).toLocaleString('en-US')}</span>{' '}
                <span className={`text-xs ${rates[id] < 0 ? FUEL_CLASS : 'text-slate-400'}`}>{formatRate(rates[id])}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
