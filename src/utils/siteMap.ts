import { GENERATORS } from '../data/generators';
import { MAP_COLUMNS, ZONE_REQUIRED_SHARE, ZONES, type Terrain, type Zone } from '../data/map';
import { PRODUCER_IDS, PRODUCERS } from '../data/producers';
import type { ProducerId } from '../types/resource';
import type { ResourceId } from '../types/state';
import type { EffectMods } from './effectMods';
import type { GameState } from '../types/state';
import { terrainAt, zoneFor } from './mapTerrain';
import { getGrantedProducers } from './researchSystem';

/** One machine on the map: the tiles it covers (cell indexes, row-major). */
export interface Placed {
  key: string;
  kind: 'generator' | 'producer';
  /** Generator id, or producer id. */
  id: string;
  type: string;
  size: number;
  cells: number[];
  /** The rectangle its picture is drawn in (inside its own tiles): x, y, w, h in tiles. */
  core: { x: number; y: number; w: number; h: number };
  /** Energy bonus from where it stands (fraction), 0 if none (1.05). */
  zoneBonus: number;
  /** True if it needs a zone (hydro: river, tidal: coast) but no free spot there was found. */
  misplaced: boolean;
  /** True if the player put it here (it stays put when others are built). */
  pinned: boolean;
}

export interface SiteMap {
  columns: number;
  /** Usable tiles (= room capacity). */
  capacity: number;
  placed: Placed[];
}

export type SiteState = Pick<GameState, 'activeGenerators' | 'producers' | 'completedResearch' | 'roomCapacity'> & {
  /** Where the player moved machines: machine key -> top-left tile (1.05). */
  mapPins?: Record<string, number>;
};

/** Width of a machine's shape: an exact rectangle if one is no longer than 3:1, else as square as possible. */
export function shapeWidth(size: number): number {
  let best = size;
  for (let w = Math.ceil(Math.sqrt(size)); w <= size; w++) {
    if (size % w === 0) {
      best = w;
      break;
    }
  }
  return best / (size / best) <= 3 ? best : Math.max(1, Math.ceil(Math.sqrt(size)));
}

/**
 * Tile shape for a machine of `size` tiles, filled row by row: a rectangle
 * when possible (8 = 4x2, 12 = 4x3), otherwise nearly square (5 = 3 + 2).
 */
const footprints = new Map<number, [number, number][]>();
export function footprint(size: number): [number, number][] {
  let f = footprints.get(size);
  if (!f) {
    const w = shapeWidth(size);
    f = Array.from({ length: size }, (_, i) => [i % w, Math.floor(i / w)] as [number, number]);
    footprints.set(size, f);
  }
  return f;
}

/** The cells a machine of `size` covers with its top-left at `anchor`, or null if it runs off the right edge. */
export function cellsAt(anchor: number, size: number, columns = MAP_COLUMNS): number[] | null {
  const x0 = anchor % columns;
  const y0 = Math.floor(anchor / columns);
  const cells: number[] = [];
  for (const [dx, dy] of footprint(size)) {
    if (x0 + dx >= columns) return null;
    cells.push((y0 + dy) * columns + x0 + dx);
  }
  return cells;
}

const terrainCache: Terrain[] = [];
/** Terrain of a cell (looked up once, then remembered: layouts ask a lot). */
export const terrainOfCell = (c: number, columns = MAP_COLUMNS): Terrain => {
  if (columns !== MAP_COLUMNS) return terrainAt(c % columns, Math.floor(c / columns));
  return (terrainCache[c] ??= terrainAt(c % columns, Math.floor(c / columns)));
};

/** Share of `cells` on terrain `zone`. */
export function zoneShare(cells: number[], zone: Zone, columns = MAP_COLUMNS): number {
  return cells.length ? cells.filter((c) => terrainOfCell(c, columns) === zone).length / cells.length : 0;
}

/** Whether a machine of `type` may stand on `cells` (hydro needs the river, tidal the coast). */
export function zoneAllows(type: string, cells: number[], columns = MAP_COLUMNS): boolean {
  const zone = zoneFor(type);
  return !zone || !ZONES[zone].required || zoneShare(cells, zone, columns) >= ZONE_REQUIRED_SHARE;
}

