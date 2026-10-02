/** Event log and toasts (0.38). Tune here. */
/** The log keeps at most this many entries (oldest dropped). */
export const EVENT_LOG_CAP = 100;
/** At most this many toasts on screen; older ones are dropped. */
export const TOAST_CAP = 3;
/** How long a toast stays on screen (ms). */
export const TOAST_MS = 6000;
/** Event notices (random events, achievements) stay longer: they need reading (playtest 15). */
export const EVENT_TOAST_MS = 12000;
/** "Room nearly full" fires when free room drops to this or less. */
export const ROOM_WARNING_FREE = 3;
