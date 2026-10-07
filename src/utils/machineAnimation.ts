import { GENERATOR_ANIMATIONS, PRODUCER_ANIMATIONS, type MachineAnimation } from '../data/machineAnimations';
import type { GeneratorType } from '../types/generator';
import type { ProducerId } from '../types/resource';
import type { GameState } from '../types/state';
import type { Placed } from './siteMap';

/**
 * Whether a machine on the map is working (1.71): a generator that is switched on
 * (running out of fuel switches it off); a producer always produces. Pure.
 */
export function isMachineWorking(p: Pick<Placed, 'kind' | 'id'>, gens: GameState['activeGenerators']): boolean {
  if (p.kind === 'producer') return true;
  return gens.find((g) => g.id === p.id)?.isActive ?? false;
}

/** The animation of a machine type (1.71). */
export const machineAnimation = (p: Pick<Placed, 'kind' | 'type'>): MachineAnimation =>
  p.kind === 'producer' ? PRODUCER_ANIMATIONS[p.type as ProducerId] : GENERATOR_ANIMATIONS[p.type as GeneratorType];

/**
 * A start offset (a negative animation delay, in seconds) from the machine's key, so a
 * row of turbines does not move in lockstep. The same key always gets the same offset. Pure.
 */
export function animationOffset(key: string, period: number): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return -(((h >>> 0) % 1000) / 1000) * period;
}
