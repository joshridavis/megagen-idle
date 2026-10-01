import { sprites } from '../assets';
import { useStore } from '../store';
import { getAvailableRoom, getTotalEnergyRate, selectEnergy } from '../store/selectors';

export default function EnergyDisplay() {
  const energy = useStore(selectEnergy);
  const rate = useStore(getTotalEnergyRate);
  const room = useStore((s) => s.roomUsed);
  const capacity = useStore((s) => s.roomCapacity);
  const free = useStore(getAvailableRoom);
  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-800 px-4 py-3 shadow" data-testid="energy-display">
      <img src={sprites.energy_icon} alt="Energy" width={32} height={32} className="pixelated" />
      <div className="leading-tight">
        <span className="font-mono text-2xl text-yellow-300" aria-label="Energy total">
          {Math.floor(energy).toLocaleString('en-US')}
        </span>
        <div className="font-mono text-xs text-slate-400" aria-label="Energy rate">
          +{rate.toFixed(1)}/s
        </div>
      </div>
      <div className="ml-4 border-l border-slate-600 pl-4 text-sm" aria-label="Room">
        <div className="text-slate-400">Room</div>
        <div className="font-mono">
          {room}/{capacity} <span className="text-xs text-slate-400">({free} free)</span>
        </div>
      </div>
    </div>
  );
}
