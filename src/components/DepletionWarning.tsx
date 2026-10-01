import { RESOURCE_NAMES } from '../data/resources';
import { useStore } from '../store';

/** Shown when generators were switched off because their fuel ran out. */
export default function DepletionWarning() {
  const depleted = useStore((s) => s.depletedResources);
  const dismiss = useStore((s) => s.dismissDepletedWarning);
  if (depleted.length === 0) return null;
  const names = depleted.map((id) => RESOURCE_NAMES[id]).join(', ');
  return (
    <div role="alert" className="flex w-full items-center justify-between gap-3 rounded-lg border border-red-500 bg-red-950/70 px-4 py-2 text-red-100">
      <span>
        <strong>{names}</strong> ran out. Generators that burn it were switched off. Build up stock, then switch them back on.
      </span>
      <button type="button" onClick={dismiss} className="rounded px-2 py-1 text-sm underline hover:bg-red-900">
        Dismiss
      </button>
    </div>
  );
}
