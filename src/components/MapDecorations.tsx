import { useEffect, useRef } from 'react';
import { sprites } from '../assets';
import { DECORATION_LIMIT, DECORATIONS, type DecorationId } from '../data/decorations';
import { useStore } from '../store';
import { countPlaced, isDecorationUnlocked, unlockProgress, unlockText } from '../utils/decorations';

/** What a map click does while decorating: place one kind, or remove. */
export type DecorTool = DecorationId | 'remove' | null;

/**
 * Decorations (1.13): pick an unlocked decoration, then click free tiles to
 * place it; "Remove" takes them away. Cosmetic only. A floating panel over the
 * map (1.47): docked bottom right on wide screens, a bottom sheet on phones.
 * It is not modal, so the map stays usable; Close or Escape ends decorating.
 */
export default function MapDecorations({ tool, onTool, onClose }: { tool: DecorTool; onTool: (t: DecorTool) => void; onClose: () => void }) {
  const lifetimeEnergy = useStore((s) => s.lifetimeEnergy);
  const achievements = useStore((s) => s.achievements);
  const contracts = useStore((s) => s.contracts);
  const decor = useStore((s) => s.mapDecorations);
  const unlockState = { lifetimeEnergy, achievements, contracts };
  const placedAny = Object.keys(decor).length > 0;
  const box = useRef<HTMLDivElement>(null);
  // focus moves into the panel when it opens
  useEffect(() => {
    box.current?.focus();
  }, []);
  return (
    <div
      ref={box}
      id="decor-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="decor-title"
      tabIndex={-1}
      className="fixed inset-x-0 bottom-0 z-[44] max-h-[45vh] overflow-y-auto rounded-t-xl border border-slate-600 bg-slate-800/95 p-3 text-sm shadow-2xl shadow-black/60 backdrop-blur focus-visible:outline-2 focus-visible:outline-sky-400 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-h-[calc(100vh-10rem)] sm:w-96 sm:rounded-xl"
      data-testid="map-decorations"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 id="decor-title" className="font-semibold">
            🎨 Decorations
          </h3>
          <p className="text-xs text-slate-400">Just for looks: no room, no bonus. Machines always go first.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close decorations"
          data-testid="decor-close"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-lg hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-sky-400"
        >
          ✕
        </button>
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {DECORATIONS.map((d) => {
          const open = isDecorationUnlocked(unlockState, d.id);
          const p = unlockProgress(unlockState, d.unlock);
          const n = countPlaced(decor, d.id);
          return (
            <li key={d.id}>
              <button
                type="button"
                disabled={!open}
                aria-pressed={tool === d.id}
                onClick={() => onTool(tool === d.id ? null : d.id)}
                data-testid={`decor-pick-${d.id}`}
                className={`flex w-full items-center gap-2 rounded border px-2 py-1 text-left ${
                  tool === d.id ? 'border-sky-300 bg-sky-900/60' : 'border-slate-700 bg-slate-900/40 hover:bg-slate-700'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <img src={sprites[d.sprite]} alt="" width={24} height={24} className={`pixelated ${open ? '' : 'grayscale'}`} />
                <span className="min-w-0">
                  <span className="block truncate">{d.name}</span>
                  <span className="block text-xs text-slate-400">
                    {open ? `${n}/${DECORATION_LIMIT} placed` : `🔒 ${unlockText(d.unlock)} (${Math.min(p.have, p.need)}/${p.need})`}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {/* Remove and Close stay in view however long the list gets */}
      <div className="sticky -bottom-3 -mx-3 -mb-3 mt-2 flex flex-wrap gap-2 border-t border-slate-700 bg-slate-800 px-3 py-2">
        <button
          type="button"
          disabled={!placedAny}
          aria-pressed={tool === 'remove'}
          onClick={() => onTool(tool === 'remove' ? null : 'remove')}
          data-testid="decor-remove"
          className={`rounded px-2 py-0.5 text-xs ${tool === 'remove' ? 'bg-red-800' : 'bg-slate-700 hover:bg-slate-600'} disabled:opacity-50`}
        >
          🧹 Remove
        </button>
        <button type="button" onClick={onClose} className="rounded bg-slate-700 px-2 py-0.5 text-xs hover:bg-slate-600" data-testid="decor-done">
          Close
        </button>
      </div>
    </div>
  );
}
