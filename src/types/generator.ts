import type { ResourceAmounts } from './resource';

export enum GeneratorType {
  SOLAR = 'solar',
  WIND = 'wind',
  COAL = 'coal',
}

export interface GeneratorDef {
  type: GeneratorType;
  name: string;
  description: string;
  energyPerSecond: number;
  roomCost: number;
  buildCost: ResourceAmounts;
  /** Resources burned per hour while active. */
  maintenanceCost?: ResourceAmounts;
}

/** A built generator. */
export interface Generator {
  id: string;
  type: GeneratorType;
  isActive: boolean;
  level: number;
  /** Set when the generator was switched off because its fuel ran out. */
  outOfFuel?: boolean;
}
