import { useMemo } from 'react';
import { sprites } from '../assets';
import { ACCENTS } from '../data/achievements';
import { useStore } from '../store';
import { getAvailableRoom, getTotalEnergyRate, selectEnergy } from '../store/selectors';
import { getEnergyBreakdown } from '../utils/breakdown';
import BreakdownTooltip from './BreakdownTooltip';
import PlayerLevelBadge from './PlayerLevelBadge';
import { useNumberFormat } from './useNumberFormat';

export default function EnergyDisplay() {
  const energy = useStore(selectEnergy);
  const rate = useStore(getTotalEnergyRate);
  const room = useStore((s) => s.roomUsed);
  const capacity = useStore((s) => s.roomCapacity);
  const free = useStore(getAvailableRoom);
  const fmt = useNumberFormat();
  const accentId = useStore((s) => s.settings.cosmetics?.accent ?? 'amber');
  const accent = ACCENTS.find((x) => x.id === accentId) ?? ACCENTS[0];
  const generators = useStore((s) => s.activeGenerators);
  const completed = useStore((s) => s.completedResearch);
  const lifetime = useStore((s) => s.lifetimeEnergy);
  const effects = useStore((s) => s.activeEffects);
  const pets = useStore((s) => s.pets);
  const producers = useStore((s) => s.producers);
  const roomCapacity = useStore((s) => s.roomCapacity);
  const mapPins = useStore((s) => s.mapPins);
  const breakdown = useMemo(
    () =>
      getEnergyBreakdown({ activeGenerators: generators, completedResearch: completed, lifetimeEnergy: lifetime, activeEffects: effects, pets, producers, roomCapacity, mapPins }),
    [generators, completed, lifetime, effects, pets, producers, roomCapacity, mapPins],
  );
  // overall change from all boosts (event effects can apply to one generator type only)
  const boost = breakdown.base > 0 ? breakdown.total / breakdown.base - 1 : breakdown.modifiers.reduce((sum, m) => sum + (m.percent ?? 0), 0);
  return (
    <div className={`flex items-center gap-3 rounded-lg bg-slate-800/95 px-4 py-3 shadow-lg shadow-black/40 ring-2 backdrop-blur ${accent.ring}`} data-testid="energy-display">
      <img src={sprites.energy_icon} alt="Energy" width={32} height={32} className="pixelated" />
      <div className="leading-tight">
        <span className={`font-mono text-2xl ${accent.text}`} aria-label="Energy total">
          {fmt.num(energy)}
        </span>
        <div className="text-xs text-slate-400">
          <BreakdownTooltip id="energy-breakdown" title="Energy per second" baseLabel="Generators" unit="/s" breakdown={breakdown}>
            <span className="font-mono" aria-label="Energy rate">
              +{fmt.rate(rate)}/s
            </span>
          </BreakdownTooltip>
          {Math.round(boost * 100) !== 0 && (
            <span className={`ml-1 font-mono ${boost > 0 ? 'text-emerald-400' : 'text-red-400'}`} data-testid="energy-boost">
              {boost > 0 ? '▲' : '▼'}
              {Math.abs(Math.round(boost * 100))}%
            </span>
          )}
        </div>
      </div>
      <div className="ml-3 border-l border-slate-600 pl-3 text-sm sm:ml-4 sm:pl-4" aria-label="Room">
        <div className="text-slate-400">Room</div>
        <div className="font-mono">
          {room}/{capacity} <span className="text-xs text-slate-400">({free} free)</span>
        </div>
      </div>
      <PlayerLevelBadge />
    </div>
  );
}
