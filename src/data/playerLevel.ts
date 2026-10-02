/**
 * Player level from lifetime energy (0.88, playtest 10). Level L needs
 * LEVEL_SCALE x (L - 1)^LEVEL_EXPONENT lifetime energy, so the first levels
 * come within minutes and level 99 at roughly 200 hours of today's content
 * (checked with the balance simulator; retuned in 0.47).
 */
export const LEVEL_SCALE = 0.05;
export const LEVEL_EXPONENT = 5.3;
export const MAX_PLAYER_LEVEL = 99;
/** How long the level-up badge stays visible. */
export const LEVEL_UP_MS = 4000;
