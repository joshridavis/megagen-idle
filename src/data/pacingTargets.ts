import { ROOM_TIERS } from './rooms';

/**
 * Pacing targets the balance simulator (npm run simulate) checks.
 * Owner playtest feedback overrides these; record changes in BALANCE_REPORT.md.
 * Each target is [min, max] in hours of simulated play (max may be Infinity).
 */
export interface PacingTarget {
  id: string;
  label: string;
  hours: [number, number];
}

export const PACING_TARGETS: PacingTarget[] = [
  { id: 'firstGenerator', label: 'First generator built', hours: [0, 2 / 60] },
  { id: 'firstResearch', label: 'First research completed (owner: much slower than minutes)', hours: [10 / 60, 1] },
  { id: 'generator:wind', label: 'First Wind Turbine', hours: [1, 4] },
  { id: 'generator:coal', label: 'First Coal Plant', hours: [1.5, 6] },
  { id: 'generator:hydro', label: 'First Hydropower Dam (mid-tier)', hours: [3, 10] },
  { id: 'generator:gas', label: 'First Natural Gas Plant', hours: [6, 20] },
  // 1.87 (owner, playtest 26: too easy from the middle game on): a slower middle and late game.
  { id: `room:${ROOM_TIERS.length}`, label: 'Last room expansion (playtest 26)', hours: [250, Infinity] },
  { id: 'completion:75', label: '75% completion (playtest 26; was 93 h)', hours: [300, Infinity] },
  { id: 'completion:100', label: '100% completion (playtest 26: about 4 to 6 weeks of normal play)', hours: [600, 900] },
];

/** A stretch longer than this (hours) with no new milestone counts as a stall. */
export const STALL_HOURS = 12;
