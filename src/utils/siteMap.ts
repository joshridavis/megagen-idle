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
}

export interface SiteMap {
  columns: number;
  /** Usable tiles (= room capacity). */
  capacity: number;
  placed: Placed[];
}

/**
 * Tile shape for a machine of `size` tiles: as square as possible, filled
 * row by row, e.g. 5 tiles = a 3-wide block of 3 + 2.
 */
export function footprint(size: number): [number, number][] {
  const w = Math.max(1, Math.ceil(Math.sqrt(size)));
  return Array.from({ length: size }, (_, i) => [i % w, Math.floor(i / w)] as [number, number]);
}

/**
 * Places every machine that takes room on the site, in a stable order
 * (generators in your order, then producers). First fit, scanning row by row;
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
        placed.push({ key, kind, id, type, cells });
        return;
      }
    }
    // fragmented: any free tiles
    const cells: number[] = [];
    for (let c = 0; c < capacity && cells.length < size; c++) if (free(c)) cells.push(c);
    cells.forEach((c) => taken.add(c));
    placed.push({ key, kind, id, type, cells });
  };

  for (const g of s.activeGenerators) place(g.id, 'generator', g.id, g.type, GENERATORS[g.type].roomCost);
  const granted = getGrantedProducers(s.completedResearch);
  for (const pid of PRODUCER_IDS) {
    const count = Math.max(0, (s.producers[pid] ?? 0) - (granted[pid as ProducerId] ?? 0));
    for (let i = 0; i < count; i++) place(`${pid}-${i + 1}`, 'producer', pid, pid, PRODUCERS[pid].roomCost);
  }
  return { columns, capacity, placed };
}
