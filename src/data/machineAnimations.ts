import type { SpriteId } from '../assets';
import { GeneratorType } from '../types/generator';
import type { ProducerId } from '../types/resource';

/** A CSS effect drawn on top of a working machine's sprite (1.71). */
export type MachineEffect = 'glint' | 'smoke' | 'steam' | 'glow' | 'shake' | 'bubbles';

/**
 * How a working machine moves on the map (1.71): a second sprite frame that swaps
 * with the still sprite, a CSS effect, or both. `at` places the effect, in percent
 * of the sprite (the chimney top for smoke, the core for a glow). One shared CSS
 * animation per type; no timers.
 */
export interface MachineAnimation {
  /** The second frame; the first is the machine's still (active) sprite. */
  frame2?: SpriteId;
  effect?: MachineEffect;
  at?: { x: number; y: number };
  /** One cycle, in seconds. */
  period: number;
}

export const GENERATOR_ANIMATIONS: Record<GeneratorType, MachineAnimation> = {
  [GeneratorType.SOLAR]: { effect: 'glint', period: 4 },
  [GeneratorType.WIND]: { frame2: 'wind_turbine_2', period: 0.5 },
  [GeneratorType.COAL]: { effect: 'smoke', at: { x: 77, y: 14 }, period: 2.4 },
  [GeneratorType.HYDRO]: { frame2: 'hydro_dam_2', period: 0.8 },
  [GeneratorType.TIDAL]: { frame2: 'tidal_station_2', period: 1 },
  [GeneratorType.GAS]: { effect: 'smoke', at: { x: 86, y: 4 }, period: 2 },
  [GeneratorType.OIL]: { effect: 'smoke', at: { x: 27, y: 12 }, period: 2.6 },
  [GeneratorType.NUCLEAR]: { effect: 'steam', at: { x: 34, y: 14 }, period: 3.2 },
  [GeneratorType.FUSION]: { effect: 'glow', at: { x: 50, y: 47 }, period: 1.6 },
  [GeneratorType.SUPERNOVA]: { effect: 'glow', at: { x: 50, y: 50 }, period: 1.2 },
};

export const PRODUCER_ANIMATIONS: Record<ProducerId, MachineAnimation> = {
  quarry: { effect: 'shake', period: 0.3 },
  mine: { frame2: 'producer_mine_2', period: 1.2 },
  coalMine: { frame2: 'producer_coal_mine_2', period: 0.5 },
  gasWell: { frame2: 'producer_gas_well_2', period: 1.2 },
  oilRig: { frame2: 'producer_oil_rig_2', period: 1.2 },
  uraniumMine: { frame2: 'producer_uranium_mine_2', period: 1.4 },
  deuteriumExtractor: { effect: 'bubbles', at: { x: 27, y: 40 }, period: 1.8 },
};
