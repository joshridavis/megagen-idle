import { useEffect, useState } from 'react';
import { sprites, type SpriteId } from '../assets';
import {
  PET_ACTION_BUBBLES,
  PET_CONFETTI,
  PET_MEET,
  PET_GROUND_ACTIONS,
  PET_PARTICLES,
  PET_REACTION_MS,
  PET_SLEEP_SQUASH,
  PET_STAGE_HEIGHT,
  PET_REACT_MS,
  PET_WALK,
  PETS_BY_ID,
  type PetId,
} from '../data/pets';
import { platform } from '../platform';
import { useStore } from '../store';
import { activePets } from '../utils/pets';
import { applyReaction, endReactions, reactionDef, startWalkers, stepWalkers, walkMs, type Walker } from '../utils/petWalk';

/** How far a bubble is tucked down toward the pet (px). */
const BUBBLE_TUCK_PX = 6;
/** Where the bubble's near edge starts, as a share of the pet box from the back: just past the head (1.82). */
const BUBBLE_HEAD = 0.75;
/** About how wide a bubble is drawn (an emoji at text-sm plus its trail), to keep it on screen (px). */
export const BUBBLE_WIDTH_PX = 22;

/**
 * Where a thought bubble sits (1.76, 1.82): beside the head on the side the
 * pet faces, like a comic thought bubble, just above the pet's drawn height
 * for its stage and lower when it is curled up asleep. It may stick out of the
 * pet box; near a screen edge it flips to the other side so it is never cut
 * off. `layerPx` is the width of the walking layer (unknown: no flip).
 */
export function bubblePlace(
  w: Pick<Walker, 'action' | 'left' | 'x'>,
  stage: number,
  layerPx?: number,
): { side: 'left' | 'right'; style: { bottom: string; left?: string; right?: string } } {
  // the emoji glyphs leave some room under themselves: tuck the bubble down by BUBBLE_TUCK_PX
  const sleep = w.action === 'sleep';
  const height = PET_STAGE_HEIGHT[Math.min(3, Math.max(1, stage)) - 1] * (sleep ? PET_SLEEP_SQUASH : 1);
  const bottom = `calc(${Math.round(height * 100)}% - ${BUBBLE_TUCK_PX}px)`;
  let side: 'left' | 'right' = w.left ? 'left' : 'right';
  if (layerPx) {
    const size = PET_WALK.size;
    const petLeft = w.x * (layerPx - size);
    if (side === 'right' && petLeft + size * BUBBLE_HEAD + BUBBLE_WIDTH_PX > layerPx) side = 'left';
    else if (side === 'left' && petLeft + size * (1 - BUBBLE_HEAD) - BUBBLE_WIDTH_PX < 0) side = 'right';
  }
  const at = `${Math.round(BUBBLE_HEAD * 100)}%`;
  return { side, style: side === 'right' ? { bottom, left: at } : { bottom, right: at } };
}

/**
 * The 💭 glyph draws its own small trail bubbles toward its lower left (every
 * emoji font). On the left of the pet that trail would point away from the
 * head (owner report, playtest 27), so the glyph is mirrored there and its
 * trail points back at the pet. Other bubbles (❗, 💤) have no trail and are
 * never mirrored, so 💤 never reads backward.
 */
export function mirrorBubble(action: Walker['action'], side: 'left' | 'right'): boolean {
  return action === 'sit' && side === 'left';
}

/** Two meeting pets stand a pet's width apart, whatever the screen width (1.81). */
const meetGap = () => Math.min(0.3, (PET_WALK.size + 2) / Math.max(1, window.innerWidth - PET_WALK.size));