/** Energy bonus for a machine of `type` on `cells`: its zone's bonus if it stands fully inside. */
export function zoneBonusFor(type: string, cells: number[], columns = MAP_COLUMNS): number {
  const zone = zoneFor(type);
  return zone && zoneShare(cells, zone, columns) === 1 ? ZONES[zone].bonus : 0;
}

/** The full-width rows of a shape: where its picture goes. */
function coreOf(cells: number[], columns: number, size: number): Placed['core'] {
  const xs = cells.map((c) => c % columns);
  const ys = cells.map((c) => Math.floor(c / columns));
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const w = shapeWidth(size);
  const fullRows = Math.max(1, Math.floor(size / w));
  // a block shape: its full rows; scattered tiles (fallback): its first tile
  const contiguous = cells.every((c) => c % columns < x + w && Math.floor(c / columns) <= y + Math.ceil(size / w) - 1);
  return contiguous ? { x, y, w, h: fullRows } : { x: cells[0] % columns, y: Math.floor(cells[0] / columns), w: 1, h: 1 };
}

/**
 * How good a spot is for a new machine (higher is better). Machines that need
 * a zone go on it; solar and wind go fully onto their bonus zone when a spot
 * is free (playtest 16); everything else keeps to plain land so the zones
 * stay free. Null if the machine may not stand there.
 */
function spotScore(type: string, cells: number[], columns: number): number | null {
  if (!zoneAllows(type, cells, columns)) return null;
  const zone = zoneFor(type);
  if (zone && ZONES[zone].required) return zoneShare(cells, zone, columns) * 10;
  // solar and wind: fully on their bonus zone when a spot is free (1.17)
  let score = zone && zoneShare(cells, zone, columns) === 1 ? ZONE_SEEK_SCORE : 0;
  for (const c of cells) {
    const t = terrainOfCell(c, columns);
    if (t === zone) continue;
    if (t === 'river' || t === 'coast') score -= 1;
    else if (t !== 'plain') score -= 0.2;
  }
  return score;
}

const ZONE_SEEK_SCORE = 5;
/** Highest spotScore possible for a type: fully on the zone it needs or likes, else all plain (0). */
function maxScore(type: string): number {
  const zone = zoneFor(type);
  return !zone ? 0 : ZONES[zone].required ? 10 : ZONE_SEEK_SCORE;
}

interface Item {
  key: string;
  kind: Placed['kind'];
  id: string;
  type: string;
  size: number;
  order: number;
}

/** Every machine that takes room, with a stable key: generator ids, producers as "quarry-1", "quarry-2", ... */
export function siteItems(s: SiteState): Item[] {
  const items: Item[] = s.activeGenerators.map((g, order) => ({ key: g.id, kind: 'generator', id: g.id, type: g.type, size: GENERATORS[g.type].roomCost, order }));
  const granted = getGrantedProducers(s.completedResearch);
  for (const pid of PRODUCER_IDS) {
    const count = Math.max(0, (s.producers[pid] ?? 0) - (granted[pid as ProducerId] ?? 0));
    for (let i = 0; i < count; i++) {
      items.push({ key: `${pid}-${i + 1}`, kind: 'producer', id: pid, type: pid, size: PRODUCERS[pid].roomCost, order: items.length });
    }
  }
  return items;
}

/**
 * Places every machine that takes room on the site. Pure (1.04, zones 1.05, pins 1.17).
 * 1. Pinned machines (every machine is pinned where it lands) stay put, if still valid.
 * 2. New hydro and tidal go to the river and coast. Other machines may stand
 *    there until a dam or tidal station needs the spot: only then are they
 *    moved, to the best free land (playtest 16: nothing else moves by itself).
 * 3. The rest, biggest first, go to the best free spot (see spotScore), the
 *    earliest on a tie.
 * 4. A machine with no block of free tiles takes any free tiles (a fragmented,
 *    nearly full site), so a layout always exists; one that needs a zone and
 *    finds no spot there is marked misplaced.
 */
