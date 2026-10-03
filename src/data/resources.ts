import type { ResourceId, Resources } from '../types/state';
import { MATERIAL_COST_FACTOR } from './balance';

export const RESOURCE_IDS: ResourceId[] = ['metal', 'stone', 'coal', 'naturalGas', 'oil', 'uranium', 'deuterium'];

export const RESOURCE_NAMES: Record<ResourceId, string> = {
  metal: 'Metal',
  stone: 'Stone',
  coal: 'Coal',
  naturalGas: 'Natural gas',
  oil: 'Oil',
  uranium: 'Uranium',
  deuterium: 'Deuterium',
};

/** Enough for the first generator within a minute or two. */
/** Enough for the first builds; metal and stone scale with MATERIAL_COST_FACTOR so the start stays the same (playtest 19.3). */
export const STARTING_RESOURCES: Resources = { metal: 15 * MATERIAL_COST_FACTOR, stone: 10 * MATERIAL_COST_FACTOR, coal: 0, naturalGas: 0, oil: 0, uranium: 0, deuterium: 0 };
