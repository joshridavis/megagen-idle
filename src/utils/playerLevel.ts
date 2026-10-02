import { ENERGY_BONUS_PER_LEVEL, LEVEL_EXPONENT, LEVEL_SCALE, MAX_PLAYER_LEVEL, PLAYER_LEVEL_BONUS_CAP } from '../data/playerLevel';

/** Lifetime energy needed to reach `level` (level 1 needs nothing). */
export function energyForLevel(level: number): number {
  return level <= 1 ? 0 : LEVEL_SCALE * (level - 1) ** LEVEL_EXPONENT;
}

export interface PlayerLevel {
  level: number;
  /** Lifetime energy needed for this level and the next (equal at max level). */
  current: number;
  next: number;
  /** 0..1 progress toward the next level (1 at max). */
  progress: number;
  isMax: boolean;
}

/** The player's level for a lifetime energy total. */
export function getPlayerLevel(lifetimeEnergy: number): PlayerLevel {
  const e = Math.max(0, lifetimeEnergy || 0);
  // invert the curve, then correct for rounding at the boundaries
  let level = Math.min(MAX_PLAYER_LEVEL, Math.max(1, Math.floor((e / LEVEL_SCALE) ** (1 / LEVEL_EXPONENT)) + 1));
  while (level < MAX_PLAYER_LEVEL && energyForLevel(level + 1) <= e) level++;
  while (level > 1 && energyForLevel(level) > e) level--;
  const isMax = level >= MAX_PLAYER_LEVEL;
  const current = energyForLevel(level);
  const next = isMax ? current : energyForLevel(level + 1);
  return { level, current, next, progress: isMax ? 1 : (e - current) / (next - current), isMax };
}

/** Energy bonus from the player level (0.90): +0.1% per level above 1, capped. */
export function playerLevelEnergyBonus(lifetimeEnergy: number): number {
  return Math.min(PLAYER_LEVEL_BONUS_CAP, (getPlayerLevel(lifetimeEnergy).level - 1) * ENERGY_BONUS_PER_LEVEL);
}
