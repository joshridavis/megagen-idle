import { useEffect, useState } from 'react';
import { sprites, type SpriteId } from '../assets';
import { PET_ACTION_BUBBLES, PET_GROUND_ACTIONS, PET_PARTICLES, PET_SLEEP_SQUASH, PET_STAGE_HEIGHT, PET_REACT_MS, PET_WALK, PETS_BY_ID, type PetId } from '../data/pets';
import { platform } from '../platform';
import { useStore } from '../store';
import { activePets } from '../utils/pets';
import { startWalkers, stepWalkers, walkMs, type Walker } from '../utils/petWalk';

/** How far a bubble is tucked down toward the pet (px). */
const BUBBLE_TUCK_PX = 6;

/**
 * Where a thought bubble sits (owner report, playtest 25: the 💤 floated far
 * from a small pet): just above the pet's drawn height for its stage, lower
 * when it is curled up asleep, and over its head (the side it faces) while
 * sleeping.
 */
export function bubblePlace(w: Pick<Walker, 'action' | 'left'>, stage: number): { bottom: string; left: string } {
  // the emoji glyphs leave some room under themselves: tuck the bubble down by BUBBLE_TUCK_PX
  const sleep = w.action === 'sleep';
  const height = PET_STAGE_HEIGHT[Math.min(3, Math.max(1, stage)) - 1] * (sleep ? PET_SLEEP_SQUASH : 1);
  const left = sleep ? (w.left ? 30 : 70) : 50;
  return { bottom: `calc(${Math.round(height * 100)}% - ${BUBBLE_TUCK_PX}px)`, left: `${left}%` };
}

/** One walking pet: a button only as big as the pet, so the rest of the layer never blocks clicks. */
function WalkingPet({ w, stage, still }: { w: Walker; stage: number; still: boolean }) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setPlaying(false), PET_REACT_MS);
    return () => clearTimeout(t);
  }, [playing]);
  const name = PETS_BY_ID[w.id].name;
  const size = PET_WALK.size;
  const walking = !still && w.action === 'walk';
  const pose = still ? '' : playing ? 'pet-react' : walking ? 'pet-walking' : `pet-act-${w.action}`;
  return (
    <button
      type="button"
      onClick={() => !playing && !still && setPlaying(true)}
      aria-label={`Pet ${name}`}
      title={`Pet ${name}`}
      data-testid={`walking-pet-${w.id}`}
      data-action={still ? 'still' : w.action}
      data-playing={playing}
      className="pointer-events-auto absolute bottom-0 left-0 rounded"
      style={{
        width: size,
        height: size,
        transform: `translateX(calc(${w.x} * (100cqw - ${size}px)))`,
        transition: walking ? `transform ${walkMs(w.from, w.x)}ms linear` : 'none',
      }}
    >
      {!still && !walking && !playing && w.action !== 'walk' && PET_ACTION_BUBBLES[w.action] && (
        PET_GROUND_ACTIONS.includes(w.action) ? (
          // food and toys lie on the ground in front of the pet's mouth (the sprites face right), not above it
          <span
            aria-hidden="true"
            data-testid={`pet-prop-${w.id}`}
            className={`pointer-events-none absolute bottom-0 text-xs leading-none ${w.action === 'eat' ? 'pet-food' : 'pet-ball'} ${w.left ? 'right-full -mr-2' : 'left-full -ml-2'}`}
          >
            {PET_ACTION_BUBBLES[w.action]}
          </span>
        ) : (
          <span
            aria-hidden="true"
            data-testid={`pet-bubble-${w.id}`}
            className="pet-bubble pointer-events-none absolute -translate-x-1/2 text-sm leading-none"
            style={bubblePlace(w, stage)}
          >
            {PET_ACTION_BUBBLES[w.action]}
          </span>
        )
      )}
      <span className="block h-full w-full" style={{ transform: w.left ? 'scaleX(-1)' : undefined }}>
        <img src={sprites[`pet_${w.id}_${stage}` as SpriteId]} alt="" width={size} height={size} className={`pixelated block ${pose}`} />
      </span>
      {playing &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="pet-particle pointer-events-none absolute text-xs text-yellow-300"
            style={{ left: `${10 + i * 30}%`, animationDelay: `${i * 150}ms` }}
          >
            {PET_PARTICLES[w.id]}
          </span>
        ))}
    </button>
  );
}

/**
 * The active pets walk along the bottom of the screen on every tab (1.60).
 * The layer (z-41) sits above the content, hovered cards included (z-40, owner
 * report playtest 25), and above the research chip's place while it is docked,
 * so the chip never hides the pets; but below the research chip (z-42), the map
 * buttons, dialogs and toasts, and lets clicks through except on a pet. One
 * timer, paused while the tab is hidden. Settings → "Pets walk on screen"
 * hides it; Reduce motion makes the pets stand still.
 */
export default function PetWalkers() {
  const on = useStore((s) => s.settings.petsWalk ?? true);
  const still = useStore((s) => s.settings.reduceMotion);
  const pets = useStore((s) => s.pets);
  // while the research chip is docked at the bottom, the pets walk just above it
  const researching = useStore((s) => s.currentResearch !== null);
  const key = activePets({ pets }).join(',');
  const [walkers, setWalkers] = useState<Walker[]>(() => startWalkers(activePets({ pets }), Date.now()));
  useEffect(() => {
    const ids = (key ? key.split(',') : []) as PetId[];
    if (!on) return;
    if (still) {
      setWalkers(startWalkers(ids, Date.now()));
      return;
    }
    setWalkers((w) => stepWalkers(w, ids, Date.now(), Math.random));
    const t = setInterval(() => {
      if (!platform.isBackground()) setWalkers((w) => stepWalkers(w, ids, Date.now(), Math.random));
    }, PET_WALK.tickMs);
    return () => clearInterval(t);
  }, [on, still, key]);
  if (!on || !key) return null;
  return (
    <div
      aria-label="Your pets"
      data-testid="pet-walkers"
      data-raised={researching}
      className={`@container pointer-events-none fixed inset-x-0 z-[41] mb-[env(safe-area-inset-bottom)] overflow-x-clip ${researching ? 'bottom-[4.5rem]' : 'bottom-0'}`}
      style={{ height: PET_WALK.size }}
    >
      {walkers.map((w) => {
        const stage = pets.owned[w.id]?.stage;
        return stage ? <WalkingPet key={w.id} w={w} stage={stage} still={still} /> : null;
      })}
    </div>
  );
}
