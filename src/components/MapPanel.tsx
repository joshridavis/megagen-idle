import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { sprites, type SpriteId } from '../assets';
import { GENERATORS } from '../data/generators';
import { LOCKED_PREVIEW_ROWS, MIN_MAP_ROWS, SEA_COLUMNS, ZONES, type Detail, type Terrain, type Zone } from '../data/map';
import { PRODUCERS } from '../data/producers';
import { useStore } from '../store';
import type { GeneratorType } from '../types/generator';
import type { ProducerId } from '../types/resource';
import { getEnergyBonuses } from '../utils/bonuses';
import { getEffectMods } from '../utils/effectMods';
import { getGeneratorOutput } from '../utils/energyGeneration';
import { detailAt, terrainAt, zoneFor } from '../utils/mapTerrain';
import { getNextRoomTier } from '../utils/roomSystem';
import { cellsAt, getPlacementBonuses, layoutSite, moveTargets, zoneAllows, zoneBonusFor, type Placed } from '../utils/siteMap';
import { GENERATOR_SPRITES } from './generatorSprites';
import { PRODUCER_SPRITES } from './producerSprites';
import { useNumberFormat } from './useNumberFormat';
import FloatingTip from './FloatingTip';
import { zoneTipText } from './zoneTip';

const TERRAIN_SPRITE: Record<Terrain, SpriteId> = {
  plain: 'tile_ground',
  plateau: 'tile_plateau',
  ridge: 'tile_ridge',
  river: 'tile_river',
  coast: 'tile_coast',
  coalfield: 'tile_coalfield',
  outcrop: 'tile_outcrop',
  oilfield: 'tile_oilfield',
};
const detailSprite = (d: Detail) => `deco_${d}` as SpriteId;
const TERRAIN_NAME = (t: Terrain) => (t === 'plain' ? 'Plain' : ZONES[t].name);
const pctBonus = (b: number) => `+${Math.round(b * 100)}%`;
const plural = (name: string) => (name.endsWith('y') ? `${name.slice(0, -1)}ies` : `${name}s`);
/** The machines a zone suits, e.g. "Quarries, Metal Mines, Uranium Mines". */
const zoneSuits = (z: Zone) =>
  [...ZONES[z].generators.map((g) => GENERATORS[g].name), ...(ZONES[z].producers ?? []).map((p) => PRODUCERS[p].name)].map(plural).join(', ');

/**
 * Site map (1.04; terrain, zones and moving in 1.05, playtest 14 and 15).
 * The site is drawn inside a larger landscape: a winding river, sunny
 * plateaus, windy ridges and the coast, with fenced land around it. Select a
 * machine, then a tile, to move it there.
 */
