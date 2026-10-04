import { useEffect, type CSSProperties } from 'react';
import { EVENTS_BY_ID } from '../data/events';
import { MAP_COLUMNS } from '../data/map';
import { useStore } from '../store';
import { platform } from '../platform';
import { sprites } from '../assets';
import Frames from './Frames';

/** How often to roll map events while the Map tab is open (rolls use the real time passed, not this count). */
export const MAP_EVENT_CHECK_MS = 5000;

/** The flock: [left %, top %, wing-beat delay] per gull, the leader at the front. */
const FLOCK: [number, number, string][] = [
  [66, 25, '0s'],
  [33, 0, '-0.15s'],
  [0, 50, '-0.3s'],
];

/**
 * Map events (1.12, playtest 15): they roll only while this layer is on
 * screen (the Map tab is open and the page visible), and play on the map at
 * their target. A fire can be clicked to put it out.
 */
export default function MapEventLayer({
  viewColumns,
  rows,
  pct,
}: {
  viewColumns: number;
  rows: number;
  pct: (x: number, y: number, w: number, h: number) => CSSProperties;
}) {
  const ev = useStore((s) => s.mapEvent);
  const roll = useStore((s) => s.rollMapEvents);
  const claim = useStore((s) => s.claimMapEvent);
  const end = useStore((s) => s.endMapEvent);
  const reduceMotion = useStore((s) => s.settings.reduceMotion);

  useEffect(() => {
    let last = Date.now();
    const t = setInterval(() => {
      const now = Date.now();
      if (!platform.isBackground()) roll((now - last) / 1000, Math.random, now);
      last = now;
    }, MAP_EVENT_CHECK_MS);
    return () => clearInterval(t);
  }, [roll]);

  useEffect(() => {
    if (!ev) return;
    const ms = EVENTS_BY_ID[ev.id]?.map?.durationMs ?? 8000;
    const t = setTimeout(() => end(), Math.max(0, ev.at + ms - Date.now()));
    return () => clearTimeout(t);
  }, [ev, end]);

  if (!ev) return null;
  const m = EVENTS_BY_ID[ev.id]?.map;
  if (!m) return null;
  const anim = reduceMotion ? '' : `map-${m.animation}`;
  const at = (c: number) => ({ x: c % MAP_COLUMNS, y: Math.floor(c / MAP_COLUMNS) });
  const box = (cells: number[]) => {
    const pts = cells.map(at);
    const x = Math.min(...pts.map((p) => p.x));
    const y = Math.min(...pts.map((p) => p.y));
    return { x, y, w: Math.max(...pts.map((p) => p.x)) - x + 1, h: Math.max(...pts.map((p) => p.y)) - y + 1 };
  };
  const name = EVENTS_BY_ID[ev.id].name;
  /** Width as a share of the map, in tiles. */
  const wide = (tiles: number) => `${(tiles / viewColumns) * 100}%`;

  switch (m.animation) {
    case 'flock':
      // three gulls in a V, the leader in front (playtest 19.2: one big bird each, so they read as birds)
      return (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute z-30 ${anim}`}
          style={{ top: `${(0.5 / rows) * 100}%`, left: reduceMotion ? '40%' : undefined, width: wide(3), height: `${(2 / rows) * 100}%` }}
          data-testid="map-event"
          data-sprite="map_bird"
        >
          {FLOCK.map(([x, y, delay], i) => (
            <span key={i} className="absolute" style={{ left: `${x}%`, top: `${y}%`, width: '34%', height: '50%' }}>
              <Frames a="map_bird_1" b="map_bird_2" still={reduceMotion} period="0.45s" delay={delay} />
            </span>
          ))}
        </div>
      );
    case 'flood':
      return (
        <>
          {ev.cells.map((c) => (
            <div key={c} aria-hidden="true" className={`pointer-events-none absolute z-20 bg-sky-300/50 ${anim}`} style={pct(at(c).x, at(c).y, 1, 1)} data-testid="map-event">
              <img src={sprites.map_wave} alt="" className="pixelated h-full w-full" />
            </div>
          ))}
        </>
      );
    case 'star':
      return (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute z-30 ${anim}`}
          style={pct(MAP_COLUMNS, 1 + Math.floor((ev.at / 1000) % 4), viewColumns - MAP_COLUMNS, 2)}
          data-testid="map-event"
          data-sprite="map_star"
        >
          <img src={sprites.map_star} alt="" className="pixelated h-full w-full object-contain" />
        </div>
      );
    case 'truck': {
      const b = box(ev.cells);
      // drives in from the left edge and stops left of the producer, facing it
      const stop = Math.max(0, b.x - 2);
      return (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute z-30 ${anim}`}
          style={{
            top: `${((b.y + b.h - 1) / rows) * 100}%`,
            left: reduceMotion ? wide(stop) : undefined,
            width: wide(2),
            height: `${(1 / rows) * 100}%`,
            ['--to' as string]: wide(stop),
          }}
          data-testid="map-event"
          data-sprite="map_truck"
        >
          <img src={sprites.map_truck} alt="" className={`pixelated h-full w-full ${reduceMotion ? '' : 'map-bounce'}`} />
        </div>
      );
    }
    case 'bolt':
    case 'fire': {
      const b = box(ev.cells);
      const clickable = m.animation === 'fire' && ev.claimUntil !== undefined;
      const art =
        m.animation === 'fire' ? (
          <span className="block aspect-square h-3/4 max-h-full">
            <Frames a="map_fire_1" b="map_fire_2" still={reduceMotion} period="0.3s" />
          </span>
        ) : (
          <img src={sprites.map_bolt} alt="" className="pixelated h-full max-h-full" />
        );
      return clickable ? (
        <button
          type="button"
          onClick={() => claim()}
          className={`tap-exempt absolute z-40 flex items-center justify-center rounded border-2 border-orange-400 bg-orange-500/20 ${anim}`}
          style={pct(b.x, b.y, b.w, b.h)}
          aria-label={`${name}: click to put it out`}
          title="Click to put it out!"
          data-testid="map-event"
          data-sprite="map_fire"
        >
          {art}
        </button>
      ) : (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute z-30 flex items-center justify-center ${anim}`}
          style={pct(b.x, b.y, b.w, b.h)}
          data-testid="map-event"
          data-sprite={`map_${m.animation}`}
        >
          {art}
        </div>
      );
    }
  }
}