/** The walking layer's width: it spans the window. */
function useLayerWidth(): number {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

/** One walking pet: a button only as big as the pet, so the rest of the layer never blocks clicks. */
function WalkingPet({ w, stage, still, layerPx }: { w: Walker; stage: number; still: boolean; layerPx: number }) {
  const [playing, setPlaying] = useState(false);
  const petPet = useStore((s) => s.petPet);
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setPlaying(false), PET_REACT_MS);
    return () => clearTimeout(t);
  }, [playing]);
  const name = PETS_BY_ID[w.id].name;
  const size = PET_WALK.size;
  const walking = !still && w.action === 'walk';
  const react = w.react;
  // meeting another pet (1.81): only the visitor shows the greeting, only the host the shared ball or apple
  const together = !still && !react && !playing && w.meet?.phase === 'together';
  const greeting = together && w.meet!.kind === 'greet' && !w.meet!.host ? bubblePlace(w, stage, layerPx) : null;
  const sharedProp = together && !w.meet!.host && w.action !== 'walk' && PET_GROUND_ACTIONS.includes(w.action);
  const pose = still ? '' : playing ? 'pet-react' : react ? `pet-reaction-${react.pose}` : walking ? 'pet-walking' : `pet-act-${w.action}`;
  return (
    <button
      type="button"
      onClick={() => {
        // every click counts as petting (1.51, rate-capped in the store); the reaction plays once at a time
        petPet();
        if (!playing && !still) setPlaying(true);
      }}
      aria-label={`Pet ${name}`}
      title={`Pet ${name}`}
      data-testid={`walking-pet-${w.id}`}
      data-action={still ? 'still' : w.action}
      data-playing={playing}
      data-reaction={react?.pose}
      data-meet={w.meet ? `${w.meet.kind}-${w.meet.phase}` : undefined}
      className="pointer-events-auto absolute bottom-0 left-0 rounded"
      style={{
        width: size,
        height: size,
        transform: `translateX(calc(${w.x} * (100cqw - ${size}px)))`,
        transition: walking ? `transform ${walkMs(w.from, w.x, w.pace)}ms linear` : 'none',
      }}
    >
      {react && !playing && (
        // a celebration or event reaction (1.80): its bubble shows even with Reduce motion
        (() => {
          const place = bubblePlace(w, stage, layerPx);
          return (
            <span
              aria-hidden="true"
              data-testid={`pet-reaction-${w.id}`}
              data-side={place.side}
              className="pet-bubble pointer-events-none absolute text-sm leading-none"
              style={place.style}
            >
              {react.emoji}
            </span>
          );
        })()
      )}
      {greeting && (
        // two pets greet each other (1.81): a heart between them, from the visitor
        <span
          aria-hidden="true"
          data-testid={`pet-bubble-${w.id}`}
          data-side={greeting.side}
          className="pet-bubble pointer-events-none absolute text-sm leading-none"
          style={greeting.style}
        >
          {PET_MEET.greetBubble}
        </span>
      )}
      {!still && !react && !walking && !playing && !sharedProp && w.action !== 'walk' && PET_ACTION_BUBBLES[w.action] && (
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
          (() => {
            const place = bubblePlace(w, stage, layerPx);
            return (
              <span
                aria-hidden="true"
                data-testid={`pet-bubble-${w.id}`}
                data-side={place.side}
                data-trail={w.action === 'sit' || undefined}
                className="pet-bubble pointer-events-none absolute text-sm leading-none"
                style={place.style}
              >
                <span className="inline-block" style={mirrorBubble(w.action, place.side) ? { transform: 'scaleX(-1)' } : undefined}>
                  {PET_ACTION_BUBBLES[w.action]}
                </span>
              </span>
            );
          })()
        )
      )}
      <span className="block h-full w-full" style={{ transform: w.left ? 'scaleX(-1)' : undefined }}>
        <img src={sprites[`pet_${w.id}_${stage}` as SpriteId]} alt="" width={size} height={size} className={`pixelated block ${pose}`}
          // the walking bob follows the pace: quicker steps when trotting (1.79)
          style={walking && !playing ? { animationDuration: `${0.5 / (w.pace ?? 1)}s` } : undefined}
          data-pace={walking ? (w.pace ?? 1) : undefined}
        />
      </span>
      {react?.pose === 'celebrate' && !still && !playing &&
        PET_CONFETTI.map((c, i) => (
          <span
            key={`c${i}`}
            aria-hidden="true"
            data-testid={`pet-confetti-${w.id}`}
            className="pet-particle pointer-events-none absolute text-xs"
            style={{ left: `${5 + i * 35}%`, animationDelay: `${i * 300}ms`, animationIterationCount: 2 }}
          >
            {c}
          </span>
        ))}
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
  const layerPx = useLayerWidth();
  const [walkers, setWalkers] = useState<Walker[]>(() => startWalkers(activePets({ pets }), Date.now()));
  useEffect(() => {
    const ids = (key ? key.split(',') : []) as PetId[];
    if (!on) return;
    if (still) {
      setWalkers(startWalkers(ids, Date.now()));
      return;
    }
    setWalkers((w) => stepWalkers(w, ids, Date.now(), Math.random, { gap: meetGap() }));
    const t = setInterval(() => {
      if (!platform.isBackground()) setWalkers((w) => stepWalkers(w, ids, Date.now(), Math.random, { gap: meetGap() }));
    }, PET_WALK.tickMs);
    return () => clearInterval(t);
  }, [on, still, key]);
  // celebrate milestones and react to random events (1.80): every pet stops for one reaction at a time
  const reaction = useStore((s) => s.petReaction);
  useEffect(() => {
    if (!on || !reaction) return;
    const now = Date.now();
    const until = reaction.at + PET_REACTION_MS;
    if (now >= until) return;
    setWalkers((w) => applyReaction(w, reactionDef(reaction), now, until));
    // standing still (Reduce motion) no step runs, so the bubble is cleared here
    const t = setTimeout(() => setWalkers((w) => endReactions(w, Date.now())), until - now);
    return () => clearTimeout(t);
  }, [on, reaction]);
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
        return stage ? <WalkingPet key={w.id} w={w} stage={stage} still={still} layerPx={layerPx} /> : null;
      })}
    </div>
  );
}
