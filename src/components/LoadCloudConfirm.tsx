import { CLOUD_PRIMARY, CLOUD_SECONDARY } from './cloudStyles';

/** The confirmation before the cloud save replaces the game on this device (Settings and the top-bar menu, 1.46). */
export default function LoadCloudConfirm({ busy, onConfirm, onCancel }: { busy: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="rounded border border-yellow-700 p-2 text-xs" data-testid="load-cloud-confirm">
      <p className="mb-2 text-yellow-100">This replaces the game on this device with your cloud save.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={onConfirm} className={CLOUD_PRIMARY}>
          Yes, load it
        </button>
        <button type="button" autoFocus onClick={onCancel} className={CLOUD_SECONDARY}>
          Cancel
        </button>
      </div>
    </div>
  );
}
