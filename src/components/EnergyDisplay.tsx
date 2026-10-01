import { useStore } from '../store';
import { sprites } from '../assets';

export default function EnergyDisplay() {
  const energy = useStore((s) => s.energy);
  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-800 px-4 py-3 shadow" data-testid="energy-display">
      <img src={sprites.energy_icon} alt="Energy" width={32} height={32} className="pixelated" />
      <span className="font-mono text-2xl text-yellow-300" aria-label="Energy total">
        {Math.floor(energy).toLocaleString('en-US')}
      </span>
    </div>
  );
}