function computeLayout(s: SiteState): SiteMap {
  const columns = MAP_COLUMNS;
  const capacity = s.roomCapacity;
  const pins = s.mapPins ?? {};
  // a flat array, not a Set: layouts run thousands of times in the simulator
  const taken = new Uint8Array(Math.max(0, capacity));
  const placed: Placed[] = [];
  const free = (c: number) => c >= 0 && c < capacity && taken[c] === 0;
  const add = (it: Item, cells: number[], pinned: boolean, misplaced = false) => {
    for (const c of cells) if (c >= 0 && c < capacity) taken[c] = 1;
    const zoneBonus = misplaced ? 0 : zoneBonusFor(it.type, cells, columns);
    placed.push({ key: it.key, kind: it.kind, id: it.id, type: it.type, size: it.size, cells, core: coreOf(cells, columns, it.size), zoneBonus, misplaced, pinned });
  };
  const needsZone = (it: Item) => {
    const z = zoneFor(it.type);
    return z && ZONES[z].required ? 1 : 0;
  };
  const reserved = (c: number) => {
    const t = terrainOfCell(c, columns);
    return t === 'river' || t === 'coast';
  };
  const pinCells = (it: Item) => {
    const anchor = pins[it.key];
    const cells = anchor === undefined ? null : cellsAt(anchor, it.size, columns);
    return cells && cells.every((c) => c < capacity) && zoneAllows(it.type, cells, columns) ? cells : null;
  };

  /** Places one machine at its best free spot; tiles in `soft` (machines that may give way) cost a little. */
  const placeAuto = (it: Item, soft: Set<number> = new Set()) => {
    let best: number[] | null = null;
    let bestScore = -Infinity;
    const shape = footprint(it.size);
    const fits = (anchor: number) => {
      const x0 = anchor % columns;
      for (const [dx, dy] of shape) {
        const c = anchor + dy * columns + dx;
        if (x0 + dx >= columns || c >= capacity || taken[c] === 1) return false;
      }
      return true;
    };
    for (let anchor = 0; anchor < capacity; anchor++) {
      if (taken[anchor] === 1 || !fits(anchor)) continue;
      const cells = cellsAt(anchor, it.size, columns)!;
      const base = spotScore(it.type, cells, columns);
      if (base === null) continue;
      const bumped = soft.size ? cells.filter((c) => soft.has(c)).length : 0;
      const score = base - bumped * 0.5;
      if (score > bestScore) {
        best = cells;
        bestScore = score;
        if (score >= maxScore(it.type)) break; // nothing can beat it: stop early
      }
    }
    if (best) return add(it, best, false);
    // no allowed block: any free block, else any free tiles
    let cells: number[] | null = null;
    for (let anchor = 0; anchor < capacity && !cells; anchor++) {
      const c = cellsAt(anchor, it.size, columns);
      if (c && c.every(free)) cells = c;
    }
    if (!cells) {
      cells = [];
      for (let c = 0; c < capacity && cells.length < it.size; c++) if (free(c)) cells.push(c);
    }
    add(it, cells, false, needsZone(it) === 1);
  };
  // zone-bound first, then biggest first (playtest 15 bug: small ones placed
  // first left gaps too scattered for a late big plant); ties keep a stable order
  const order = (a: Item, b: Item) => needsZone(b) - needsZone(a) || b.size - a.size || a.order - b.order;

  const rest: Item[] = [];
  const mayGiveWay: { it: Item; cells: number[] }[] = [];
  for (const it of siteItems(s)) {
    const cells = pinCells(it);
    if (!cells) rest.push(it);
    else if (!needsZone(it) && cells.some(reserved)) mayGiveWay.push({ it, cells });
    else if (cells.every(free)) add(it, cells, true);
    else rest.push(it);
  }
  const soft = new Set(mayGiveWay.flatMap((m) => m.cells));
  for (const it of rest.filter((x) => needsZone(x)).sort(order)) placeAuto(it, soft);
  const later = rest.filter((x) => !needsZone(x));
  for (const m of mayGiveWay) {
    if (m.cells.every(free)) add(m.it, m.cells, true);
    else later.push(m.it);
  }
  for (const it of later.sort(order)) placeAuto(it);
  return { columns, capacity, placed };
}

