import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { sprites, type SpriteId } from '../assets';
import { GENERATORS } from '../data/generators';
import { EXCLUSION_START_ROW, LOCKED_PREVIEW_ROWS, MIN_MAP_ROWS, SEA_COLUMNS, ZONES, type Detail, type Terrain, type Zone } from '../data/map';
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
import MapEventLayer from './MapEventLayer';
import { zoneTipText } from './zoneTip';
import MapFloatingPanel from './MapFloatingPanel';
import MachineTip from './MachineTip';
import { machineTip } from '../utils/mapTips';
import MapLegend, { ZONE_SPRITE } from './MapLegend';
import MapDecorations, { type DecorTool } from './MapDecorations';
import { DECORATIONS_BY_ID, type DecorationId } from '../data/decorations';
import { machineTiles, placeBlock } from '../utils/decorations';
import MachineSprite from './MachineSprite';
import { animationOffset, isMachineWorking, machineAnimation } from '../utils/machineAnimation';

const TERRAIN_SPRITE: Record<Terrain, SpriteId> = { plain: 'tile_ground', ...ZONE_SPRITE };
const KEY_STEPS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
const detailSprite = (d: Detail) => `deco_${d}` as SpriteId;
const pctBonus = (b: number) => `+${Math.round(b * 100)}%`;

/**
 * Site map (1.04; terrain, zones and moving in 1.05, playtest 14 and 15).
 * The site is drawn inside a larger landscape: a winding river, sunny
 * plateaus, windy ridges and the coast, with fenced land around it. Select a
 * machine, then a tile, to move it there.
 */
const FLOAT_BUTTON =
  'flex min-h-11 items-center gap-1 rounded-full border-2 border-sky-400 bg-sky-800 px-4 text-sm font-semibold shadow-lg shadow-black/50 hover:bg-sky-700 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-300';

