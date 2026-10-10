import { PET_CLICK_CAP } from '../data/pets';

/**
 * Whether a pet click counts toward the petting achievements (1.51): at most
 * PET_CLICK_CAP.count clicks in any PET_CLICK_CAP.ms window. Takes the times of
 * recent counted clicks and returns the new list (pure, for tests).
 */
export function countPetClick(recent: number[], now: number, cap = PET_CLICK_CAP): { counts: boolean; recent: number[] } {
  const kept = recent.filter((t) => t > now - cap.ms && t <= now);
  if (kept.length >= cap.count) return { counts: false, recent: kept };
  return { counts: true, recent: [...kept, now] };
}
