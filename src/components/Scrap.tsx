import { useState } from 'react';

/** Shared scrap controls: a Scrap button with a no-refund tooltip, and confirm rows. */

export function noRefundText(what: string) {
  return `No refund: scrapping removes the ${what} for good and frees its room.`;
}

export function ScrapButton({ id, name, what, onClick }: { id: string; name: string; what: string; onClick: () => void }) {
  return (
    <span className="group relative">
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
        id={`scrap-tip-${id}`}
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 z-30 mb-1 hidden w-52 rounded bg-slate-950 p-2 text-xs text-slate-200 shadow-lg group-hover:block group-has-focus-visible:block"
      >
        {noRefundText(what)}
      </span>
    </span>
  );
}

export function ScrapConfirm({
  name,
  what,
  onConfirm,
  onCancel,
}: {
  name: string;
  what: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div role="alert" className="mt-2 flex flex-wrap items-center gap-2 rounded bg-red-950/60 p-2 text-sm text-red-100">
      <span className="flex-1">{noRefundText(what)}</span>
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
  onConfirm,
  onCancel,
}: {
  name: string;
  plural: string;
  max: number;
  roomEach: number;
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
        No refund: removes {count} {count === 1 ? name : plural} for good and frees {count * roomEach} room.
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
