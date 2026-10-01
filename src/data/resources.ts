import type { ResourceId, Resources } from '../types/state';

export const RESOURCE_IDS: ResourceId[] = ['metal', 'stone', 'coal', 'naturalGas'];

export const RESOURCE_NAMES: Record<ResourceId, string> = {
  metal: 'Metal',
  stone: 'Stone',
  coal: 'Coal',
  naturalGas: 'Natural gas',
};

/** Enough for the first generator within a minute or two. */
export const STARTING_RESOURCES: Resources = { metal: 15, stone: 10, coal: 0, naturalGas: 0 };
