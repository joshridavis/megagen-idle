import type { ResourceId, Resources } from './state';

export type ProducerId = 'quarry' | 'mine' | 'coalMine' | 'gasWell';

export interface ProducerDef {
  id: ProducerId;
  name: string;
  resource: ResourceId;
  /** Units produced every `intervalSeconds`. */
  amount: number;
  intervalSeconds: number;
}

/** A cost or amount in any subset of resources. */
export type ResourceAmounts = Partial<Resources>;
