import { useState } from 'react';
import { SCRAP_REFUND_SHARE } from '../data/generators';
import { RESOURCE_NAMES } from '../data/resources';
import type { ResourceAmounts } from '../types/resource';
import type { ResourceId } from '../types/state';
import { useTipSide } from './useTipSide';

/** Shared scrap controls: a Scrap button with a refund tooltip, and confirm rows (refund since 1.24, playtest 18). */

export interface Refund {
  energy: number;
  resources: ResourceAmounts;
}

const pct = `${Math.round(SCRAP_REFUND_SHARE * 100)}%`;

/** "1,200 energy, 30 metal" (or "nothing" when all rounds to 0). */
export function refundText(r: Refund): string {
  const parts = [r.energy > 0 ? `${r.energy.toLocaleString('en-US')} energy` : null];
  for (const [id, n] of Object.entries(r.resources)) if ((n ?? 0) > 0) parts.push(`${(n ?? 0).toLocaleString('en-US')} ${RESOURCE_NAMES[id as ResourceId].toLowerCase()}`);
  const shown = parts.filter(Boolean);
  return shown.length ? shown.join(', ') : 'nothing';
}

export function scrapHelpText(what: string) {
  return `Scrapping removes the ${what} for good and frees its room. You get back ${pct} of everything spent on it${what === 'generator' ? ', build and upgrades' : ''}.`;
}

export function ScrapButton({ id, name, what, onClick }: { id: string; name: string; what: string; onClick: () => void }) {
  const { tip, below, place } = useTipSide<HTMLSpanElement>();
  return (
    <span className="group relative" onMouseEnter={place} onFocus={place}>
      <button
        type="button"
        onClick={onClick}
        aria-label={`Scrap ${name}`}
        aria-describedby={`scrap-tip-${id}`}
        className="min-h-11 rounded px-2 py-2 text-sm text-slate-400 hover:bg-slate-700 hover:text-red-300"
      >
        Scrap
      </button>
      <span
        ref={tip}
        id={`scrap-tip-${id}`}
        role="tooltip"
        data-side={below ? 'below' : 'above'}
        className={`pointer-events-none absolute right-0 z-30 ${below ? 'top-full mt-1' : 'bottom-full mb-1'} hidden w-52 rounded bg-slate-950 p-2 text-xs text-slate-200 shadow-lg group-hover:block group-has-focus-visible:block`}
      >
        {scrapHelpText(what)}
      </span>
    </span>
  );
}

export function ScrapConfirm({
  name,
  what,
  refund,
  onConfirm,
  onCancel,
}: {
  name: string;
  what: string;
  refund: Refund;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div role="alert" className="mt-2 flex flex-wrap items-center gap-2 rounded bg-red-950/60 p-2 text-sm text-red-100">
      <span className="flex-1" data-testid="scrap-refund">
        Removes the {what} for good and frees its room. You get back {refundText(refund)} ({pct} of what it cost{what === 'generator' ? ' with its upgrades' : ''}).
      </span>
      <button
        type="button"
        onClick={onConfirm}
        aria-label={`Confirm scrap ${name}`}
        className="min-h-11 rounded bg-red-700 px-3 py-2 font-semibold hover:bg-red-600"
      >
        Confirm
      </button>
      <button
        type="button"
        autoFocus
        onClick={onCancel}
        aria-label={`Cancel scrap ${name}`}
        className="min-h-11 rounded bg-slate-600 px-3 py-2 font-semibold hover:bg-slate-500"
      >
        Cancel
      </button>
    </div>
  );
}

/** Confirm row that asks how many to scrap (1..max), with -/+ and All. */
export function ScrapQuantityConfirm({
  name,
  plural,
  max,
  roomEach,
  refundFor,
  onConfirm,
  onCancel,
}: {
  name: string;
  plural: string;
  max: number;
  roomEach: number;
  /** The refund for scrapping this many. */
  refundFor: (count: number) => Refund;
  onConfirm: (count: number) => void;
  onCancel: () => void;
}) {
  const [count, setCount] = useState(1);
  const clamp = (n: number) => Math.max(1, Math.min(max, Math.floor(Number.isFinite(n) ? n : 1)));
  return (
    <div role="alert" className="mt-2 flex flex-col gap-2 rounded bg-red-950/60 p-2 text-sm text-red-100">
      <div className="flex flex-wrap items-center gap-2">
        <span>How many?</span>
        <button
          type="button"
          onClick={() => setCount((c) => clamp(c - 1))}
          aria-label="One fewer"
          className="h-9 w-9 rounded bg-slate-700 font-bold hover:bg-slate-600"
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={max}
          value={count}
          onChange={(e) => setCount(clamp(e.target.valueAsNumber))}
          aria-label={`Number of ${plural} to scrap`}
          className="h-9 w-16 rounded border border-slate-600 bg-slate-900 text-center"
        />
        <button
          type="button"
          onClick={() => setCount((c) => clamp(c + 1))}
          aria-label="One more"
          className="h-9 w-9 rounded bg-slate-700 font-bold hover:bg-slate-600"
        >
          +
        </button>
        <button type="button" onClick={() => setCount(max)} className="h-9 rounded bg-slate-700 px-3 hover:bg-slate-600">
          All ({max})
        </button>
      </div>
      <span data-testid="scrap-summary">
        Removes {count} {count === 1 ? name : plural} for good and frees {count * roomEach} room. You get back {refundText(refundFor(count))} ({pct} of what{' '}
        {count === 1 ? 'it' : 'they'} cost).
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onConfirm(count)}
          aria-label={`Confirm scrap ${plural}`}
          className="min-h-11 rounded bg-red-700 px-3 py-2 font-semibold hover:bg-red-600"
        >
          Scrap {count}
        </button>
        <button
          type="button"
          autoFocus
          onClick={onCancel}
          aria-label={`Cancel scrap ${plural}`}
          className="min-h-11 rounded bg-slate-600 px-3 py-2 font-semibold hover:bg-slate-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
