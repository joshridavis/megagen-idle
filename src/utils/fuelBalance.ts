import { GENERATORS } from '../data/generators';
import { ZONES } from '../data/map';
import { PETS } from '../data/pets';
import { PRODUCERS } from '../data/producers';
import { RESEARCH } from '../data/research';
import type { GeneratorType } from '../types/generator';
import type { ProducerId } from '../types/resource';
import { getBonuses } from './bonuses';
import { productionBoost } from './resourceSystem';

const ALL_RESEARCH = RESEARCH.map((r) => r.id);

/**
 * The biggest output boost a late player can give one producer (1.86): every
 * research done, standing fully in its best zone, and the adult pets that boost
 * it (one for all producers, one for its own resource) among the active pets.
 */
export function lateGameProductionBoost(id: ProducerId): number {
  const resource = PRODUCERS[id].resource;
  const research = productionBoost(resource, getBonuses(ALL_RESEARCH));
  const zone = Math.max(0, ...Object.values(ZONES).filter((z) => z.producers?.includes(id) || z.visitors?.includes(id)).map((z) => z.bonus));
  const pets = PETS.filter((p) => p.bonus.kind === 'production' && (!p.bonus.resource || p.bonus.resource === resource)).map((p) => p.bonusByStage[2]);
  return 1 + research + zone + pets.reduce((a, b) => a + b, 0);
}

/** A generator's fuel burn per hour with every fuel research done (1.86). */
export function lateGameBurnPerHour(type: GeneratorType): number {
  const fuel = Object.values(GENERATORS[type].maintenanceCost ?? {})[0] ?? 0;
  return fuel * (1 - getBonuses(ALL_RESEARCH).fuelEfficiency);
}

/** One producer's output per hour with every late-game boost (1.86). */
export function lateGameOutputPerHour(id: ProducerId): number {
  const p = PRODUCERS[id];
  return ((p.amount * 3600) / p.intervalSeconds) * lateGameProductionBoost(id);
}

/** How many burners of `type` one producer keeps running in the late game, with every boost on both sides (1.86). */
export function burnersFedByOne(id: ProducerId, type: GeneratorType): number {
  return lateGameOutputPerHour(id) / lateGameBurnPerHour(type);
}
