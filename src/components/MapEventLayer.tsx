import { useEffect, type CSSProperties } from 'react';
import { EVENTS_BY_ID } from '../data/events';
import { MAP_COLUMNS } from '../data/map';
import { useStore } from '../store';
import { platform } from '../platform';

/** How often to roll map events while the Map tab is open (rolls use the real time passed, not this count). */
export const MAP_EVENT_CHECK_MS = 5000;

const ICON = { flock: '🐦 🐦 🐦', bolt: '⚡', truck: '🚚', flood: '', fire: '🔥', star: '🌠' } as const;

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

  switch (m.animation) {
    case 'flock':
      return (
        <div aria-hidden="true" className={`pointer-events-none absolute z-30 whitespace-nowrap text-lg ${anim}`} style={{ top: `${(1 / rows) * 100}%`, left: reduceMotion ? '40%' : undefined }} data-testid="map-event">
          {ICON.flock}
        </div>
      );
    case 'flood':
      return (
        <>
          {ev.cells.map((c) => (
            <div key={c} aria-hidden="true" className={`pointer-events-none absolute z-20 bg-sky-300/50 ${anim}`} style={pct(at(c).x, at(c).y, 1, 1)} data-testid="map-event" />
          ))}
        </>
      );
    case 'star':
      return (
        <div aria-hidden="true" className={`pointer-events-none absolute z-30 flex items-center justify-center text-xl ${anim}`} style={pct(MAP_COLUMNS, 1 + Math.floor((ev.at / 1000) % 4), viewColumns - MAP_COLUMNS, 1)} data-testid="map-event">
          {ICON.star}
        </div>
      );
    case 'truck': {
      const b = box(ev.cells);
      return (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute z-30 text-xl ${anim}`}
          style={{ top: `${((b.y + b.h - 1) / rows) * 100}%`, left: reduceMotion ? `${(b.x / viewColumns) * 100}%` : undefined, ['--to' as string]: `${(b.x / viewColumns) * 100}%` }}
          data-testid="map-event"
        >
          {ICON.truck}
        </div>
      );
    }
    case 'bolt':
    case 'fire': {
      const b = box(ev.cells);
      const clickable = m.animation === 'fire' && ev.claimUntil !== undefined;
      return clickable ? (
        <button
          type="button"
          onClick={() => claim()}
          className={`absolute z-40 flex items-center justify-center rounded border-2 border-orange-400 bg-orange-500/20 text-2xl ${anim}`}
          style={pct(b.x, b.y, b.w, b.h)}
          aria-label={`${name}: click to put it out`}
          title="Click to put it out!"
          data-testid="map-event"
        >
          {ICON.fire}
        </button>
      ) : (
        <div aria-hidden="true" className={`pointer-events-none absolute z-30 flex items-center justify-center text-2xl ${anim}`} style={pct(b.x, b.y, b.w, b.h)} data-testid="map-event">
          {ICON[m.animation]}
        </div>
      );
    }
  }
}
