import { useEffect, useState } from 'react';
import { sprites, type SpriteId } from '../assets';
import { EVENTS_BY_ID, MIN_SIGHTING_MS } from '../data/events';
import { useStore } from '../store';
import Frames from './Frames';

const SPRITE: Partial<Record<string, SpriteId>> = {
  balloon: 'sighting_balloon',
  paper_plane: 'sighting_paper_plane',
  cat: 'sighting_cat',
  spaceship: 'sighting_spaceship',
  meteor_shower: 'sighting_meteor',
  whale: 'sighting_whale',
  ufo: 'sighting_ufo',
  drone: 'sighting_drone',
  hot_air_balloon: 'sighting_hot_air_balloon',
  comet: 'sighting_comet',
};

/** Width of a sighting sprite on screen (default w-24). */
const SIZE: Partial<Record<string, string>> = { whale: 'w-36', cat: 'w-16', balloon: 'w-10', hot_air_balloon: 'w-16', drone: 'w-16', comet: 'w-28' };

/**
 * The sighting flock: [left %, top %, wing-beat delay, bob delay] per gull, in
 * a V with the leader at the front. The gull sprites face right, so the flock
 * is mirrored to fly left.
 */
const FLOCK: [number, number, string, string][] = [
  [0, 35, '0s', '0s'],
  [20, 15, '-0.12s', '-0.7s'],
  [22, 58, '-0.3s', '-1.4s'],
  [42, 0, '-0.2s', '-0.4s'],
  [44, 76, '-0.38s', '-1.1s'],
];

function usePageVisible(): boolean {
  const get = () => typeof document === 'undefined' || document.visibilityState !== 'hidden';
  const [visible, setVisible] = useState(get);
  useEffect(() => {
    const on = () => setVisible(get());
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return visible;
}

/**
 * Plays the random-event sighting on screen (0.84). Purely decorative: it
 * never blocks clicks, and is skipped when "Reduce motion" is on.
 */
export default function Sightings() {
  const active = useStore((s) => s.activeSighting);
  const reduceMotion = useStore((s) => s.settings.reduceMotion);
  const dismiss = useStore((s) => s.dismissSighting);
  const def = active ? EVENTS_BY_ID[active.id] : undefined;
  const duration = Math.max(MIN_SIGHTING_MS, def?.durationMs ?? 0);
  const visible = usePageVisible();

  // The timer only runs while the page is visible; hiding the tab restarts
  // the sighting when the player comes back, so it is never played to nobody.
  useEffect(() => {
    if (!active || !visible) return;
    const t = setTimeout(dismiss, reduceMotion ? 0 : duration);
    return () => clearTimeout(t);
  }, [active, duration, dismiss, reduceMotion, visible]);

  if (!def || !def.animation || reduceMotion || !visible) return null;
  const sprite = SPRITE[def.id];
  const img = sprite && <img src={sprites[sprite]} alt="" className="pixelated block h-auto w-full" />;
  const style = { ['--dur' as string]: `${duration}ms` };
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 overflow-hidden" data-testid={`sighting-${def.id}`}>
      {def.animation === 'glow' && <div className="sighting-glow absolute inset-x-0 top-0 h-48" style={style} />}
      {def.animation === 'arc' && <div className="sighting-arc absolute left-1/2 top-1/3 h-[60vw] w-[120vw] -translate-x-1/2 rounded-full" style={style} />}
      {def.animation === 'streak' &&
        // several stars spread over the whole sighting
        Array.from({ length: Math.round(duration / 3000) }, (_, i) => (
          <div
            key={i}
            className="sighting-streak absolute h-0.5 w-24 bg-gradient-to-r from-transparent to-white"
            style={{ left: `${8 + ((i * 23) % 45)}%`, top: `${5 + ((i * 11) % 20)}%`, animationDelay: `${i * 3000}ms` }}
          />
        ))}
      {def.animation === 'fall' &&
        Array.from({ length: Math.round(duration / 1200) }, (_, i) => (
          <div
            key={i}
            className="sighting-fall air-shadow absolute w-8"
            data-shadow="air"
            style={{ left: `${2 + ((i * 37) % 55)}%`, animationDelay: `${i * 1200}ms` }}
          >
            {img}
          </div>
        ))}
      {def.id === 'birds' ? (
        // a V of flapping gulls (owner request: the old flock was a static sprite)
        // the whole flock casts one far air shadow (2.02; the gull sprites no longer carry one)
        <div className={`sighting-${def.animation} air-shadow absolute h-24 w-40`} style={style} data-sprite="map_bird" data-shadow="air">
          {FLOCK.map(([x, y, flap, bob], i) => (
            <span key={i} className="sighting-bob absolute h-6 w-6 sm:h-8 sm:w-8" style={{ left: `${x}%`, top: `${y}%`, animationDelay: bob }}>
              <span className="block h-full w-full -scale-x-100">
                <Frames a="map_bird_1" b="map_bird_2" still={false} period="0.45s" delay={flap} />
              </span>
            </span>
          ))}
        </div>
      ) : ['fly-right', 'fly-left', 'rise', 'walk', 'beam', 'swim'].includes(def.animation) && (
        <div
          className={`sighting-${def.animation} absolute ${SIZE[def.id] ?? 'w-24'} ${def.animation === 'walk' ? '' : 'air-shadow'}`}
          style={style}
          data-shadow={def.animation === 'walk' ? 'ground' : 'air'}
        >
          {/* 2.00: in the air a drop shadow follows the sprite; the walking cat has one on the ground, like the pets */}
          {def.animation === 'walk' && <span className="ground-shadow" data-testid="ground-shadow" />}
          {/* the whale sprite faces left but swims right (playtest 19): mirror it */}
          {def.animation === 'swim' ? <div className="-scale-x-100">{img}</div> : img}
        </div>
      )}
    </div>
  );
}
