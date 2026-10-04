import { useEffect, useState } from 'react';
import { ROOM_TIERS } from '../data/rooms';
import { useStore } from '../store';
import {
  expansionBarPhase,
  getExpandBlock,
  getNextRoomTier,
  isExpansionAnimating,
  isRoomNearlyFull,
  lastExpansionSize,
} from '../utils/roomSystem';
import { ZONES, type Zone } from '../data/map';
import { expansionTerrain, grantedTiles } from '../utils/siteMap';
import CostList from './CostList';
import { useNumberFormat } from './useNumberFormat';

/** Milliseconds since the last expansion while its animation runs, else null. Frame-driven. */
function useExpansionElapsed(lastExpansionAt: number | null): number | null {
  // The frame loop only triggers re-renders; the time is read fresh each render.
  const [, setFrame] = useState(0);
  useEffect(() => {
    if (lastExpansionAt === null || !isExpansionAnimating(lastExpansionAt, Date.now())) return;
    let frame = 0;
    const loop = () => {
      setFrame((f) => f + 1);
      if (isExpansionAnimating(lastExpansionAt, Date.now())) frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [lastExpansionAt]);
  const now = Date.now();
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !isExpansionAnimating(lastExpansionAt, now)) return null;
  return now - lastExpansionAt!;
}

/**
 * Room bar: one fixed-width bar with used room and free room, tick marks for
 * scale. After an expansion the new room's share slides in as an amber
 * striped "under construction" section, then settles into free room.
 */
function RoomBar({
  used,
  capacity,
  critical,
  added,
  elapsed,
}: {
  used: number;
  capacity: number;
  critical: boolean;
  added: number;
  elapsed: number | null;
}) {
  const pct = (n: number) => `${Math.max(0, Math.min(100, (n / Math.max(1, capacity)) * 100))}%`;
  const anim = expansionBarPhase(elapsed);
  const newStart = capacity - added;
  const tickEvery = capacity > 200 ? 50 : 10;
  const ticks = Array.from({ length: Math.floor((capacity - 1) / tickEvery) }, (_, i) => (i + 1) * tickEvery);
  return (
    <div
      role="meter"
      aria-label="Room used"
      aria-valuemin={0}
      aria-valuemax={capacity}
      aria-valuenow={used}
      className="relative h-5 w-full overflow-hidden rounded border border-slate-600 bg-slate-900"
    >
      <div
        data-testid="room-used-bar"
        className={`absolute inset-y-0 left-0 ${critical ? 'bg-red-600' : 'bg-emerald-600'} transition-[width] duration-300 motion-reduce:transition-none`}
        style={{ width: pct(used) }}
      />
      {anim.building && added > 0 && (
        <div
          data-testid="room-building"
          className="room-building absolute inset-y-0"
          style={{ left: pct(newStart), width: pct(added * anim.reveal) }}
        />
      )}
      {ticks.map((t) => (
        <div key={t} aria-hidden="true" className="absolute inset-y-0 w-px bg-slate-500/50" style={{ left: pct(t) }} />
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
  const elapsed = useExpansionElapsed(state.lastExpansionAt);
  const fmt = useNumberFormat();

  return (
    <section aria-label="Room" className="w-full rounded-lg bg-slate-800 p-3">
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
      <RoomBar
        used={state.roomUsed}
        capacity={state.roomCapacity}
        critical={warn}
        added={lastExpansionSize(state.expansionLevel)}
        elapsed={elapsed}
      />
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
            <span className="text-slate-400">
              Expansion {next.tier} of {ROOM_TIERS.length}:{' '}
            </span>
            <strong>+{next.capacity} room</strong>
          </div>
          <div className="text-xs text-slate-400" data-testid="expansion-land">
            New land:{' '}
            {Object.entries(expansionTerrain(state.roomCapacity + grantedTiles(state), next.capacity))
              .sort((a, b) => b[1] - a[1])
              .map(([t, n]) => `${n} ${t === 'plain' ? 'plain' : ZONES[t as Zone].name.toLowerCase()}`)
              .join(', ')}{' '}
            (see the Map tab)
          </div>
          <div>
            <span className="text-slate-400">Cost: </span>
            <span className="inline-flex flex-wrap gap-x-2">
              <span className={state.energy < next.energy ? 'text-red-400' : ''}>{fmt.num(next.energy)} energy</span>
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
