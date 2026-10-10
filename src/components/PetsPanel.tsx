import { sprites, type SpriteId } from '../assets';
import { useEffect, useState } from 'react';
import { GROW_HOURS, PET_PARTICLES, PET_REACT_MS, PET_STAGES, PETS, type PetDef, type PetId } from '../data/pets';
import { RESOURCE_NAMES } from '../data/resources';
import { useStore } from '../store';
import { formatDuration } from '../utils/format';
import { activePets, canFeed, feedCost, growProgress, nextPetSlot, otherPetGrowing, petSlotBlock, petSlots } from '../utils/pets';
import { getPlayerLevel } from '../utils/playerLevel';
import ProgressBar from './ProgressBar';
import { useNumberFormat } from './useNumberFormat';

const sprite = (id: string, stage: number) => `pet_${id}_${stage}` as SpriteId;
/** Where the sparkles around a growing pet sit (left %, top %). */
const GROW_SPARKLES: [number, number][] = [
  [0, 10],
  [80, 0],
  [85, 60],
  [5, 70],
];

function bonusText(def: PetDef, value: number): string {
  const pct = `+${+(value * 100).toFixed(value < 0.1 ? 2 : 1)}%`;
  const b = def.bonus;
  if (b.kind === 'click') return `${pct} energy per click`;
  if (b.kind === 'energy') return `${pct} energy from all generators`;
  if (b.kind === 'research') return `${pct} research speed`;
  if (b.kind === 'contracts') return `${pct} contract bundles and boosts`;
  if (b.kind === 'production') return `${pct} ${b.resource ? RESOURCE_NAMES[b.resource].toLowerCase() : 'output from all producers'}`;
  return `${pct} energy from ${def.description.split('Boosts ')[1]?.replace('.', '') ?? 'some generators'}`;
}

