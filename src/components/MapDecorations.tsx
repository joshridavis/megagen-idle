import { useRef, useState } from 'react';
import { sprites } from '../assets';
import MapFloatingPanel from './MapFloatingPanel';
import { DECORATION_LIMIT, DECORATIONS, type DecorationId } from '../data/decorations';
import { useStore } from '../store';
import { countPlaced, decorationPrice, isDecorationUnlocked, unlockProgress, unlockText } from '../utils/decorations';
import { useNumberFormat } from './useNumberFormat';

/** What a map click does while decorating: place one kind, or remove. */
export type DecorTool = DecorationId | 'remove' | null;

/**
 * Decorations (1.13): buy copies with energy (1.53), pick a kind, then click
 * free tiles to place the copies you own; "Remove" takes them away for free. Cosmetic only. A floating panel over the
 * map (1.47): docked bottom right on wide screens, a bottom sheet on phones.
 * It is not modal, so the map stays usable; Close or Escape ends decorating.
 */
export default function MapDecorations({
  tool,
  onTool,
  onClose,
  onNote,
}: {
  tool: DecorTool;
  onTool: (t: DecorTool) => void;
  onClose: () => void;
  /** Shows a line in the map's note bar. */
  onNote?: (note: string) => void;
}) {
  const lifetimeEnergy = useStore((s) => s.lifetimeEnergy);
  const achievements = useStore((s) => s.achievements);
  const contracts = useStore((s) => s.contracts);
  const decor = useStore((s) => s.mapDecorations);
  const bought = useStore((s) => s.decorationsBought);
  const energy = useStore((s) => s.energy);
  const fmt = useNumberFormat();
  const buy = useStore((s) => s.buyDecoration);
  const unlockState = { lifetimeEnergy, achievements, contracts };
  const placedCount = Object.keys(decor).length;
  const placedAny = placedCount > 0;
  const removeAll = useStore((s) => s.removeAllDecorations);
  // Remove all asks first (1.70); focus goes back to the button when the question closes.
  const [confirming, setConfirming] = useState(false);
  const removeAllButton = useRef<HTMLButtonElement>(null);
  const endConfirm = () => {
    setConfirming(false);
    requestAnimationFrame(() => removeAllButton.current?.focus());
  };
  const confirmRemoveAll = () => {
    if (removeAll() > 0) {
      if (tool === 'remove') onTool(null);
      onNote?.('All decorations removed: place them again any time for free.');
    }
    endConfirm();
  };
  return (
    <MapFloatingPanel
      id="decor-panel"
      title="🎨 Decorations"
      subtitle="Just for looks: no room, no bonus. Buy each copy once with energy (the next costs more), then place, remove and place it again for free. Machines always go first."
      closeLabel="Close decorations"
      closeTestId="decor-close"
      testId="map-decorations"
      onClose={onClose}
    >
      <ul className="grid grid-cols-2 gap-2">
        {DECORATIONS.map((d) => {
          const open = isDecorationUnlocked(unlockState, d.id);
          const p = unlockProgress(unlockState, d.unlock);
          const n = countPlaced(decor, d.id);
          const owned = bought[d.id] ?? 0;
          const maxed = owned >= DECORATION_LIMIT;
          const price = decorationPrice({ decorationsBought: bought }, d.id);
          const short = energy < price;
          return (
            <li key={d.id} className="flex flex-col gap-1">
              <button
                type="button"
                disabled={!open || owned === 0}
                aria-pressed={tool === d.id}
                onClick={() => onTool(tool === d.id ? null : d.id)}
                data-testid={`decor-pick-${d.id}`}
                title={open && owned === 0 ? 'Buy one first' : undefined}
                className={`flex w-full items-center gap-2 rounded border px-2 py-1 text-left ${
                  tool === d.id ? 'border-sky-300 bg-sky-900/60' : 'border-slate-700 bg-slate-900/40 hover:bg-slate-700'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <img src={sprites[d.sprite]} alt="" width={24} height={24} className={`pixelated ${open ? '' : 'grayscale'}`} />
                <span className="min-w-0">
                  <span className="block truncate">{d.name}</span>
                  <span className="block text-xs text-slate-400" data-testid={`decor-count-${d.id}`}>
                    {open ? `${n}/${owned} placed · ${owned}/${DECORATION_LIMIT} owned` : `🔒 ${unlockText(d.unlock)} (${Math.min(p.have, p.need)}/${p.need})`}
                  </span>
                </span>
              </button>
              {open &&
                (maxed ? (
                  <span className="text-center text-xs text-emerald-400" data-testid={`decor-price-${d.id}`}>
                    All {DECORATION_LIMIT} owned
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={short}
                    onClick={() => buy(d.id)}
                    data-testid={`decor-buy-${d.id}`}
                    className="rounded bg-slate-700 px-2 py-0.5 text-xs hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Buy {owned ? 'another' : 'one'}:{' '}
                    <span className={`font-mono ${short ? 'text-red-400' : 'text-yellow-200'}`} data-testid={`decor-price-${d.id}`} data-short={short}>
                      ⚡ {fmt.num(price)}
                    </span>
                    {short && <span className="sr-only"> (not enough energy)</span>}
                  </button>
                ))}
            </li>
          );
        })}
      </ul>
      {/* Remove, Remove all and Close stay in view however long the list gets */}
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
        <button
          ref={removeAllButton}
          type="button"
          disabled={!placedAny}
          aria-expanded={confirming}
          aria-controls="decor-remove-all-confirm"
          onClick={() => setConfirming(true)}
          data-testid="decor-remove-all"
          className="rounded bg-slate-700 px-2 py-0.5 text-xs hover:bg-slate-600 disabled:opacity-50"
        >
          🧹 Remove all
        </button>
        <button type="button" onClick={onClose} className="rounded bg-slate-700 px-2 py-0.5 text-xs hover:bg-slate-600" data-testid="decor-done">
          Close
        </button>
        {confirming && (
          <div
            id="decor-remove-all-confirm"
            role="alertdialog"
            aria-labelledby="decor-remove-all-question"
            className="w-full rounded border border-yellow-700 p-2 text-xs"
            data-testid="decor-remove-all-confirm"
            onKeyDown={(e) => {
              if (e.key !== 'Escape') return;
              // Escape cancels the question only; the panel stays open.
              e.preventDefault();
              e.stopPropagation();
              endConfirm();
            }}
          >
            <p id="decor-remove-all-question" className="mb-2 text-yellow-100">
              Take all {placedCount} decorations off the map? You keep every copy and can place them again for free.
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={confirmRemoveAll} className="rounded bg-red-800 px-2 py-0.5 hover:bg-red-700" data-testid="decor-remove-all-yes">
                Remove all
              </button>
              <button type="button" autoFocus onClick={endConfirm} className="rounded bg-slate-700 px-2 py-0.5 hover:bg-slate-600" data-testid="decor-remove-all-cancel">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </MapFloatingPanel>
  );
}
