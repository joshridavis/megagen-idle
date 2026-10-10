import { LAUNCH_DATE, LAUNCH_DATE_TEXT } from './links';

/** "Coming March 11, 2027 to PC, Android and iPhone", or "Out now on …" from launch day. */
export function launchLine(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10) >= LAUNCH_DATE ? 'Out now on PC, Android and iPhone' : `Coming ${LAUNCH_DATE_TEXT} to PC, Android and iPhone`;
}
