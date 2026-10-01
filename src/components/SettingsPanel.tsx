import { useRef, useState } from 'react';
import { useStore } from '../store';
import { exportSave, parseSaveFile } from '../utils/saveFile';
import type { GameState } from '../types/state';

/** Settings tab: save export and import (0.28). Reset and preferences come in 0.29. */
export default function SettingsPanel() {
  const loadSave = useStore((s) => s.loadSave);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState<GameState | null>(null);

  const onExport = () => {
    const text = exportSave(useStore.getState());
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `megagen-idle-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ kind: 'ok', text: 'Save exported. Keep the file somewhere safe.' });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const result = parseSaveFile(await file.text());
    if (fileRef.current) fileRef.current.value = '';
    if (!result.ok) {
      setPending(null);
      setMessage({ kind: 'error', text: `${result.error} Your current game was not changed.` });
      return;
    }
    setPending(result.state);
    setMessage(null);
  };

  return (
    <section aria-label="Settings" className="w-full max-w-2xl space-y-4">
      <div className="rounded-lg bg-slate-800 p-4">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">Save</h2>
        <p className="mb-3 text-sm text-slate-300">
          Your game saves automatically in this browser. Export a copy to back it up or move it to another device.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onExport} className="min-h-11 rounded bg-sky-600 px-4 py-2 font-semibold hover:bg-sky-500">
            Export save
          </button>
          <label className="min-h-11 cursor-pointer rounded bg-slate-600 px-4 py-2 font-semibold hover:bg-slate-500 has-focus-visible:outline-2 has-focus-visible:outline-sky-400">
            Import save…
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Import save file"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
        </div>
        {pending && (
          <div role="alert" className="mt-3 rounded bg-amber-950/60 p-3 text-sm text-amber-100">
            <p className="mb-2">
              This save has {Math.floor(pending.energy).toLocaleString('en-US')} energy, {pending.activeGenerators.length} generators and
              research level {pending.researchLevel}. Loading it <strong>replaces your current game</strong>.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  loadSave(pending);
                  setPending(null);
                  setMessage({ kind: 'ok', text: 'Save loaded.' });
                }}
                className="min-h-11 rounded bg-amber-600 px-3 py-2 font-semibold hover:bg-amber-500"
              >
                Load this save
              </button>
              <button type="button" onClick={() => setPending(null)} className="min-h-11 rounded bg-slate-600 px-3 py-2 font-semibold hover:bg-slate-500">
                Cancel
              </button>
            </div>
          </div>
        )}
        {message && (
          <p role="status" className={`mt-3 text-sm ${message.kind === 'ok' ? 'text-emerald-300' : 'text-red-300'}`}>
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
}