/** What the layout depends on, as text: machines (keys, types), room and pins. */
// the parts of a signature are cached by object: the simulator asks thousands of times
const pinsText = new WeakMap<object, string>();
let lastItems: { refs: unknown[]; text: string } | null = null;
function signature(s: SiteState): string {
  const refs = [s.activeGenerators, s.producers, s.completedResearch];
  if (!lastItems || !lastItems.refs.every((r, i) => r === refs[i])) {
    lastItems = { refs, text: siteItems(s).map((it) => `${it.key}:${it.type}`).join(',') };
  }
  let pins = '';
  if (s.mapPins) {
    pins = pinsText.get(s.mapPins) ?? JSON.stringify(s.mapPins);
    pinsText.set(s.mapPins, pins);
  }
  return `${s.roomCapacity}|${lastItems.text}|${pins}`;
}

const LAYOUT_CACHE_SIZE = 16;
const layouts = new Map<string, SiteMap>();
let last: { key: unknown[]; map: SiteMap } | null = null;

/** The site layout (see computeLayout). Cached: the simulator and the UI ask for the same layouts again and again. */
export function layoutSite(s: SiteState): SiteMap {
  const refs = [s.activeGenerators, s.producers, s.completedResearch, s.roomCapacity, s.mapPins];
  if (last && last.key.every((k, i) => k === refs[i])) return last.map;
  const sig = signature(s);
  let map = layouts.get(sig);
  if (!map) {
    map = computeLayout(s);
    if (layouts.size >= LAYOUT_CACHE_SIZE) layouts.delete(layouts.keys().next().value!);
    layouts.set(sig, map);
  }
  last = { key: refs, map };
  return map;
}

/**
 * Production bonus per resource from where its producers stand (1.18): the
 * zone bonus averaged over every producer of that resource, so 2 of 4 coal
 * mines on a coal field give coal +10%. Producers granted by research take no
 * room, are not on the map and count as 0.
 */
export function getProducerPlacement(s: SiteState, map: SiteMap = layoutSite(s)): Partial<Record<ResourceId, number>> {
  const sum: Partial<Record<ProducerId, number>> = {};
  for (const p of map.placed) if (p.kind === 'producer' && p.zoneBonus > 0) sum[p.id as ProducerId] = (sum[p.id as ProducerId] ?? 0) + p.zoneBonus;
  const out: Partial<Record<ResourceId, number>> = {};
  for (const [pid, total] of Object.entries(sum) as [ProducerId, number][]) {
    const owned = s.producers[pid] ?? 0;
    if (owned > 0) out[PRODUCERS[pid].resource] = (out[PRODUCERS[pid].resource] ?? 0) + total / owned;
  }
  return out;
}

/** Adds map placement to effect modifiers: generator bonuses by id, producer bonuses by resource (1.05, 1.18). */
export function withPlacementMods(mods: EffectMods, s: SiteState): EffectMods {
  const map = layoutSite(s);
  const resource = { ...mods.resource };
  for (const [id, b] of Object.entries(getProducerPlacement(s, map)) as [ResourceId, number][]) resource[id] = (resource[id] ?? 0) + b;
  return { ...mods, resource, placement: getPlacementBonuses(s, map) };
}

/** Energy bonus per generator id from where each stands (1.05). Empty if none. */
export function getPlacementBonuses(s: SiteState, map: SiteMap = layoutSite(s)): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of map.placed) if (p.kind === 'generator' && p.zoneBonus > 0) out[p.id] = p.zoneBonus;
  return out;
}

/**
 * True if one more generator of `type` would find an allowed spot. Only
 * zone-bound types can fail (hydro needs a free spot on the river, tidal on
 * the coast); everything else always fits once there is room.
 */
