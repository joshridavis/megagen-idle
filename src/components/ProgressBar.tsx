import { sprites } from '../assets';

/** Segmented progress bar drawn with the progress segment sprite. */
export default function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="h-4 w-full overflow-hidden rounded border border-slate-600 bg-slate-900"
    >
      <div
        className="pixelated h-full transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
        style={{ width: `${pct}%`, backgroundImage: `url(${sprites.research_progress_segment})`, backgroundSize: '16px 16px' }}
      />
    </div>
  );
}
