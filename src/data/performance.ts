// Performance budgets (0.42), checked by src/performance.test.tsx on a large base
// (200 generators, every research done). Generous, so a slow CI runner passes;
// they catch a return of whole-grid re-renders on every tick.

/** Machines in the benchmark base. */
export const PERF_GENERATORS = 200;

/** Average ms for the pure one-second game step (advanceTime). Measured about 0.3 ms. */
export const PERF_STEP_BUDGET_MS = 5;

/** Average ms per live tick, store update plus React render, on the Generators or Map tab (jsdom). Measured 20 to 30 ms; was 108 and 262 ms. */
export const PERF_TICK_BUDGET_MS = 150;
