/**
 * Player level from lifetime energy (0.88, playtest 10). Level L needs
 * LEVEL_SCALE x (L - 1)^LEVEL_EXPONENT lifetime energy. Playtest 12: level 2
 * needs 200 energy (100 s of fast clicking), so no level comes in seconds;
 * level 99 needs about 2.5 billion, near the 200 h target (balance simulator).
 */
export const LEVEL_SCALE = 200;
export const LEVEL_EXPONENT = 3.56;
export const MAX_PLAYER_LEVEL = 99;

/** Each player level above 1 adds this much energy from all generators (playtest 11: about 0.1%). */
export const ENERGY_BONUS_PER_LEVEL = 0.001;
/** Upper limit of the player level energy bonus. */
export const PLAYER_LEVEL_BONUS_CAP = 0.1;
