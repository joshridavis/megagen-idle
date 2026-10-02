import { sprites, type SpriteId } from '../assets';
import { RESOURCE_NAMES } from '../data/resources';
import type { ResourceAmounts } from '../types/resource';
import type { ResourceId, Resources } from '../types/state';
import { useNumberFormat } from './useNumberFormat';

export const RESOURCE_ICONS: Record<ResourceId, SpriteId> = {
  coal: 'resource_coal',
  stone: 'resource_stone',
  metal: 'resource_metal',
  naturalGas: 'resource_natural_gas',
  oil: 'resource_oil',
  uranium: 'resource_uranium',
};

/** Resource amounts with icons; amounts the player cannot afford are red. */
/** Text color for fuel use: amber, kept distinct from the red "cannot afford". */
export const FUEL_CLASS = 'text-amber-300';

export default function CostList({
  cost,
  have,
  suffix = '',
  className = '',
}: {
  cost: ResourceAmounts;
  have?: Resources;
  suffix?: string;
  className?: string;
}) {
  const fmt = useNumberFormat();
  const items = Object.entries(cost).filter(([, n]) => (n ?? 0) > 0) as [ResourceId, number][];
  if (items.length === 0) return <span className="text-slate-400">free</span>;
  return (
    <span className="inline-flex flex-wrap gap-x-2 gap-y-1">
      {items.map(([id, n]) => {
        const short = have !== undefined && have[id] < n;
        return (
          <span key={id} className={`inline-flex items-center gap-1 ${short ? 'text-red-400' : className}`}>
            <img src={sprites[RESOURCE_ICONS[id]]} alt="" width={16} height={16} className="pixelated" />
            <span>
              {fmt.num(n)} {RESOURCE_NAMES[id].toLowerCase()}
              {suffix}
            </span>
          </span>
        );
      })}
    </span>
  );
}
