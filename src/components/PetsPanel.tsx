import { sprites, type SpriteId } from '../assets';
import { useEffect, useState } from 'react';
import { GROW_HOURS, PET_PARTICLES, PET_REACT_MS, PET_STAGES, PETS, type PetDef, type PetId } from '../data/pets';
import { RESOURCE_NAMES } from '../data/resources';
import { useStore } from '../store';
import { formatDuration } from '../utils/format';
import { canFeed, feedCost } from '../utils/pets';
import { useNumberFormat } from './useNumberFormat';

const sprite = (id: string, stage: number) => `pet_${id}_${stage}` as SpriteId;

function bonusText(def: PetDef, value: number): string {
  const pct = `+${Math.round(value * 100)}%`;
  const b = def.bonus;
  if (b.kind === 'click') return `${pct} energy per click`;
  if (b.kind === 'energy') return `${pct} energy from all generators`;
  if (b.kind === 'production') return `${pct} ${b.resource ? RESOURCE_NAMES[b.resource].toLowerCase() : 'output from all producers'}`;
  return `${pct} energy from ${def.description.split('Boosts ')[1]?.replace('.', '') ?? 'some generators'}`;
}

/** An owned pet's picture: clicking it plays a short reaction (0.99), unless Reduce motion is on. */
function PetPicture({ id, stage, name }: { id: PetId; stage: number; name: string }) {
  const reduceMotion = useStore((s) => s.settings.reduceMotion);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setPlaying(false), PET_REACT_MS);
    return () => clearTimeout(t);
  }, [playing]);
  return (
    <button
      type="button"
      onClick={() => !playing && !reduceMotion && setPlaying(true)}
      aria-label={`Pet ${name}`}
      title={`Pet ${name}`}
      className="relative shrink-0 rounded"
      data-testid={`pet-picture-${id}`}
      data-playing={playing}
    >
      <img src={sprites[sprite(id, stage)]} alt="" width={64} height={64} className={`pixelated ${playing ? 'pet-react' : ''}`} />
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

/** Energy pets (0.92): collection, feeding and growth, one active pet. */
export default function PetsPanel() {
  const state = useStore((s) => s);
  const feed = useStore((s) => s.feedPet);
  const activate = useStore((s) => s.setActivePet);
  const fmt = useNumberFormat();
  const now = state.lastSavedTimestamp;
  const owned = state.pets.owned;
  const found = PETS.filter((p) => owned[p.id]).length;
  return (
    <section aria-label="Pets">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="panel-title">
          Pets ({found}/{PETS.length})
        </h2>
        <span className="text-xs text-slate-400">One pet is active at a time and gives its bonus. Feed pets to grow them.</span>
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
          const active = state.pets.active === def.id;
          const cost = feedCost(state, def.id);
          const food = def.food === 'energy' ? 'energy' : RESOURCE_NAMES[def.food].toLowerCase();
          return (
            <li
              key={def.id}
              className={`flex flex-col gap-2 rounded-lg border p-3 ${active ? 'border-amber-400 bg-slate-800' : 'border-slate-600 bg-slate-800'}`}
              data-testid={`pet-${def.id}`}
            >
              <div className="flex items-center gap-3">
                <PetPicture id={def.id} stage={pet.stage} name={def.name} />
                <div className="min-w-0">
                  <div className="font-semibold">{def.name}</div>
                  <div className="text-xs text-amber-300">
                    {PET_STAGES[pet.stage - 1]} {active && '· Active'}
                  </div>
                  <div className="text-xs text-emerald-300">{bonusText(def, def.bonusByStage[pet.stage - 1])}</div>
                </div>
              </div>
              <p className="text-xs text-slate-400">{def.description}</p>
              {pet.growUntil !== null ? (
                <p className="text-xs text-sky-300">Growing: {formatDuration((pet.growUntil - now) / 1000)} left</p>
              ) : cost !== null ? (
                <button
                  type="button"
                  disabled={!canFeed(state, def.id)}
                  onClick={() => feed(def.id)}
                  className="min-h-11 rounded bg-emerald-600 px-2 py-1 text-sm font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  Feed {fmt.num(cost)} {food}
                  <span className="block text-xs font-normal">then grows for {GROW_HOURS[pet.stage - 1]} hours</span>
                </button>
              ) : (
                <p className="text-xs text-emerald-400">Fully grown!</p>
              )}
              {!active && (
                <button type="button" onClick={() => activate(def.id)} className="min-h-9 rounded bg-slate-600 px-2 text-sm hover:bg-slate-500">
                  Make active
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