/** An owned pet's picture: clicking it plays a short reaction (0.99), unless Reduce motion is on. A growing pet pulses gently, with sparkles (1.58). */
function PetPicture({ id, stage, name, growing = false }: { id: PetId; stage: number; name: string; growing?: boolean }) {
  const reduceMotion = useStore((s) => s.settings.reduceMotion);
  const [playing, setPlaying] = useState(false);
  const petPet = useStore((s) => s.petPet);
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setPlaying(false), PET_REACT_MS);
    return () => clearTimeout(t);
  }, [playing]);
  return (
    <button
      type="button"
      onClick={() => {
        // every click counts as petting (1.51, rate-capped in the store)
        petPet();
        if (!playing && !reduceMotion) setPlaying(true);
      }}
      aria-label={`Pet ${name}`}
      title={`Pet ${name}`}
      className="relative shrink-0 rounded"
      data-testid={`pet-picture-${id}`}
      data-playing={playing}
      data-growing={growing && !reduceMotion}
    >
      <img
        src={sprites[sprite(id, stage)]}
        alt=""
        width={64}
        height={64}
        className={`pixelated ${playing ? 'pet-react' : growing && !reduceMotion ? 'pet-growing' : ''}`}
      />
      {growing &&
        !reduceMotion &&
        GROW_SPARKLES.map(([left, top], i) => (
          <span
            key={i}
            aria-hidden="true"
            className="pet-sparkle pointer-events-none absolute text-xs text-sky-200"
            style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${i * 600}ms` }}
          >
            ✦
          </span>
        ))}
      {playing &&
        [0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="pet-particle pointer-events-none absolute text-sm text-yellow-300"
            style={{ left: `${10 + i * 18}%`, animationDelay: `${i * 150}ms` }}
          >
            {PET_PARTICLES[id]}
          </span>
        ))}
    </button>
  );
}

/** Energy pets (0.92): collection, feeding and growth; up to 3 active pets (1.59). */
export default function PetsPanel() {
  const state = useStore((s) => s);
  const feed = useStore((s) => s.feedPet);
  const activate = useStore((s) => s.setActivePet);
  const rest = useStore((s) => s.restPet);
  const buySlot = useStore((s) => s.buyPetSlot);
  const fmt = useNumberFormat();
  const now = state.lastSavedTimestamp;
  const owned = state.pets.owned;
  const found = PETS.filter((p) => owned[p.id]).length;
  const actives = activePets(state);
  const slots = petSlots(state);
  const next = nextPetSlot(state);
  const slotBlock = petSlotBlock(state);
  const level = getPlayerLevel(state.lifetimeEnergy).level;
  return (
    <section aria-label="Pets">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="panel-title">
          Pets ({found}/{PETS.length})
        </h2>
        <span className="text-xs text-slate-400">
          Active pets give their bonus ({actives.length}/{slots} active). Feed pets to grow them, one at a time: an adult gives 4 times a baby's
          bonus.
        </span>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg bg-slate-800 p-3" data-testid="pet-slots">
        <div className="text-sm">
          <span className="font-semibold">Active pet slots: {slots}/3</span>
          <span className="block text-xs text-slate-400">Bonuses of different active pets add up. A pet fills one slot only.</span>
        </div>
        {next ? (
          <button
            type="button"
            disabled={slotBlock !== null}
            onClick={() => buySlot()}
            data-testid="pet-slot-buy"
            className="min-h-11 rounded bg-sky-700 px-3 py-1 text-sm font-semibold hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Buy slot {slots + 1}: ⚡ {fmt.num(next.energy)}
            <span className={`block text-xs font-normal ${level < next.playerLevel ? 'text-red-300' : ''}`}>
              {level < next.playerLevel ? `🔒 Needs player level ${next.playerLevel} (you: ${level})` : slotBlock ?? `Player level ${next.playerLevel} ✓`}
            </span>
          </button>
        ) : (
          <span className="text-xs text-emerald-400">All 3 slots owned.</span>
        )}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PETS.map((def) => {
          const pet = owned[def.id];
          if (!pet) {
            return (
              <li key={def.id} className="flex flex-col items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-center" data-testid={`pet-${def.id}`}>
                <img src={sprites[sprite(def.id, 3)]} alt="" width={64} height={64} className="pixelated opacity-60 brightness-0" />
                <div className="font-semibold text-slate-400">???</div>
                <div className="text-xs text-sky-300">{def.hint}</div>
              </li>
            );
          }
          const slot = actives.indexOf(def.id);
          const active = slot >= 0;
          const cost = feedCost(state, def.id);
          const busy = otherPetGrowing(state, def.id);
          const food = def.food === 'energy' ? 'energy' : RESOURCE_NAMES[def.food].toLowerCase();
          return (
            <li
              key={def.id}
              className={`flex flex-col gap-2 rounded-lg border p-3 ${active ? 'border-amber-400 bg-slate-800' : 'border-slate-600 bg-slate-800'}`}
              data-testid={`pet-${def.id}`}
            >
              <div className="flex items-center gap-3">
                <PetPicture id={def.id} stage={pet.stage} name={def.name} growing={pet.growUntil !== null} />
                <div className="min-w-0">
                  <div className="font-semibold">{def.name}</div>
                  <div className="text-xs text-amber-300">
                    {PET_STAGES[pet.stage - 1]} {active && (slots > 1 ? `· Active (slot ${slot + 1})` : '· Active')}
                  </div>
                  <div className="text-xs text-emerald-300" data-testid={`pet-bonus-${def.id}`}>
                    {bonusText(def, def.bonusByStage[pet.stage - 1])}
                  </div>
                  {pet.stage < 3 && (
                    <div className="text-xs text-slate-300" data-testid={`pet-next-${def.id}`}>
                      Grows to: {bonusText(def, def.bonusByStage[pet.stage])} as {PET_STAGES[pet.stage]}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-400">{def.description}</p>
              {pet.growUntil !== null ? (
                <div data-testid={`pet-growing-${def.id}`}>
                  <ProgressBar value={growProgress(pet.stage, pet.growUntil, now)} label={`${def.name} growing to ${PET_STAGES[pet.stage]}`} />
                  <p className="mt-1 text-xs text-sky-300">
                    Growing to {PET_STAGES[pet.stage].toLowerCase()}: {formatDuration(Math.max(0, pet.growUntil - now) / 1000)} left
                  </p>
                </div>
              ) : cost !== null ? (
                <button
                  type="button"
                  disabled={!canFeed(state, def.id)}
                  onClick={() => feed(def.id)}
                  className="min-h-11 rounded bg-emerald-600 px-2 py-1 text-sm font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  Feed {fmt.num(cost)} {food}
                  <span className="block text-xs font-normal" data-testid={`pet-feed-note-${def.id}`}>
                    {busy
                      ? `Another pet is growing (${formatDuration(Math.max(0, busy.until - now) / 1000)} left)`
                      : `then grows for ${GROW_HOURS[pet.stage - 1]} hours`}
                  </span>
                </button>
              ) : (
                <p className="text-xs text-emerald-400">Fully grown!</p>
              )}
              {!active && (
                <button
                  type="button"
                  onClick={() => activate(def.id)}
                  className="min-h-9 rounded bg-slate-600 px-2 text-sm hover:bg-slate-500"
                  data-testid={`pet-activate-${def.id}`}
                  title={actives.length >= slots && actives[0] ? `Takes the place of ${PETS.find((p) => p.id === actives[0])?.name}` : undefined}
                >
                  Make active
                  {actives.length >= slots && actives[0] && (
                    <span className="block text-xs text-slate-300">in place of {PETS.find((p) => p.id === actives[0])?.name}</span>
                  )}
                </button>
              )}
              {active && actives.length > 1 && (
                <button
                  type="button"
                  onClick={() => rest(def.id)}
                  className="min-h-9 rounded bg-slate-700 px-2 text-sm hover:bg-slate-600"
                  data-testid={`pet-rest-${def.id}`}
                >
                  Rest (free the slot)
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
