import { useClickEnergy } from './useClickEnergy';

/**
 * A small round ⚡ button at the end of the pinned top bar, shown only while the big
 * "Generate energy" button is scrolled out of view (1.45). Same click, same "+N" pop.
 */
export default function MiniClickButton() {
  const { clickText, pops, onClick } = useClickEnergy();
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onClick}
        aria-label="Generate energy"
        title="Generate energy"
        data-testid="mini-click-button"
        className="mini-click flex h-11 w-11 select-none items-center justify-center rounded-full border-2 border-yellow-500 bg-yellow-400 text-xl shadow-[0_3px_0_0_#b4202a] transition-transform hover:bg-yellow-300 active:translate-y-0.5 active:shadow-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
      >
        <span aria-hidden="true">⚡</span>
      </button>
      {pops.map((id) => (
        <span
          key={id}
          aria-hidden="true"
          className="click-pop-down pointer-events-none absolute left-1/2 top-full whitespace-nowrap font-mono text-sm font-bold text-yellow-300"
        >
          +{clickText}
        </span>
      ))}
    </div>
  );
}