export default function MapPanel({ onSelect }: { onSelect: (generatorId: string) => void }) {
  const state = useStore((s) => s);
  const moveOnMap = useStore((s) => s.moveOnMap);
  const placeDecoration = useStore((s) => s.placeDecoration);
  const removeDecoration = useStore((s) => s.removeDecoration);
  const reduceMotion = useStore((s) => s.settings.reduceMotion);
  // Working machines move (1.71) unless the in-game or the system Reduce motion is on.
  const systemReduce = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  // the map's own toggle (1.84) turns them off too; Reduce motion always wins
  const mapAnimations = useStore((s) => s.settings.mapAnimations ?? true);
  const setMapAnimations = useStore((s) => s.setMapAnimations);
  const motionBlocked = reduceMotion || systemReduce;
  const machinesMove = mapAnimations && !motionBlocked;
  // and they stop while the page is hidden
  const [pageHidden, setPageHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  useEffect(() => {
    const onVis = () => setPageHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);
  const researching = useStore((s) => s.currentResearch !== null);
  const fmt = useNumberFormat();
  const map = layoutSite(state);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hoverCell, setHoverCell] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  /** Decorating (1.13): which decoration a tile click places, or 'remove'. */
  const [decorTool, setDecorToolState] = useState<DecorTool>(null);
  /** The decorations panel over the map (1.47); closing it ends decorating. */
  /** The panel open over the map (1.47, 1.65): decorations or the legend, one at a time. */
  const [panel, setPanel] = useState<'decor' | 'legend' | null>(null);
  const decorButton = useRef<HTMLButtonElement>(null);
  const legendButton = useRef<HTMLButtonElement>(null);
  /** The zone a legend row points at (1.39): its tiles light up. */
  const [legendZone, setLegendZone] = useState<Zone | null>(null);
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
  // the tooltip beside a machine (1.63): the hovered one, or the selected one until a target tile is pointed at
  const machineEls = useRef(new Map<string, HTMLElement>());
  const [starTip, setStarTip] = useState(false);
  const tipKey = hover ?? (sel && hoverCell === null ? sel.key : null);
  const tipPlaced = tipKey && !ghost && !starTip ? map.placed.find((p) => p.key === tipKey) : undefined;

  const setDecorTool = (t: DecorTool) => {
    setDecorToolState(t);
    setSelected(null);
    setNote(null);
  };
  /** Opens one panel; the other closes (1.65). Leaving decorations ends decorating. */
  const openPanel = (which: 'decor' | 'legend') => {
    setSelected(null);
    if (which !== 'decor') setDecorToolState(null);
    setLegendZone(null);
    setPanel(which);
  };
  const closePanel = () => {
    const was = panel;
    setPanel(null);
    setDecorToolState(null);
    setLegendZone(null);
    setNote(null);
    // the floating buttons mount again once the panel is gone
    requestAnimationFrame(() => (was === 'legend' ? legendButton : decorButton).current?.focus());
  };
  // Escape closes the open panel from anywhere on the page (a machine being moved is cancelled first).
  const closeDecorRef = useRef(closePanel);
  closeDecorRef.current = closePanel;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (selectedRef.current) setSelected(null);
      else closeDecorRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [panel]);
  const covered = useMemo(() => machineTiles(map), [map]);
  /** A tile click while decorating (1.13): place or remove. */
  const decorate = (c: number) => {
    if (decorTool === 'remove') {
      setNote(removeDecoration(c) ? 'Decoration removed: place it again any time for free.' : 'No decoration there.');
      return;
    }
    if (!decorTool) return;
    const why = placeBlock(state, decorTool, c, map);
    setNote(why ?? `${DECORATIONS_BY_ID[decorTool].name} placed.`);
    if (!why) placeDecoration(decorTool, c);
  };
  const pick = (p: Placed) => {
    if (decorTool) {
      setNote('A machine stands there: decorations go on free tiles.');
      return;
    }
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
    if (e.button !== 0 || decorTool) return;
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
    if (decorTool) return decorate(c);
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

  /**
   * Keyboard moving (0.41): with a machine selected (Enter), the arrow keys
   * move its outline one tile at a time, Enter places it and Escape cancels.
   */
  const onMachineKey = (p: Placed, e: ReactKeyboardEvent) => {
    if (selected !== p.key) return;
    const step = KEY_STEPS[e.key];
    if (step) {
      e.preventDefault();
      setHoverCell((h) => {
        const from = h ?? p.core.y * map.columns + p.core.x;
        const x = Math.min(Math.max(0, (from % map.columns) + step[0]), map.columns - p.core.w);
        const y = Math.min(Math.max(0, Math.floor(from / map.columns) + step[1]), Math.max(0, siteRows - p.core.h));
        return y * map.columns + x;
      });
    } else if (e.key === 'Enter' && hoverCell !== null) {
      e.preventDefault();
      clickTile(hoverCell);
      setHoverCell(null);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSelected(null);
      setHoverCell(null);
    }
  };

  // Stable handlers (0.42): the memoized tiles and machines below take these, so a game
  // tick (new energy, same map) does not re-render the whole grid. They call the latest
  // closures through a ref.
  const latest = useRef({ clickTile, pick, startDrag, moveDrag, endDrag, onMachineKey });
  latest.current = { clickTile, pick, startDrag, moveDrag, endDrag, onMachineKey };
  const handlers = useMemo<MapHandlers>(
    () => ({
      clickTile: (c) => latest.current.clickTile(c),
      pick: (p) => latest.current.pick(p),
      startDrag: (p, e) => latest.current.startDrag(p, e),
      moveDrag: (e) => latest.current.moveDrag(e),
      endDrag: (e) => latest.current.endDrag(e),
      onMachineKey: (p, e) => latest.current.onMachineKey(p, e),
      cancelDrag: () => {
        drag.current = null;
      },
      hoverCell: setHoverCell,
      hover: setHover,
      starTip: setStarTip,
      machineEl: (key, el) => {
        if (el) machineEls.current.set(key, el);
        else machineEls.current.delete(key);
      },
    }),
    [],
  );

  // zones with land inside the site, for the legend (1.39)
  const onSite = useMemo(() => {
    const out = new Set<Zone>();
    for (let c = 0; c < map.capacity; c++) {
      const t = terrainAt(c % map.columns, Math.floor(c / map.columns));
      if (t !== 'plain') out.add(t);
    }
    return out;
  }, [map.capacity, map.columns]);

  return (
    // while the decorations sheet covers the bottom of a phone screen, extra space below lets the map scroll above it
    <section aria-label="Site map" className={`flex flex-col gap-3 ${panel ? 'pb-[45vh] sm:pb-0' : 'pb-14'}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="panel-title">
          Your site ({used}/{map.capacity} tiles)
        </h2>
        <span className="text-xs text-slate-400">One tile per unit of room. Drag a machine to move it (or click it, then a tile).</span>
      </div>
      <div className="min-h-10 text-sm text-sky-200" aria-live="polite" data-testid="map-info">
        {decorTool ? (
          <div className="flex flex-wrap items-center gap-2">
            <span>
              {decorTool === 'remove' ? 'Removing decorations: click one on the map.' : `Placing ${DECORATIONS_BY_ID[decorTool].name}: click free tiles inside your site.`}
              {note && ` ${note}`}
            </span>
            <button type="button" className="rounded bg-slate-700 px-2 py-0.5 text-xs hover:bg-slate-600" onClick={() => setDecorTool(null)}>
              Done
            </button>
          </div>
        ) : sel ? (
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Moving <strong>{nameOf(sel)}</strong>:{' '}
              {ghost && hoverCell !== null
                ? ghostOk
                  ? `place here${ghostBonus > 0 ? ` (${pctBonus(ghostBonus)})` : ''}`
                  : 'cannot go here'
                : 'pick a tile (or use the arrow keys, then Enter). Bright tiles give a bonus.'}
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
          data-paused={pageHidden || undefined}
          ref={gridRef}
          onMouseLeave={() => !drag.current && setHoverCell(null)}
        >
          <MapTiles
            rows={rows}
            viewColumns={viewColumns}
            columns={map.columns}
            capacity={map.capacity}
            decorations={state.mapDecorations}
            covered={covered}
            reduceMotion={reduceMotion}
            legendZone={legendZone}
            sel={sel}
            targets={targets}
            h={handlers}
          />
          {map.capacity > 0 && (
            // fence line around the site
            <div
              aria-hidden="true"
              className="pointer-events-none absolute border-2 border-dashed border-amber-200/50"
              style={pct(0, 0, map.columns, siteRows)}
            />
          )}
          {map.placed.map((p) => (
            <MapMachine
              key={p.key}
              p={p}
              label={info(p)}
              sprite={spriteOf(p)}
              animate={machinesMove && isMachineWorking(p, state.activeGenerators)}
              lit={hover === p.key || selected === p.key}
              selected={selected === p.key}
              moving={sel !== null && sel.key !== p.key}
              columns={map.columns}
              viewColumns={viewColumns}
              rows={rows}
              h={handlers}
            />
          ))}
          <MapEventLayer viewColumns={viewColumns} rows={rows} pct={pct} />
          {tipPlaced && <MachineTip anchor={machineEls.current.get(tipPlaced.key) ?? null} tip={machineTip(state, tipPlaced, fmt)} />}
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
      {/* Decorations (1.64) and the legend (1.65): buttons floating at the bottom right of the screen, reachable
          however far the map is scrolled. On phones they sit above the research chip. A panel opens in the same
          corner, one at a time. */}
      {panel === 'decor' && <MapDecorations tool={decorTool} onTool={setDecorTool} onClose={closePanel} onNote={setNote} />}
      {panel === 'legend' && (
        <MapFloatingPanel id="legend-panel" title="🗺️ Legend" closeLabel="Close legend" closeTestId="legend-close" testId="legend-panel" wide onClose={closePanel}>
          <MapLegend onSite={onSite} highlight={legendZone} onHighlight={setLegendZone} />
          {next && (
            <p className="mt-2 text-xs text-slate-400" data-testid="dimmed-land">
              Dimmed land: the next room expansion adds {next.capacity} tiles (Generators tab → Room).
            </p>
          )}
          {siteRows < EXCLUSION_START_ROW && (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400" data-testid="exclusion-hint">
              <img src={sprites.tile_exclusion} alt="" width={14} height={14} className="pixelated" />
              Exclusion Zone (Fusion Reactors, Micro-Supernovas): further south, past {EXCLUSION_START_ROW * map.columns} tiles; room expansions 9 and 10 open it.
            </p>
          )}
        </MapFloatingPanel>
      )}
      {!panel && (
        <div className={`fixed right-4 z-[44] flex gap-2 sm:bottom-4 ${researching ? 'bottom-24' : 'bottom-4'}`}>
          <button
            ref={legendButton}
            type="button"
            aria-expanded={false}
            onClick={() => openPanel('legend')}
            data-testid="legend-open"
            className={FLOAT_BUTTON}
          >
            <span aria-hidden="true">🗺️</span> Legend
          </button>
          <button
            ref={decorButton}
            type="button"
            aria-expanded={false}
            onClick={() => openPanel('decor')}
            data-testid="decor-open"
            className={FLOAT_BUTTON}
          >
            <span aria-hidden="true">🎨</span> Decorations
          </button>
          <button
            type="button"
            aria-pressed={mapAnimations}
            aria-label="Machine animations"
            onClick={() => setMapAnimations(!mapAnimations)}
            data-testid="map-anim-toggle"
            title={
              motionBlocked
                ? 'Reduce motion is on (in Settings or on your device), so machines stay still.'
                : mapAnimations
                  ? 'Working machines move. Click to keep them still.'
                  : 'Machines stay still. Click to let working machines move.'
            }
            className={`${FLOAT_BUTTON} ${mapAnimations ? '' : 'opacity-80'}`}
          >
            <span aria-hidden="true">🎞️</span>
            <span className="hidden sm:inline">Animations:</span> {mapAnimations ? 'On' : 'Off'}
          </button>
        </div>
      )}
    </section>
  );
}

/** Map handlers that never change identity (0.42), so memoized tiles and machines skip game ticks. */
interface MapHandlers {
  clickTile: (c: number) => void;
  pick: (p: Placed) => void;
  startDrag: (p: Placed, e: ReactPointerEvent) => void;
  moveDrag: (e: ReactPointerEvent) => void;
  endDrag: (e: ReactPointerEvent) => void;
  onMachineKey: (p: Placed, e: ReactKeyboardEvent) => void;
  cancelDrag: () => void;
  hoverCell: (c: number | null) => void;
  hover: (update: (k: string | null) => string | null) => void;
  starTip: (open: boolean) => void;
  machineEl: (key: string, el: HTMLElement | null) => void;
}

/** Position of a block of tiles, as percentages of the map. */
const cellBox = (x: number, y: number, w: number, h: number, viewColumns: number, rows: number): CSSProperties => ({
  left: `${(x / viewColumns) * 100}%`,
  top: `${(y / rows) * 100}%`,
  width: `${(w / viewColumns) * 100}%`,
  height: `${(h / rows) * 100}%`,
});

/**
 * The ground: terrain, details, decorations and move targets. Memoized (0.42):
 * with a few thousand tiles it was most of the map's cost on every game tick.
 */
const MapTiles = memo(function MapTiles({
  rows,
  viewColumns,
  columns,
  capacity,
  decorations,
  covered,
  reduceMotion,
  legendZone,
  sel,
  targets,
  h,
}: {
  rows: number;
  viewColumns: number;
  columns: number;
  capacity: number;
  decorations: Record<number, DecorationId>;
  covered: Set<number>;
  reduceMotion: boolean;
  legendZone: Zone | null;
  sel: Placed | null;
  targets: Set<number>;
  h: MapHandlers;
}) {
  return (
    <>
      {Array.from({ length: rows * viewColumns }, (_, i) => {
        const x = i % viewColumns;
        const y = Math.floor(i / viewColumns);
        if (x >= columns) {
          const sd = detailAt(x, y);
          return (
            <div key={i} className="relative aspect-square w-full" data-terrain="sea">
              <img src={sprites.tile_sea} alt="" className="pixelated absolute inset-0 h-full w-full" />
              {sd && <img src={sprites[detailSprite(sd)]} alt="" className="pixelated absolute inset-0 h-full w-full" data-detail={sd} />}
            </div>
          );
        }
        const c = y * columns + x;
        const t = terrainAt(x, y);
        const d = detailAt(x, y);
        const locked = c >= capacity;
        // a decoration under a machine is hidden; it shows again if the machine moves (1.13)
        const decorAt = !locked && !covered.has(c) ? decorations[c] : undefined;
        const target = sel && targets.has(c);
        const best = target && sel!.kind === 'generator' && zoneBonusFor(sel!.type, cellsAt(c, sel!.size, columns) ?? [], columns) > 0;
        return (
          <div
            key={i}
            className="relative aspect-square w-full"
            data-terrain={t}
            data-locked={locked || undefined}
            onMouseEnter={() => h.hoverCell(c)}
            onClick={() => h.clickTile(c)}
          >
            <img src={sprites[TERRAIN_SPRITE[t]]} alt="" className="pixelated absolute inset-0 h-full w-full" />
            {d && <img src={sprites[detailSprite(d)]} alt="" className="pixelated absolute inset-0 h-full w-full" data-detail={d} />}
            {decorAt && (
              <img
                src={sprites[DECORATIONS_BY_ID[decorAt].sprite]}
                alt={DECORATIONS_BY_ID[decorAt].name}
                title={DECORATIONS_BY_ID[decorAt].name}
                className="pixelated absolute inset-0 h-full w-full"
                data-testid={`decor-${c}`}
              />
            )}
            {t === 'exclusion' && !locked && !reduceMotion && (
              // a soft shield glow (1.23); off with reduced motion
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 animate-pulse bg-fuchsia-400/10 motion-reduce:animate-none" />
            )}
            {locked && <div className="absolute inset-0 bg-slate-950/55" />}
            {legendZone === t && <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-amber-200/35" data-testid="legend-highlight" />}
            {target && <div className={`absolute inset-0 ${best ? 'bg-emerald-300/45' : 'bg-emerald-200/15'}`} data-testid={best ? 'best-spot' : undefined} />}
          </div>
        );
      })}
    </>
  );
});

/** One machine on the map: its tiles' outlines and its button. Memoized (0.42); only its own changes re-render it. */
const MapMachine = memo(function MapMachine({
  p,
  label,
  sprite,
  animate,
  lit,
  selected,
  moving,
  columns,
  viewColumns,
  rows,
  h,
}: {
  p: Placed;
  label: string;
  sprite: SpriteId;
  animate: boolean;
  lit: boolean;
  selected: boolean;
  /** Another machine is being moved: a click on this one's tiles is a target, not a pick. */
  moving: boolean;
  columns: number;
  viewColumns: number;
  rows: number;
  h: MapHandlers;
}) {
  const anim = machineAnimation(p);
  return (
    <div onMouseEnter={() => h.hover(() => p.key)} onMouseLeave={() => h.hover((k) => (k === p.key ? null : k))}>
      {/* one tile at a time: a machine never covers tiles that are not its own (playtest 15 bug) */}
      {p.cells.map((c) => (
        <div
          key={c}
          aria-hidden="true"
          onClick={() => (moving ? h.clickTile(c) : h.pick(p))}
          className={`absolute cursor-pointer border ${
            selected
              ? 'z-10 border-sky-300 bg-sky-300/30'
              : lit
                ? 'z-10 border-yellow-300/80 bg-yellow-300/25'
                : p.misplaced
                  ? 'border-red-400/80 bg-red-900/30'
                  : 'border-slate-900/40 bg-slate-900/30'
          }`}
          style={cellBox(c % columns, Math.floor(c / columns), 1, 1, viewColumns, rows)}
        />
      ))}
      <button
        type="button"
        ref={(el) => h.machineEl(p.key, el)}
        onFocus={() => h.hover(() => p.key)}
        onBlur={() => h.hover((k) => (k === p.key ? null : k))}
        onClick={() => h.pick(p)}
        onKeyDown={(e) => h.onMachineKey(p, e)}
        onPointerDown={(e) => h.startDrag(p, e)}
        onPointerMove={h.moveDrag}
        onPointerUp={h.endDrag}
        onPointerCancel={h.cancelDrag}
        draggable={false}
        style={{ ...cellBox(p.core.x, p.core.y, p.core.w, p.core.h, viewColumns, rows), touchAction: 'none' }}
        aria-label={label}
        aria-pressed={selected}
        data-testid={`map-${p.key}`}
        className="tap-exempt group absolute z-10 flex cursor-grab items-center justify-center hover:z-30 focus-visible:z-30 active:cursor-grabbing"
      >
        <MachineSprite sprite={sprite} anim={anim} animate={animate} offset={animationOffset(p.key, anim.period)} />
        {p.zoneBonus > 0 && (
          <FloatingTip
            className="absolute right-0 top-0 text-[10px] leading-none"
            testId={`star-${p.key}`}
            focusable={false}
            onOpenChange={h.starTip}
            text={zoneTipText(p.type, p.zoneBonus)}
          >
            ⭐
          </FloatingTip>
        )}
      </button>
    </div>
  );
});
