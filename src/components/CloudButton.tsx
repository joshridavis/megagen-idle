import { useEffect, useId, useRef, useState } from 'react';
import { loadFromCloud, saveToCloud, useAccount } from '../store/account';
import { cloudEnabled } from '../store/cloud';
import { cloudSyncState, timeAgo, type CloudSyncKind } from '../utils/cloudStatus';
import LoadCloudConfirm from './LoadCloudConfirm';
import { CLOUD_PRIMARY, CLOUD_SECONDARY } from './cloudStyles';

const DOT: Record<CloudSyncKind, string> = {
  signedOut: 'bg-slate-500',
  connecting: 'bg-slate-400 animate-pulse',
  saving: 'bg-sky-400 animate-pulse',
  saved: 'bg-emerald-400',
  notYet: 'bg-yellow-400',
  error: 'bg-red-500',
};

const item = 'flex min-h-11 w-full items-center rounded px-3 text-left font-semibold hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-sky-400';

/** Keeps "saved N minutes ago" current. */
function useNow(everyMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(t);
  }, [everyMs]);
  return now;
}

/**
 * The ☁️ button in the pinned top bar (1.46): the cloud sync state, and a small menu to save or load
 * the cloud save from any tab. Absent in builds without cloud settings.
 */
export default function CloudButton({ onOpenAccount }: { onOpenAccount: () => void }) {
  const a = useAccount();
  const now = useNow(30_000);
  const [open, setOpen] = useState(false);
  const [confirmLoad, setConfirmLoad] = useState(false);
  const [saving, setSaving] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = (refocus = true) => {
    setOpen(false);
    setConfirmLoad(false);
    if (refocus) button.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  if (!cloudEnabled() || a.status === 'off') return null;
  const sync = cloudSyncState(a, now);
  const signedIn = a.status === 'signedIn';
  const openAccount = () => {
    close(false);
    onOpenAccount();
  };

  return (
    <div
      ref={wrap}
      className="relative shrink-0"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          close();
        }
      }}
    >
      <button
        ref={button}
        type="button"
        aria-label={`Cloud save: ${sync.label}`}
        title={`Cloud save: ${sync.label}`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => (open ? close() : setOpen(true))}
        data-testid="cloud-button"
        data-sync={sync.kind}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-800/95 text-xl shadow-lg shadow-black/40 hover:bg-slate-700 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
      >
        <span aria-hidden="true">☁️</span>
        <span aria-hidden="true" className={`absolute right-0 bottom-0 h-3 w-3 rounded-full ring-2 ring-slate-900 ${DOT[sync.kind]}`} />
      </button>
      {open && (
        <div
          id={menuId}
          role="group"
          aria-label="Cloud save"
          data-testid="cloud-menu"
          className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-600 bg-slate-800 p-2 text-sm shadow-xl shadow-black/50"
        >
          <p className="px-3 pb-2 text-xs text-slate-400" data-testid="cloud-menu-status">
            {signedIn ? (
              <>
                {a.user?.username ?? a.user?.email}
                <br />
                Last cloud save: {a.lastSyncAt === null ? 'not yet' : timeAgo(a.lastSyncAt, now)}
              </>
            ) : sync.kind === 'connecting' ? (
              'Connecting…'
            ) : (
              'Sign in to keep your game in the cloud and play it on any device.'
            )}
          </p>
          {signedIn && !confirmLoad && (
            <>
              {/* autoFocus: focus moves into the menu when it opens */}
              <div className="flex flex-col gap-2 px-1 pb-2">
                {/* the main action stands out, as in Settings (1.68) */}
                <button
                  type="button"
                  autoFocus
                  disabled={a.busy}
                  onClick={() => {
                    setSaving(true);
                    void saveToCloud().finally(() => setSaving(false));
                  }}
                  className={`${CLOUD_PRIMARY} w-full`}
                  data-testid="menu-save-cloud"
                >
                  {saving ? 'Saving…' : 'Save to cloud now'}
                </button>
                <button type="button" disabled={a.busy} onClick={() => setConfirmLoad(true)} className={`${CLOUD_SECONDARY} w-full`}>
                  Load cloud save
                </button>
              </div>
            </>
          )}
          {signedIn && confirmLoad && (
            <div className="px-1 pb-1">
              <LoadCloudConfirm
                busy={a.busy}
                onConfirm={() => void loadFromCloud().then(() => setConfirmLoad(false))}
                onCancel={() => setConfirmLoad(false)}
              />
            </div>
          )}
          {!signedIn && sync.kind !== 'connecting' && (
            <div className="px-1 pb-2">
              <button type="button" autoFocus onClick={openAccount} className={`${CLOUD_PRIMARY} w-full`}>
                Sign in
              </button>
            </div>
          )}
          {signedIn && (
            <button type="button" onClick={openAccount} className={`${item} font-normal text-sky-300`}>
              Account settings
            </button>
          )}
          {a.error && (
            <p role="alert" className="px-3 pt-1 text-xs text-red-300">
              {a.error}
            </p>
          )}
          {a.notice && signedIn && (
            <p role="status" className="px-3 pt-1 text-xs text-emerald-300">
              {a.notice}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