export function hasSpotFor(s: SiteState, type: string): boolean {
  const zone = zoneFor(type);
  if (!zone || !ZONES[zone].required) return true;
  const probe = { id: '__probe__', type, isActive: true, level: 1 } as GameState['activeGenerators'][number];
  const map = layoutSite({ ...s, activeGenerators: [...s.activeGenerators, probe] });
  return !map.placed.find((p) => p.key === probe.id)?.misplaced;
}

/**
 * Where a machine may be moved: every top-left tile at which it fits on free
 * tiles (or its own) and its zone rule holds. Zone-bound machines elsewhere
 * must keep a spot, so the move may not take the last one.
 */
export function moveTargets(map: SiteMap, key: string): Set<number> {
  const me = map.placed.find((p) => p.key === key);
  const out = new Set<number>();
  if (!me) return out;
  const takenByOthers = new Set<number>();
  for (const p of map.placed) if (p.key !== key) p.cells.forEach((c) => takenByOthers.add(c));
  for (let anchor = 0; anchor < map.capacity; anchor++) {
    const cells = cellsAt(anchor, me.size, map.columns);
    if (cells && cells.every((c) => c < map.capacity && !takenByOthers.has(c)) && zoneAllows(me.type, cells, map.columns)) out.add(anchor);
  }
  return out;
}

/**
 * Moves a machine to `anchor` (its new top-left tile). Every machine is then
 * pinned where it stands, so the layout stays as the player arranged it and
 * new machines fill free tiles. Returns null if the move is not allowed.
 */
export function moveOnMap(s: SiteState, key: string, anchor: number): Record<string, number> | null {
  const map = layoutSite(s);
  if (!moveTargets(map, key).has(anchor)) return null;
  const pins: Record<string, number> = {};
  for (const p of map.placed) if (!p.misplaced) pins[p.key] = anchorOf(p, map.columns);
  pins[key] = anchor;
  const after = computeLayout({ ...s, mapPins: pins });
  const moved = after.placed.find((p) => p.key === key);
  return moved && moved.pinned && !after.placed.some((p) => p.misplaced && !map.placed.find((q) => q.key === p.key)?.misplaced) ? pins : null;
}

/** Top-left tile of a placed machine's block. */
export function anchorOf(p: Placed, columns = MAP_COLUMNS): number {
  return p.core.y * columns + p.core.x;
}

/**
 * The saved positions after the layout settles: every machine pinned where it
 * stands (a block shape only), keys of machines that are gone dropped. Machines
 * on the map then never move by themselves (playtest 16). Returns the same
 * object when nothing changed.
 */
const pinCount = new WeakMap<object, number>();
export function settledPins(s: SiteState): Record<string, number> {
  const map = layoutSite(s);
  const old = s.mapPins ?? {};
  // fast path: every machine already stands where it is pinned, and no pin is stale
  let count = pinCount.get(old);
  if (count === undefined) pinCount.set(old, (count = Object.keys(old).length));
  if (count === map.placed.length && map.placed.every((p) => p.pinned)) return old;
  const next: Record<string, number> = {};
  for (const p of map.placed) {
    if (p.misplaced) continue;
    const anchor = anchorOf(p, map.columns);
    const block = cellsAt(anchor, p.size, map.columns);
    if (block && block.every((c, i) => c === p.cells[i])) next[p.key] = anchor;
  }
  const keys = Object.keys(next);
  const same = keys.length === Object.keys(old).length && keys.every((k) => old[k] === next[k]);
  if (same) return old;
  // every machine pinned where it stands: the layout with the new pins is this one
  if (keys.length === map.placed.length) {
    layouts.set(signature({ ...s, mapPins: next }), { ...map, placed: map.placed.map((p) => ({ ...p, pinned: true })) });
  }
  return next;
}

/**
 * The land the next room expansion opens, by terrain (1.06): tiles from the
 * current capacity up to the new one. Shown before buying it.
 */
export function expansionTerrain(capacity: number, added: number, columns = MAP_COLUMNS): Partial<Record<Terrain, number>> {
  const out: Partial<Record<Terrain, number>> = {};
  for (let c = capacity; c < capacity + added; c++) {
    const t = terrainOfCell(c, columns);
    out[t] = (out[t] ?? 0) + 1;
  }
  return out;
}
