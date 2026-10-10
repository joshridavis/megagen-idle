import { useEffect, type CSSProperties } from 'react';
import { EVENTS_BY_ID } from '../data/events';
import { MAP_COLUMNS } from '../data/map';
import { useStore } from '../store';
import { platform } from '../platform';
import { sprites } from '../assets';
import Frames from './Frames';

/** How often to roll map events while the Map tab is open (rolls use the real time passed, not this count). */
export const MAP_EVENT_CHECK_MS = 5000;

/**
 * Shadows of things in the air on the map (2.02): their own layer, well below
 * them on the ground, so they read as flying. In map tiles, plus size and look.
 */
export const MAP_AIR_SHADOW = { down: 1.25, right: 0.3, scale: 0.8, blur: 1, opacity: 0.38 };
const airShadowStyle: CSSProperties = { filter: `brightness(0) blur(${MAP_AIR_SHADOW.blur}px)`, opacity: MAP_AIR_SHADOW.opacity };

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
    case 'flock': {
      // three gulls in a V, the leader in front (playtest 19.2: one big bird each, so they read as birds);
      // a random height, direction and slope each time (1.67), mirrored so they always fly forwards
      const dir = ev.pos?.dir ?? 1;
      const room = Math.max(0, rows - 2.5);
      const top = ev.pos?.y === undefined ? 0.5 : ev.pos.y * room;
      const end = Math.min(room, Math.max(0, top + (ev.pos?.slope ?? 0)));
      const row = (r: number) => `${(r / rows) * 100}%`;
      return (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute z-30 ${anim}`}
          style={{
            top: row(top),
            left: reduceMotion ? '40%' : undefined,
            width: wide(3),
            height: row(2),
            transform: dir < 0 ? 'scaleX(-1)' : undefined,
            ['--from' as string]: dir < 0 ? '105%' : '-10%',
            ['--to' as string]: dir < 0 ? '-10%' : '105%',
            ['--top-from' as string]: row(top),
            ['--top-to' as string]: row(end),
          }}
          data-testid="map-event"
          data-sprite="map_bird"
          data-dir={dir}
        >
          {/* the shadows first, so they sit under every gull; they flap with them (2.02).
              The box is 3 tiles wide and 2 tall; the flock is mirrored to fly left, so the
              shadow's sideways offset is mirrored back to keep it on the right. */}
          {FLOCK.map(([x, y, delay], i) => (
            <span
              key={`s${i}`}
              className="absolute"
              style={{
                left: `${x + ((dir < 0 ? -1 : 1) * MAP_AIR_SHADOW.right * 100) / 3 + (34 * (1 - MAP_AIR_SHADOW.scale)) / 2}%`,
                top: `${y + (MAP_AIR_SHADOW.down * 100) / 2 + (50 * (1 - MAP_AIR_SHADOW.scale)) / 2}%`,
                width: `${34 * MAP_AIR_SHADOW.scale}%`,
                height: `${50 * MAP_AIR_SHADOW.scale}%`,
                ...airShadowStyle,
              }}
              data-testid="map-air-shadow"
            >
              <Frames a="map_bird_1" b="map_bird_2" still={reduceMotion} period="0.45s" delay={delay} />
            </span>
          ))}
          {FLOCK.map(([x, y, delay], i) => (
            <span key={i} className="absolute" style={{ left: `${x}%`, top: `${y}%`, width: '34%', height: '50%' }} data-testid="map-bird">
              <Frames a="map_bird_1" b="map_bird_2" still={reduceMotion} period="0.45s" delay={delay} />
            </span>
          ))}
        </div>
      );
    }
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
    case 'star': {
      // anywhere over the height of the sea (1.67); events from before it use the old top rows
      const top = ev.pos?.y === undefined ? 1 + Math.floor((ev.at / 1000) % 4) : ev.pos.y * Math.max(0, rows - 2);
      return (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute z-30 ${anim}`}
          style={pct(MAP_COLUMNS, top, viewColumns - MAP_COLUMNS, 2)}
          data-testid="map-event"
          data-sprite="map_star"
        >
          {/* its shadow on the sea, well below it (2.02); the box is 2 tiles tall */}
          <img
            src={sprites.map_star}
            alt=""
            className="pixelated absolute h-full w-full object-contain"
            style={{ top: `${(MAP_AIR_SHADOW.down * 100) / 2}%`, left: `${(MAP_AIR_SHADOW.right * 100) / Math.max(1, viewColumns - MAP_COLUMNS)}%`, transform: `scale(${MAP_AIR_SHADOW.scale})`, ...airShadowStyle }}
            data-testid="map-air-shadow"
          />
          <img src={sprites.map_star} alt="" className="pixelated relative h-full w-full object-contain" />
        </div>
      );
    }
    case 'truck': {
      const b = box(ev.cells);
      // drives in from a random side (1.67; the left edge before it) and stops on that side of the producer, facing it
      const dir = ev.pos?.dir ?? 1;
      const stop = dir > 0 ? Math.max(0, b.x - 2) : Math.min(viewColumns - 2, b.x + b.w);
      return (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute z-30 ${anim}`}
          style={{
            top: `${((b.y + b.h - 1) / rows) * 100}%`,
            left: reduceMotion ? wide(stop) : undefined,
            width: wide(2),
            height: `${(1 / rows) * 100}%`,
            transform: dir < 0 ? 'scaleX(-1)' : undefined,
            ['--from' as string]: dir < 0 ? wide(viewColumns - 2) : '0%',
            ['--to' as string]: wide(stop),
          }}
          data-testid="map-event"
          data-sprite="map_truck"
          data-dir={dir}
          data-stop={stop}
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
