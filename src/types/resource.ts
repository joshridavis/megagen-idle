import type { ResourceId, Resources } from './state';

export type ProducerId = 'quarry' | 'mine' | 'coalMine' | 'gasWell' | 'oilRig' | 'uraniumMine';

export interface ProducerDef {
  id: ProducerId;
  name: string;
  resource: ResourceId;
  /** Units produced every `intervalSeconds`. */
  amount: number;
  intervalSeconds: number;
  /** Room each one takes. */
  roomCost: number;
  /** Cost of the first one bought; each further one costs PRODUCER_COST_GROWTH times more. */
  baseCost: { energy: number; resources: ResourceAmounts };
  /** Research needed before more can be bought. */
  requiresResearch?: string;
}

/** A cost or amount in any subset of resources. */
export type ResourceAmounts = Partial<Resources>;
