/**
 * Player level from lifetime energy (0.88, playtest 10). Level L needs
 * LEVEL_SCALE x (L - 1)^LEVEL_EXPONENT lifetime energy. Playtest 12: level 2
 * needs 200 energy (100 s of fast clicking), so no level comes in seconds.
 *
 * 2.10 (owner, after playtest 32: level 87 to 92 in one night): late game
 * output grows much faster than that polynomial, so from LATE_LEVEL_START on
 * each level also costs exp(LATE_LEVEL_STEEPNESS x (L - LATE_LEVEL_START)^2)
 * times more. Levels up to LATE_LEVEL_START are unchanged; each level above
 * it costs a little more than the one before (x1.07 at 55, x1.13 at 80,
 * x1.18 at 99). Level 99 needs about 45 billion, near 100% completion in the
 * balance simulator.
 */
export const LEVEL_SCALE = 200;
export const LEVEL_EXPONENT = 3.56;
export const LATE_LEVEL_START = 55;
export const LATE_LEVEL_STEEPNESS = 0.0015;
export const MAX_PLAYER_LEVEL = 99;

/** Each player level above 1 adds this much energy from all generators (playtest 11: about 0.1%). */
export const ENERGY_BONUS_PER_LEVEL = 0.001;
/** Upper limit of the player level energy bonus. */
export const PLAYER_LEVEL_BONUS_CAP = 0.1;
