import { useEffect } from 'react';
import { sprites, type SpriteId } from '../assets';
import { PET_STAGES, PETS_BY_ID } from '../data/pets';
import { ENERGY_BONUS_PER_LEVEL, PLAYER_LEVEL_BONUS_CAP } from '../data/playerLevel';
import { RESEARCH_BY_ID } from '../data/research';
import { CELEBRATION_MS } from '../data/time';
import { useStore } from '../store';
import { getResearchRewards } from './researchRewards';
import { RESEARCH_ICONS } from './researchSprites';

const SPARKS = 12;

/** Total player level energy bonus at a level, e.g. "1.4%". */
function levelBonusText(level: number): string {
  return `${+(Math.min(PLAYER_LEVEL_BONUS_CAP, (level - 1) * ENERGY_BONUS_PER_LEVEL) * 100).toFixed(1)}%`;
}

/**
 * Global "Research complete!", "Level up!" (0.90) and pet stage-up (1.58) burst, shown over any tab
 * when it happens during live play. Auto-hides; click to dismiss; queued completions follow.
 */
export default function ResearchCelebration() {
  const current = useStore((s) => s.celebrations[0]);
  const dismiss = useStore((s) => s.dismissCelebration);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismiss, CELEBRATION_MS);
    return () => clearTimeout(t);
  }, [current, dismiss]);

  const reduceMotion = useStore((s) => s.settings.reduceMotion);
  const def = current && current.kind !== 'level' && current.kind !== 'pet' ? RESEARCH_BY_ID[current.id] : undefined;
  const level = current?.kind === 'level' ? current.level : null;
  const pet = current?.kind === 'pet' ? current : null;
  const petDef = pet ? PETS_BY_ID[pet.id] : undefined;
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-24 z-50 flex justify-center px-4">
      {level !== null && (
        <button
          key={`level-${level}-${current!.at}`}
          type="button"
          onClick={dismiss}
          data-testid="level-celebration"
          className="celebrate pointer-events-auto relative flex max-w-sm items-center gap-3 rounded-xl border-2 border-sky-400 bg-slate-900 px-5 py-3 text-left shadow-[0_0_30px_rgba(36,159,222,0.5)]"
        >
          {Array.from({ length: SPARKS }, (_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="spark absolute left-1/2 top-1/2 h-2 w-2 rounded-sm bg-sky-300"
              style={{ ['--angle' as string]: `${(360 / SPARKS) * i}deg` }}
            />
          ))}
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 font-mono text-lg font-bold text-white">
            {level}
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wide text-sky-300">Level up!</span>
            <span className="block text-lg font-bold">Player level {level}</span>
            <span className="block text-sm text-sky-100">🎁 +{levelBonusText(level)} energy from all generators</span>
          </span>
        </button>
      )}
      {pet && petDef && (
        <button
          key={`pet-${pet.id}-${pet.at}`}
          type="button"
          onClick={dismiss}
          data-testid="pet-celebration"
          data-animated={!reduceMotion}
          className="celebrate pointer-events-auto relative flex max-w-sm items-center gap-3 rounded-xl border-2 border-amber-400 bg-slate-900 px-5 py-3 text-left shadow-[0_0_30px_rgba(255,200,37,0.5)]"
        >
          {/* The old sprite grows into the new one with a flash (1.58); Reduce motion shows only the new one. */}
          <span className="relative h-12 w-12 shrink-0">
            {!reduceMotion && (
              <>
                <img
                  src={sprites[`pet_${pet.id}_${Math.max(1, pet.stage - 1)}` as SpriteId]}
                  alt=""
                  width={48}
                  height={48}
                  className="pet-grow-old pixelated absolute inset-0"
                  data-testid="pet-celebration-old"
                />
                <span aria-hidden="true" className="pet-grow-flash absolute inset-0 rounded-full bg-yellow-100" />
              </>
            )}
            <img
              src={sprites[`pet_${pet.id}_${pet.stage}` as SpriteId]}
              alt=""
              width={48}
              height={48}
              className={`pixelated absolute inset-0 ${reduceMotion ? '' : 'pet-grow-new'}`}
            />
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wide text-amber-300">🐣 Your pet grew up!</span>
            <span className="block text-lg font-bold">{petDef.name}</span>
            <span className="block text-sm text-amber-100">Now {PET_STAGES[pet.stage - 1].toLowerCase()}: a bigger bonus</span>
          </span>
        </button>
      )}
      {def && (
        <button
          key={`${def.id}-${current!.at}`}
          type="button"
          onClick={dismiss}
          data-testid="research-celebration"
          className="celebrate pointer-events-auto relative flex max-w-sm items-center gap-3 rounded-xl border-2 border-emerald-400 bg-slate-900 px-5 py-3 text-left shadow-[0_0_30px_rgba(89,193,53,0.5)]"
        >
          {Array.from({ length: SPARKS }, (_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="spark absolute left-1/2 top-1/2 h-2 w-2 rounded-sm bg-yellow-300"
              style={{ ['--angle' as string]: `${(360 / SPARKS) * i}deg` }}
            />
          ))}
          <img src={sprites[RESEARCH_ICONS[def.category]]} alt="" width={40} height={40} className="pixelated" />
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wide text-emerald-300">Research complete!</span>
            <span className="block text-lg font-bold">{def.name}</span>
            {getResearchRewards(def)[0] && (
              <span className="block text-sm text-emerald-100">🎁 {getResearchRewards(def)[0].text}</span>
            )}
          </span>
        </button>
      )}
    </div>
  );
}
