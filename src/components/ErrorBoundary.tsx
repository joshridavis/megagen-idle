import { Component, useState, type ErrorInfo, type ReactNode } from 'react';
import { ENTRY_ICONS } from '../data/logIcons';
import { SAVE_KEY, useStore } from '../store';
import { pickSaved, SAVE_VERSION } from '../store/migrations';
import { keepDamagedSave } from '../store/storage';
import { downloadText, saveFileName } from '../utils/download';
import { exportSave } from '../utils/saveFile';

/** Recovery screen (0.46): shown instead of a blank page when the game hits an error. */
function Recovery({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const onExport = () => {
    try {
      downloadText(saveFileName(), exportSave(useStore.getState()));
      setNote('Save downloaded. Keep the file somewhere safe; Settings → Import save loads it again.');
    } catch {
      setNote('The save could not be exported.');
    }
  };
  const onReset = async () => {
    // the current game is kept as a damaged copy before it is replaced
    try {
      await keepDamagedSave(SAVE_KEY, { at: Date.now(), reason: `the game hit an error (${error.message})`, raw: JSON.stringify({ state: pickSaved(useStore.getState()), version: SAVE_VERSION }) });
    } catch {
      // keep going: the player asked to reset
    }
    useStore.getState().resetGame();
    onRetry();
  };
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 p-6" role="alert" data-testid="recovery">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-slate-300">
        MegaGen Idle hit an error and stopped drawing the game. Your progress is still saved. Try again first; if the error comes back,
        download your save, then reset.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" autoFocus onClick={onRetry} className="min-h-11 rounded bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-500">
          Try again
        </button>
        <button type="button" onClick={onExport} className="min-h-11 rounded bg-sky-600 px-4 py-2 font-semibold hover:bg-sky-500">
          Download save
        </button>
        {!confirmReset && (
          <button type="button" onClick={() => setConfirmReset(true)} className="min-h-11 rounded bg-red-800 px-4 py-2 font-semibold hover:bg-red-700">
            Reset game…
          </button>
        )}
      </div>
      {confirmReset && (
        <div className="rounded bg-red-950/60 p-3 text-sm text-red-100">
          <p className="mb-2">Start a new game? A copy of the current one is kept and can be downloaded later in Settings → Save.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => void onReset()} className="min-h-11 rounded bg-red-700 px-3 py-2 font-semibold hover:bg-red-600">
              Yes, start over
            </button>
            <button type="button" onClick={() => setConfirmReset(false)} className="min-h-11 rounded bg-slate-600 px-3 py-2 font-semibold hover:bg-slate-500">
              Cancel
            </button>
          </div>
        </div>
      )}
      {note && (
        <p role="status" className="text-sm text-emerald-300">
          {note}
        </p>
      )}
      <details className="text-xs text-slate-400">
        <summary className="cursor-pointer">Error details</summary>
        <pre className="mt-2 whitespace-pre-wrap break-words">{error.message}</pre>
      </details>
    </main>
  );
}

/**
 * Catches errors thrown while drawing the game (0.46), shows the recovery
 * screen and writes the error to the event log.
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('MegaGen Idle error', error, info.componentStack);
    try {
      useStore.getState().logEvents([{ kind: 'save', icon: ENTRY_ICONS.save, text: `The game hit an error and showed the recovery screen: ${error.message}`, toast: false }]);
    } catch {
      // the log itself failed: the recovery screen still shows
    }
  }

  render() {
    if (this.state.error) return <Recovery error={this.state.error} onRetry={() => this.setState({ error: null })} />;
    return this.props.children;
  }
}
