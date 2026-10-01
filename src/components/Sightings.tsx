import { useEffect } from 'react';
import { sprites, type SpriteId } from '../assets';
import { EVENTS_BY_ID } from '../data/events';
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

/**
 * Plays the random-event sighting on screen (0.84). Purely decorative: it
 * never blocks clicks, and is skipped when "Reduce motion" is on.
 */
export default function Sightings() {
  const active = useStore((s) => s.activeSighting);
  const reduceMotion = useStore((s) => s.settings.reduceMotion);
  const dismiss = useStore((s) => s.dismissSighting);
  const def = active ? EVENTS_BY_ID[active.id] : undefined;
  const duration = def?.durationMs ?? 6000;

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(dismiss, reduceMotion ? 0 : duration);
    return () => clearTimeout(t);
  }, [active, duration, dismiss, reduceMotion]);

  if (!def || !def.animation || reduceMotion) return null;
  const sprite = SPRITE[def.id];
  const img = sprite && <img src={sprites[sprite]} alt="" className="pixelated block h-auto w-full" />;
  const style = { ['--dur' as string]: `${duration}ms` };
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 overflow-hidden" data-testid={`sighting-${def.id}`}>
      {def.animation === 'glow' && <div className="sighting-glow absolute inset-x-0 top-0 h-48" style={style} />}
      {def.animation === 'arc' && <div className="sighting-arc absolute left-1/2 top-1/3 h-[60vw] w-[120vw] -translate-x-1/2 rounded-full" style={style} />}
      {def.animation === 'streak' && <div className="sighting-streak absolute h-0.5 w-24 bg-gradient-to-r from-transparent to-white" style={style} />}
      {def.animation === 'fall' &&
        [0, 1, 2].map((i) => (
          <div key={i} className="sighting-fall absolute w-8" style={{ ...style, left: `${55 + i * 15}%`, animationDelay: `${i * 600}ms` }}>
            {img}
          </div>
        ))}
      {['fly-right', 'fly-left', 'rise', 'walk', 'beam', 'swim'].includes(def.animation) && (
        <div
          className={`sighting-${def.animation} absolute ${def.id === 'whale' ? 'w-36' : def.id === 'cat' ? 'w-16' : def.id === 'balloon' ? 'w-10' : 'w-24'}`}
          style={style}
        >
          {img}
        </div>
      )}
    </div>
  );
}
