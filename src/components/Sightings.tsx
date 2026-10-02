import { useEffect, useState } from 'react';
import { sprites, type SpriteId } from '../assets';
import { EVENTS_BY_ID, MIN_SIGHTING_MS } from '../data/events';
import { useStore } from '../store';

const SPRITE: Partial<Record<string, SpriteId>> = {
  birds: 'sighting_birds',
  balloon: 'sighting_balloon',
  paper_plane: 'sighting_paper_plane',
  cat: 'sighting_cat',
  spaceship: 'sighting_spaceship',
  meteor_shower: 'sighting_meteor',
  whale: 'sighting_whale',
  ufo: 'sighting_ufo',
};

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
            className="sighting-fall absolute w-8"
            style={{ left: `${2 + ((i * 37) % 55)}%`, animationDelay: `${i * 1200}ms` }}
          >
            {img}
          </div>
        ))}
      {['fly-right', 'fly-left', 'rise', 'walk', 'beam', 'swim'].includes(def.animation) && (
        <div
          className={`sighting-${def.animation} absolute ${def.id === 'whale' ? 'w-36' : def.id === 'cat' ? 'w-16' : def.id === 'balloon' ? 'w-10' : 'w-24'}`}
          style={style}
        >
          {/* the whale sprite faces left but swims right (playtest 19): mirror it */}
          {def.animation === 'swim' ? <div className="-scale-x-100">{img}</div> : img}
        </div>
      )}
    </div>
  );
}
