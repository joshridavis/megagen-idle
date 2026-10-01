import type { SpriteId } from '../assets';
import { GeneratorType } from '../types/generator';

/** Active and inactive sprite for each generator type. */
export const GENERATOR_SPRITES: Record<GeneratorType, { active: SpriteId; inactive: SpriteId }> = {
  [GeneratorType.SOLAR]: { active: 'solar_panel', inactive: 'solar_panel_inactive' },
  [GeneratorType.WIND]: { active: 'wind_turbine', inactive: 'wind_turbine_inactive' },
  [GeneratorType.COAL]: { active: 'coal_plant', inactive: 'coal_plant_inactive' },
};