export default function MapPanel({ onSelect }: { onSelect: (generatorId: string) => void }) {
  const state = useStore((s) => s);
  const moveOnMap = useStore((s) => s.moveOnMap);
  const fmt = useNumberFormat();
  const map = layoutSite(state);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hoverCell, setHoverCell] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  /** A drag in progress (1.16): which machine, where it was grabbed, and whether it has moved yet. */
  const drag = useRef<{ key: string; grabX: number; grabY: number; x: number; y: number; moved: boolean } | null>(null);
  const dragged = useRef(false);
  const next = getNextRoomTier(state.expansionLevel);
  const siteRows = Math.ceil(map.capacity / map.columns);
  const rows = Math.max(MIN_MAP_ROWS, siteRows + (next ? LOCKED_PREVIEW_ROWS : 1));
  const viewColumns = map.columns + SEA_COLUMNS;
  const bonuses = getEnergyBonuses(state);
  const mods = { ...getEffectMods(state.activeEffects), placement: getPlacementBonuses(state) };
  const sel = map.placed.find((p) => p.key === selected) ?? null;
  const targets = useMemo(() => (sel ? moveTargets(map, sel.key) : new Set<number>()), [map, sel]);

  const nameOf = (p: Placed) =>
    p.kind === 'generator' ? `${GENERATORS[p.type as GeneratorType].name} #${p.id.split('-')[1]}` : PRODUCERS[p.id as ProducerId].name;
  const info = (p: Placed) => {
    const where = p.misplaced
      ? ` · ⚠ needs the ${ZONES[zoneFor(p.type) as Zone].name.toLowerCase()}`
      : p.zoneBonus > 0
        ? ` · ${pctBonus(p.zoneBonus)} on ${ZONES[zoneFor(p.type) as Zone].name.toLowerCase()}`
        : '';
    if (p.kind === 'generator') {
      const g = state.activeGenerators.find((x) => x.id === p.id)!;
      return `${nameOf(p)} · Lv ${g.level} · ${g.isActive ? `+${fmt.rate(getGeneratorOutput(g, bonuses, mods))} energy/s` : 'off'} · ${p.cells.length} tiles${where}`;
    }
    return `${nameOf(p)} · ${p.cells.length} tile${p.cells.length > 1 ? 's' : ''}${where}`;
  };
  const tileInfo = (c: number) => {
    const t = terrainAt(c % map.columns, Math.floor(c / map.columns));
    const text = t === 'plain' ? 'Plain: no bonus, good for anything.' : `${ZONES[t].name}: ${ZONES[t].description}`;
    return c >= map.capacity ? `${text} (fenced: a room expansion opens it)` : text;
  };
  const spriteOf = (p: Placed): SpriteId => {
    if (p.kind === 'producer') return PRODUCER_SPRITES[p.id as ProducerId];
    const g = state.activeGenerators.find((x) => x.id === p.id);
    return g?.isActive ? GENERATOR_SPRITES[p.type as GeneratorType].active : GENERATOR_SPRITES[p.type as GeneratorType].inactive;
  };
  const used = map.placed.reduce((n, p) => n + p.cells.length, 0);
  const hovered = map.placed.find((p) => p.key === hover);
  const pct = (x: number, y: number, w: number, h: number) => ({
    left: `${(x / viewColumns) * 100}%`,
    top: `${(y / rows) * 100}%`,
    width: `${(w / viewColumns) * 100}%`,
    height: `${(h / rows) * 100}%`,
  });

  // the footprint the selected machine would cover from the hovered tile
  const ghost = sel && hoverCell !== null ? cellsAt(hoverCell, sel.size, map.columns) : null;
  const ghostOk = ghost !== null && hoverCell !== null && targets.has(hoverCell);
  const ghostBonus = ghost && sel?.kind === 'generator' ? zoneBonusFor(sel.type, ghost, map.columns) : 0;

  const pick = (p: Placed) => {
    if (dragged.current) {
      dragged.current = false; // the click that ends a drag is not a selection
      return;
    }
    setNote(null);
    setSelected((k) => (k === p.key ? null : p.key));
  };
  /** The site cell under a pointer position, or null outside the site columns. */
  const cellAt = (clientX: number, clientY: number) => {
    const r = gridRef.current?.getBoundingClientRect();
    if (!r || r.width === 0 || r.height === 0) return null;
    const x = Math.floor(((clientX - r.left) / r.width) * viewColumns);
    const y = Math.floor(((clientY - r.top) / r.height) * rows);
    return x < 0 || y < 0 || x >= map.columns || y >= rows ? null : { x, y };
  };
  const anchorFor = (clientX: number, clientY: number) => {
    const d = drag.current;
    const at = cellAt(clientX, clientY);
    if (!d || !at) return null;
    const x = at.x - d.grabX;
    const y = at.y - d.grabY;
    return x < 0 || y < 0 || x >= map.columns ? null : y * map.columns + x;
  };
  // drag and drop (1.16): pointer events, so mouse, pen and touch all work
  const startDrag = (p: Placed, e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    const at = cellAt(e.clientX, e.clientY);
    if (!at) return;
    drag.current = { key: p.key, grabX: at.x - p.core.x, grabY: at.y - p.core.y, x: e.clientX, y: e.clientY, moved: false };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };
  const moveDrag = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return;
    if (!d.moved) {
      d.moved = true;
      setNote(null);
      setSelected(d.key);
    }
    setHoverCell(anchorFor(e.clientX, e.clientY));
  };
  const endDrag = (e: ReactPointerEvent) => {
    const d = drag.current;
    const anchor = anchorFor(e.clientX, e.clientY);
    drag.current = null;
    if (!d?.moved) return;
    dragged.current = true;
    setHoverCell(null);
    if (anchor !== null) clickTile(anchor);
    else setNote('Dropped outside your site: nothing moved.');
    setSelected(null); // a drop always ends the move, whether or not it was allowed
  };
  const clickTile = (c: number) => {
    if (!sel) return;
    if (!targets.has(c)) {
      const cells = cellsAt(c, sel.size, map.columns);
      const zone = zoneFor(sel.type);
      setNote(
        cells && zone && !zoneAllows(sel.type, cells, map.columns)
          ? `${nameOf(sel)} must stand on the ${ZONES[zone].name.toLowerCase()}.`
          : 'It does not fit there: pick free tiles inside your site.',
      );
      return;
    }
    if (moveOnMap(sel.key, c)) {
      setNote(`Moved ${nameOf(sel)}.`);
      setSelected(null);
    }
  };

  const legend: (Terrain | 'sea')[] = ['plain', 'plateau', 'ridge', 'river', 'coast', 'coalfield', 'outcrop', 'oilfield', 'sea'];

  return (
    <section aria-label="Site map" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Your site ({used}/{map.capacity} tiles)
        </h2>
        <span className="text-xs text-slate-400">One tile per unit of room. Drag a machine to move it (or click it, then a tile).</span>
      </div>
      <div className="min-h-10 text-sm text-sky-200" aria-live="polite" data-testid="map-info">
        {sel ? (
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Moving <strong>{nameOf(sel)}</strong>:{' '}
              {ghost && hoverCell !== null
                ? ghostOk
                  ? `place here${ghostBonus > 0 ? ` (${pctBonus(ghostBonus)})` : ''}`
                  : 'cannot go here'
                : 'pick a tile. Bright tiles give a bonus.'}
            </span>
            {sel.kind === 'generator' && (
              <button type="button" className="rounded bg-slate-700 px-2 py-0.5 text-xs hover:bg-slate-600" onClick={() => onSelect(sel.id)}>
                Find in list
              </button>
            )}
            <button type="button" className="rounded bg-slate-700 px-2 py-0.5 text-xs hover:bg-slate-600" onClick={() => setSelected(null)}>
              Cancel
            </button>
          </div>
        ) : hovered ? (
          info(hovered)
        ) : hoverCell !== null ? (
          tileInfo(hoverCell)
        ) : (
          note ?? 'Hover over a tile or machine to see it.'
        )}
      </div>
      <div className="w-full max-w-5xl overflow-x-auto rounded-lg border border-slate-700">
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${viewColumns}, minmax(20px, 1fr))`, minWidth: viewColumns * 20 }}
          data-testid="site-map"
          ref={gridRef}
          onMouseLeave={() => !drag.current && setHoverCell(null)}
        >
          {Array.from({ length: rows * viewColumns }, (_, i) => {
            const x = i % viewColumns;
            const y = Math.floor(i / viewColumns);
            if (x >= map.columns) {
              const sd = detailAt(x, y);
              return (
                <div key={i} className="relative aspect-square w-full" data-terrain="sea">
                  <img src={sprites.tile_sea} alt="" className="pixelated absolute inset-0 h-full w-full" />
                  {sd && <img src={sprites[detailSprite(sd)]} alt="" className="pixelated absolute inset-0 h-full w-full" data-detail={sd} />}
                </div>
              );
            }
            const c = y * map.columns + x;
            const t = terrainAt(x, y);
            const d = detailAt(x, y);
            const locked = c >= map.capacity;
            const target = sel && targets.has(c);
            const best = target && sel!.kind === 'generator' && zoneBonusFor(sel!.type, cellsAt(c, sel!.size, map.columns) ?? [], map.columns) > 0;
            return (
              <div
                key={i}
                className="relative aspect-square w-full"
                data-terrain={t}
                data-locked={locked || undefined}
                onMouseEnter={() => setHoverCell(c)}
                onClick={() => clickTile(c)}
              >
                <img src={sprites[TERRAIN_SPRITE[t]]} alt="" className="pixelated absolute inset-0 h-full w-full" />
                {d && <img src={sprites[detailSprite(d)]} alt="" className="pixelated absolute inset-0 h-full w-full" data-detail={d} />}
                {locked && <div className="absolute inset-0 bg-slate-950/55" />}
                {target && <div className={`absolute inset-0 ${best ? 'bg-emerald-300/45' : 'bg-emerald-200/15'}`} data-testid={best ? 'best-spot' : undefined} />}
              </div>
            );
          })}
          {map.capacity > 0 && (
            // fence line around the site
            <div
              aria-hidden="true"
              className="pointer-events-none absolute border-2 border-dashed border-amber-200/50"
              style={pct(0, 0, map.columns, siteRows)}
            />
          )}
          {map.placed.map((p) => {
            const lit = hover === p.key || selected === p.key;
            return (
              <div key={p.key} onMouseEnter={() => setHover(p.key)} onMouseLeave={() => setHover((k) => (k === p.key ? null : k))}>
                {/* one tile at a time: a machine never covers tiles that are not its own (playtest 15 bug) */}
                {p.cells.map((c) => (
                  <div
                    key={c}
                    aria-hidden="true"
                    onClick={() => (sel && sel.key !== p.key ? clickTile(c) : pick(p))}
                    className={`absolute cursor-pointer border ${
                      selected === p.key
                        ? 'z-10 border-sky-300 bg-sky-300/30'
                        : lit
                          ? 'z-10 border-yellow-300/80 bg-yellow-300/25'
                          : p.misplaced
                            ? 'border-red-400/80 bg-red-900/30'
                            : 'border-slate-900/40 bg-slate-900/30'
                    }`}
                    style={pct(c % map.columns, Math.floor(c / map.columns), 1, 1)}
                  />
                ))}
                <button
                  type="button"
                  onFocus={() => setHover(p.key)}
                  onClick={() => pick(p)}
                  onPointerDown={(e) => startDrag(p, e)}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={() => {
                    drag.current = null;
                  }}
                  draggable={false}
                  style={{ ...pct(p.core.x, p.core.y, p.core.w, p.core.h), touchAction: 'none' }}
                  aria-label={info(p)}
                  aria-pressed={selected === p.key}
                  data-testid={`map-${p.key}`}
                  className="group absolute z-10 flex cursor-grab items-center justify-center hover:z-30 focus-visible:z-30 active:cursor-grabbing"
                >
                  <img src={sprites[spriteOf(p)]} alt="" className="pixelated pointer-events-none max-h-full max-w-full object-contain p-0.5" />
                  {p.zoneBonus > 0 && (
                    <FloatingTip
                      className="absolute right-0 top-0 text-[10px] leading-none"
                      testId={`star-${p.key}`}
                      focusable={false}
                      text={zoneTipText(p.type, p.zoneBonus)}
                    >
                      ⭐
                    </FloatingTip>
                  )}
                </button>
              </div>
            );
          })}
          {ghost &&
            ghost.map((c) => (
              <div
                key={`ghost-${c}`}
                aria-hidden="true"
                className={`pointer-events-none absolute z-20 border-2 ${ghostOk ? 'border-emerald-300 bg-emerald-300/30' : 'border-red-400 bg-red-500/30'}`}
                style={pct(c % map.columns, Math.floor(c / map.columns), 1, 1)}
              />
            ))}
        </div>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300" aria-label="Map legend" data-testid="map-legend">
        {legend.map((t) => (
          <li key={t} className="flex items-center gap-1">
            <img src={sprites[t === 'sea' ? 'tile_sea' : TERRAIN_SPRITE[t]]} alt="" width={14} height={14} className="pixelated" />
            {t === 'sea' ? 'Sea' : TERRAIN_NAME(t)}
            {t !== 'sea' && t !== 'plain' && (
              <span className="text-slate-400">
                ({ZONES[t].required ? `${zoneSuits(t)} only` : `${pctBonus(ZONES[t].bonus)} ${zoneSuits(t)}`})
              </span>
            )}
          </li>
        ))}
        <li className="text-slate-400">⭐ = standing on its bonus zone</li>
      </ul>
      {next && (
        <p className="text-xs text-slate-400">
          Fenced land (dimmed): the next room expansion adds {next.capacity} tiles (Generators tab → Room).
        </p>
      )}
    </section>
  );
}
