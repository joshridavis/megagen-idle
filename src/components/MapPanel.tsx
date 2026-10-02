import { useMemo, useState } from 'react';
import { sprites, type SpriteId } from '../assets';
import { GENERATORS } from '../data/generators';
import { LOCKED_PREVIEW_ROWS } from '../data/map';
import { PRODUCERS } from '../data/producers';
import { useStore } from '../store';
import type { GeneratorType } from '../types/generator';
import type { ProducerId } from '../types/resource';
import { getEnergyBonuses } from '../utils/bonuses';
import { getEffectMods } from '../utils/effectMods';
import { getGeneratorOutput } from '../utils/energyGeneration';
import { getNextRoomTier } from '../utils/roomSystem';
import { layoutSite, type Placed } from '../utils/siteMap';
import { GENERATOR_SPRITES } from './generatorSprites';
import { PRODUCER_SPRITES } from './producerSprites';
import { useNumberFormat } from './useNumberFormat';

/**
 * Site map (1.04, playtest 14): every machine on a tile grid, one tile per
 * unit of room. Read only for now; moving machines and terrain zones come
 * in 1.05.
 */
export default function MapPanel({ onSelect }: { onSelect: (generatorId: string) => void }) {
  const state = useStore((s) => s);
  const fmt = useNumberFormat();
  const map = useMemo(() => layoutSite(state), [state.activeGenerators, state.producers, state.completedResearch, state.roomCapacity]); // eslint-disable-line react-hooks/exhaustive-deps
  const [hover, setHover] = useState<string | null>(null);
  const next = getNextRoomTier(state.expansionLevel);
  const rows = Math.ceil(map.capacity / map.columns);
  const lockedRows = next ? LOCKED_PREVIEW_ROWS : 0;
  const bonuses = getEnergyBonuses(state);
  const mods = getEffectMods(state.activeEffects);

  const info = (p: Placed) => {
    if (p.kind === 'generator') {
      const g = state.activeGenerators.find((x) => x.id === p.id)!;
      return `${GENERATORS[g.type].name} #${g.id.split('-')[1]} · Lv ${g.level} · ${g.isActive ? `+${fmt.rate(getGeneratorOutput(g, bonuses, mods))} energy/s` : 'off'} · ${p.cells.length} tiles`;
    }
    return `${PRODUCERS[p.id as ProducerId].name} · ${p.cells.length} tile${p.cells.length > 1 ? 's' : ''}`;
  };
  const spriteOf = (p: Placed): SpriteId => {
    if (p.kind === 'producer') return PRODUCER_SPRITES[p.id as ProducerId];
    const g = state.activeGenerators.find((x) => x.id === p.id);
    return g?.isActive ? GENERATOR_SPRITES[p.type as GeneratorType].active : GENERATOR_SPRITES[p.type as GeneratorType].inactive;
  };
  const cellPos = (c: number) => ({ x: c % map.columns, y: Math.floor(c / map.columns) });
  const used = map.placed.reduce((n, p) => n + p.cells.length, 0);
  const hovered = map.placed.find((p) => p.key === hover);

  return (
    <section aria-label="Site map" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Your site ({used}/{map.capacity} tiles)
        </h2>
        <span className="text-xs text-slate-400">One tile per unit of room. Click a machine to find it in your list.</span>
      </div>
      <div className="min-h-5 text-sm text-sky-200" aria-live="polite" data-testid="map-info">
        {hovered ? info(hovered) : 'Hover over or tap a machine to see it.'}
      </div>
      <div className="w-full max-w-3xl overflow-x-auto rounded-lg border border-slate-700">
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${map.columns}, minmax(18px, 1fr))`, minWidth: map.columns * 18 }}
          data-testid="site-map"
        >
          {Array.from({ length: (rows + lockedRows) * map.columns }, (_, c) => (
            <img
              key={c}
              src={c < map.capacity ? sprites.tile_ground : sprites.tile_locked}
              alt=""
              className="pixelated aspect-square w-full"
              data-locked={c >= map.capacity || undefined}
            />
          ))}
          {map.placed.map((p) => {
            const total = rows + lockedRows;
            const isGen = p.kind === 'generator';
            const lit = hover === p.key;
            const pct = (x: number, y: number, w: number, h: number) => ({
              left: `${(x / map.columns) * 100}%`,
              top: `${(y / total) * 100}%`,
              width: `${(w / map.columns) * 100}%`,
              height: `${(h / total) * 100}%`,
            });
            const select = () => (isGen ? onSelect(p.id) : setHover(p.key));
            return (
              <div key={p.key} onMouseEnter={() => setHover(p.key)} onMouseLeave={() => setHover((k) => (k === p.key ? null : k))}>
                {/* one tile at a time: a machine never covers tiles that are not its own (playtest 15 bug) */}
                {p.cells.map((c) => (
                  <div
                    key={c}
                    aria-hidden="true"
                    onClick={select}
                    className={`absolute cursor-pointer border ${lit ? 'z-10 border-yellow-300/80 bg-yellow-300/25' : 'border-slate-900/40 bg-slate-900/25'}`}
                    style={pct(cellPos(c).x, cellPos(c).y, 1, 1)}
                  />
                ))}
                <button
                  type="button"
                  onFocus={() => setHover(p.key)}
                  onClick={select}
                  aria-label={info(p)}
                  data-testid={`map-${p.key}`}
                  className="absolute z-10 flex items-center justify-center"
                  style={pct(p.core.x, p.core.y, p.core.w, p.core.h)}
                >
                  <img src={sprites[spriteOf(p)]} alt="" className="pixelated max-h-full max-w-full object-contain p-0.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {next && (
        <p className="text-xs text-slate-400">
          Fenced land: the next room expansion adds {next.capacity} tiles (Generators tab → Room).
        </p>
      )}
    </section>
  );
}
