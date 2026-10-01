/** Shared scrap controls: a Scrap button with a no-refund tooltip, and a confirm row. */

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
