import { sprites } from '../assets';
import { useStore } from '../store';
import { getExpandBlock, getNextRoomTier, isRoomNearlyFull } from '../utils/roomSystem';
import CostList from './CostList';

/** Capacity meter: one segment per unit of room, up to a readable maximum. */
function CapacityMeter({ used, capacity, critical }: { used: number; capacity: number; critical: boolean }) {
  const MAX_SEGMENTS = 40;
  const scale = capacity > MAX_SEGMENTS ? capacity / MAX_SEGMENTS : 1;
  const total = Math.ceil(capacity / scale);
  const filled = Math.min(total, Math.ceil(used / scale));
  return (
    <div
      className="flex flex-wrap gap-0.5"
      role="meter"
      aria-label="Room used"
      aria-valuemin={0}
      aria-valuemax={capacity}
      aria-valuenow={used}
    >
      {Array.from({ length: total }, (_, i) => (
        <img
          key={i}
          src={i < filled ? (critical ? sprites.capacity_critical : sprites.capacity_filled) : sprites.capacity_empty}
          alt=""
          width={16}
          height={16}
          className="pixelated"
        />
      ))}
    </div>
  );
}

export default function RoomPanel() {
  const state = useStore((s) => s);
  const expand = useStore((s) => s.expandRoom);
  const next = getNextRoomTier(state.expansionLevel);
  const block = getExpandBlock(state);
  const warn = isRoomNearlyFull(state);

  return (
    <section aria-label="Room" className="w-full rounded-lg bg-slate-800 p-3">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Room</h2>
        <span className="font-mono text-sm" data-testid="room-usage">
          {state.roomUsed}/{state.roomCapacity}
        </span>
      </div>
      <CapacityMeter used={state.roomUsed} capacity={state.roomCapacity} critical={warn} />
      {warn && (
        <p role="status" className="mt-2 text-sm text-amber-300">
          Room is {state.roomUsed >= state.roomCapacity ? 'full' : 'nearly full'}. Expand to build more.
        </p>
      )}
      <p className="mt-2 text-xs text-slate-400">
        Every generator takes room, even when switched off. Expansions add room permanently.
      </p>
      {next ? (
        <div className="mt-3 space-y-2 text-sm">
          <div>
            <span className="text-slate-400">Expansion {next.tier}: </span>
            <strong>+{next.capacity} room</strong>
          </div>
          <div>
            <span className="text-slate-400">Cost: </span>
            <span className="inline-flex flex-wrap gap-x-2">
              <span className={state.energy < next.energy ? 'text-red-400' : ''}>{next.energy.toLocaleString('en-US')} energy</span>
              <CostList cost={next.resources} have={state.resources} />
            </span>
          </div>
          <button
            type="button"
            disabled={block !== null}
            onClick={expand}
            className="min-h-11 w-full rounded bg-amber-600 px-3 py-2 font-semibold text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {block ? 'Not enough energy or resources' : `Expand room (+${next.capacity})`}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-emerald-400">All expansions built.</p>
      )}
    </section>
  );
}
