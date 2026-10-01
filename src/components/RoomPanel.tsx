import { useEffect, useState } from 'react';
import { sprites } from '../assets';
import { useStore } from '../store';
import { getExpandBlock, getExpansionAnimation, getNextRoomTier, isRoomNearlyFull } from '../utils/roomSystem';
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

/** Construction sprite that fades in and out after an expansion (frame-driven from the state timestamp). */
function ExpansionOverlay({ lastExpansionAt }: { lastExpansionAt: number | null }) {
  const [now, setNow] = useState(() => Date.now());
  const anim = getExpansionAnimation(lastExpansionAt, now);
  useEffect(() => {
    if (lastExpansionAt === null) return;
    let frame = 0;
    const loop = () => {
      const t = Date.now();
      setNow(t);
      if (getExpansionAnimation(lastExpansionAt, t).active) frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [lastExpansionAt]);
  if (!anim.active) return null;
  return (
    <img
      src={sprites.room_expansion}
      alt=""
      data-testid="expansion-animation"
      className="pixelated pointer-events-none absolute right-2 top-2 h-24 w-24 motion-reduce:opacity-60!"
      style={{ opacity: anim.opacity }}
    />
  );
}

export default function RoomPanel() {
  const state = useStore((s) => s);
  const expand = useStore((s) => s.expandRoom);
  const next = getNextRoomTier(state.expansionLevel);
  const block = getExpandBlock(state);
  const warn = isRoomNearlyFull(state);

  return (
    <section aria-label="Room" className="relative w-full rounded-lg bg-slate-800 p-3">
      <ExpansionOverlay lastExpansionAt={state.lastExpansionAt} />
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="group relative text-sm font-semibold uppercase tracking-wide text-slate-400">
          <span tabIndex={0} aria-describedby="room-help" className="cursor-help underline decoration-dotted underline-offset-2">
            Room
          </span>
          <span
            id="room-help"
            role="tooltip"
            className="pointer-events-none absolute left-0 top-full z-30 mt-1 hidden w-64 rounded bg-slate-950 p-2 text-xs font-normal normal-case tracking-normal text-slate-200 shadow-lg group-hover:block group-has-focus-visible:block"
          >
            Room is the space your base has. Each generator takes room shown on its card, even while switched off. You
            cannot build past capacity. Expansions add room permanently; the meter turns red at 90% full.
          </span>
        </h2>
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
