import { sprites } from '../assets';
import { DECORATION_LIMIT, DECORATIONS, type DecorationId } from '../data/decorations';
import { useStore } from '../store';
import { countPlaced, isDecorationUnlocked, unlockProgress, unlockText } from '../utils/decorations';

/** What a map click does while decorating: place one kind, or remove. */
export type DecorTool = DecorationId | 'remove' | null;

/**
 * Decorations box under the map (1.13): pick an unlocked decoration, then
 * click free tiles to place it; "Remove" takes them away. Cosmetic only.
 */
export default function MapDecorations({ tool, onTool }: { tool: DecorTool; onTool: (t: DecorTool) => void }) {
  const lifetimeEnergy = useStore((s) => s.lifetimeEnergy);
  const achievements = useStore((s) => s.achievements);
  const contracts = useStore((s) => s.contracts);
  const decor = useStore((s) => s.mapDecorations);
  const unlockState = { lifetimeEnergy, achievements, contracts };
  const placedAny = Object.keys(decor).length > 0;
  return (
    <section aria-label="Decorations" className="rounded-lg bg-slate-800 p-3 text-sm" data-testid="map-decorations">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">Decorations</h3>
        <span className="text-xs text-slate-400">Just for looks: no room, no bonus. Machines always go first.</span>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
      <div className="mt-2 flex flex-wrap gap-2">
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
        {tool && (
          <button type="button" onClick={() => onTool(null)} className="rounded bg-slate-700 px-2 py-0.5 text-xs hover:bg-slate-600" data-testid="decor-done">
            Done
          </button>
        )}
      </div>
    </section>
  );
}
