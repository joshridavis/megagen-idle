/** Longest stretch of offline time credited on load (seconds). Tune here. */
export const MAX_OFFLINE_SECONDS = 24 * 60 * 60;

/** Heartbeat interval for the idle engine (milliseconds). */
export const TICK_INTERVAL_MS = 1000;

/**
 * Long gaps (offline time) are simulated in steps of this many seconds, so
 * fuel can run out part-way through and production stops at the right time.
 */
export const SIM_STEP_SECONDS = 60;
