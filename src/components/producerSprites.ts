import type { SpriteId } from '../assets';
import type { ProducerId } from '../types/resource';

export const PRODUCER_SPRITES: Record<ProducerId, SpriteId> = {
  quarry: 'producer_quarry',
  mine: 'producer_mine',
  coalMine: 'producer_coal_mine',
  gasWell: 'producer_gas_well',
};
