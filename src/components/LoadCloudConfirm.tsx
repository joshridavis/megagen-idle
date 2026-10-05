const button = 'min-h-11 rounded px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60';

/** The confirmation before the cloud save replaces the game on this device (Settings and the top-bar menu, 1.46). */
export default function LoadCloudConfirm({ busy, onConfirm, onCancel }: { busy: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="rounded border border-yellow-700 p-2 text-xs" data-testid="load-cloud-confirm">
      <p className="mb-2 text-yellow-100">This replaces the game on this device with your cloud save.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={onConfirm} className={`${button} bg-sky-700 hover:bg-sky-600`}>
          Yes, load it
        </button>
        <button type="button" autoFocus onClick={onCancel} className={`${button} bg-slate-600 hover:bg-slate-500`}>
          Cancel
        </button>
      </div>
    </div>
  );
}
