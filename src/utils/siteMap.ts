import { GENERATORS } from '../data/generators';
import { MAP_COLUMNS } from '../data/map';
import { PRODUCER_IDS, PRODUCERS } from '../data/producers';
import type { ProducerId } from '../types/resource';
import type { GameState } from '../types/state';
import { getGrantedProducers } from './researchSystem';

/** One machine on the map: the tiles it covers (cell indexes, row-major). */
export interface Placed {
  key: string;
  kind: 'generator' | 'producer';
  /** Generator id, or producer id. */
  id: string;
  type: string;
  cells: number[];
  /** The rectangle its picture is drawn in (inside its own tiles): x, y, w, h in tiles. */
  core: { x: number; y: number; w: number; h: number };
}

export interface SiteMap {
  columns: number;
  /** Usable tiles (= room capacity). */
  capacity: number;
  placed: Placed[];
}

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
export function footprint(size: number): [number, number][] {
  const w = shapeWidth(size);
  return Array.from({ length: size }, (_, i) => [i % w, Math.floor(i / w)] as [number, number]);
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
 * Places every machine that takes room on the site, biggest first (a stable
 * order within a size). First fit, scanning row by row;
 * if no block fits (a fragmented, nearly full site) the machine takes the first
 * free single tiles, so a valid layout always exists. Pure (1.04).
 */
export function layoutSite(s: Pick<GameState, 'activeGenerators' | 'producers' | 'completedResearch' | 'roomCapacity'>): SiteMap {
  const columns = MAP_COLUMNS;
  const capacity = s.roomCapacity;
  const taken = new Set<number>();
  const placed: Placed[] = [];
  const free = (c: number) => c < capacity && !taken.has(c);

  const place = (key: string, kind: Placed['kind'], id: string, type: string, size: number) => {
    const shape = footprint(size);
    for (let start = 0; start < capacity; start++) {
      const x0 = start % columns;
      const y0 = Math.floor(start / columns);
      const cells = shape.map(([dx, dy]) => (x0 + dx < columns ? (y0 + dy) * columns + x0 + dx : -1));
      if (cells.every((c) => c >= 0 && free(c))) {
        cells.forEach((c) => taken.add(c));
        placed.push({ key, kind, id, type, cells, core: coreOf(cells, columns, size) });
        return;
      }
    }
    // fragmented: any free tiles (drawn tile by tile, picture on the first)
    const cells: number[] = [];
    for (let c = 0; c < capacity && cells.length < size; c++) if (free(c)) cells.push(c);
    cells.forEach((c) => taken.add(c));
    placed.push({ key, kind, id, type, cells, core: coreOf(cells, columns, size) });
  };

  type Item = { key: string; kind: Placed['kind']; id: string; type: string; size: number; order: number };
  const items: Item[] = s.activeGenerators.map((g, order) => ({ key: g.id, kind: 'generator', id: g.id, type: g.type, size: GENERATORS[g.type].roomCost, order }));
  const granted = getGrantedProducers(s.completedResearch);
  for (const pid of PRODUCER_IDS) {
    const count = Math.max(0, (s.producers[pid] ?? 0) - (granted[pid as ProducerId] ?? 0));
    for (let i = 0; i < count; i++) {
      items.push({ key: `${pid}-${i + 1}`, kind: 'producer', id: pid, type: pid, size: PRODUCERS[pid].roomCost, order: items.length });
    }
  }
  // biggest first (playtest 15 bug: small ones placed first left gaps too
  // scattered for a late big plant); ties keep a stable order
  items.sort((a, b) => b.size - a.size || a.order - b.order);
  for (const it of items) place(it.key, it.kind, it.id, it.type, it.size);
  return { columns, capacity, placed };
}
