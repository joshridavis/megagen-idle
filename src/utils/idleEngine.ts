import { useEffect } from 'react';
import { LIVE_TICK_MAX_SECONDS, MAX_OFFLINE_SECONDS, TICK_INTERVAL_MS } from '../data/time';
import { platform } from '../platform';
import { useStore } from '../store';

/**
 * Seconds elapsed between two timestamps (ms), clamped to [0, maxSeconds].
 * Negative deltas (clock moved backwards) count as 0.
 */
export function computeDeltaSeconds(fromMs: number, toMs: number, maxSeconds = Infinity): number {
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) return 0;
  const delta = (toMs - fromMs) / 1000;
  if (delta <= 0) return 0;
  return Math.min(delta, maxSeconds);
}

/** Energy gained over a period, given a production rate. */
export function computeIdleGain(ratePerSecond: number, deltaSeconds: number): number {
  if (deltaSeconds <= 0 || ratePerSecond <= 0) return 0;
  return ratePerSecond * deltaSeconds;
}

/** Applies gains since the last save; called on load and on every tick. */
export function tick(now = Date.now(), maxSeconds = MAX_OFFLINE_SECONDS, catchUp = false): number {
  const { lastSavedTimestamp, applyIdleGains } = useStore.getState();
  const delta = computeDeltaSeconds(lastSavedTimestamp, now, maxSeconds);
  applyIdleGains(delta, now, { catchUp });
  // Random events (0.84): sightings only while the game is on screen.
  const visible = !platform.isBackground();
  useStore.getState().rollRandomEvents(delta, { foreground: visible && !catchUp, catchUp }, Math.random, now);
  // a contract completed and a pet's stage-up are celebrated only during live play (1.58, 1.80), like research
  const live = !catchUp && delta <= LIVE_TICK_MAX_SECONDS;
  useStore.getState().tickContracts(now, Math.random, live);
  useStore.getState().tickPets(now, live);
  return delta;
}

/**
 * Drives idle progress: credits offline time once the save has loaded, then
 * runs a heartbeat. Every delta is computed from Date.now() so throttled
 * background tabs stay accurate.
 */
export const useIdleEngine = (): void => {
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      tick(Date.now(), MAX_OFFLINE_SECONDS, true);
      interval = setInterval(() => tick(), TICK_INTERVAL_MS);
    };
    // Background tabs throttle the heartbeat to about once a minute; summarize
    // the whole hidden period once, on return (0.79).
    const onBackground = (hidden: boolean) => {
      tick();
      if (hidden) useStore.getState().markHidden(Date.now());
      else useStore.getState().markVisible(Date.now());
    };
    // through the platform layer (0.87), so a desktop or mobile wrapper can report pause and resume
    const offBackground = platform.onBackground(onBackground);
    const persistApi = useStore.persist;
    let unsub: (() => void) | undefined;
    if (!persistApi || persistApi.hasHydrated()) start();
    else unsub = persistApi.onFinishHydration(start);
    return () => {
      offBackground();
      unsub?.();
      if (interval) clearInterval(interval);
    };
  }, []);
};
