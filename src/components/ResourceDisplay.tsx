import { useMemo } from 'react';
import { sprites } from '../assets';
import { PRODUCER_IDS, PRODUCERS } from '../data/producers';
import { RESOURCE_IDS, RESOURCE_NAMES } from '../data/resources';
import { useStore } from '../store';
import { selectResources } from '../store/selectors';
import type { ResourceId } from '../types/state';
import { getResourceBreakdown, type RateBreakdown } from '../utils/breakdown';
import BreakdownTooltip from './BreakdownTooltip';
import { FUEL_CLASS, RESOURCE_ICONS } from './CostList';
import { useNumberFormat } from './useNumberFormat';


export default function ResourceDisplay() {
  const resources = useStore(selectResources);
  const fmt = useNumberFormat();
  const formatRate = (perSecond: number) =>
    `${perSecond > 0 ? '+' : perSecond < 0 ? '−' : ''}${fmt.rate(Math.abs(perSecond))}/s`;
  const producers = useStore((s) => s.producers);
  const generators = useStore((s) => s.activeGenerators);
  const completed = useStore((s) => s.completedResearch);
  const effects = useStore((s) => s.activeEffects);
  const pets = useStore((s) => s.pets);
  const roomCapacity = useStore((s) => s.roomCapacity);
  const mapPins = useStore((s) => s.mapPins);
  const breakdowns = useMemo(
    () =>
      Object.fromEntries(
        RESOURCE_IDS.map((id) => [
          id,
          getResourceBreakdown({ producers, activeGenerators: generators, completedResearch: completed, activeEffects: effects, pets, roomCapacity, mapPins }, id),
        ]),
      ) as Record<ResourceId, RateBreakdown>,
    [producers, generators, completed, effects, pets, roomCapacity, mapPins],
  );
  const producerCount = (id: ResourceId) =>
    PRODUCER_IDS.filter((p) => PRODUCERS[p].resource === id).reduce((n, p) => n + (producers[p] ?? 0), 0);

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
                <span aria-label={`${RESOURCE_NAMES[id]} amount`}>{fmt.num(resources[id])}</span>{' '}
                <BreakdownTooltip
                  id={`resource-breakdown-${id}`}
                  title={`${RESOURCE_NAMES[id]} per second`}
                  baseLabel={`Producers (${producerCount(id)})`}
                  unit="/s"
                  breakdown={breakdowns[id]}
                  emptyHint="No boosts yet. Materials research can add them."
                  align="left"
                >
                  <span className={`text-xs ${breakdowns[id].total < 0 ? FUEL_CLASS : 'text-slate-400'}`}>
                    {formatRate(breakdowns[id].total)}
                  </span>
                </BreakdownTooltip>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
