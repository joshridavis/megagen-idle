// Typed sprite index. Components use `sprites.<id>`, never a hard-coded path.
// Explicit imports make a missing file a build error and a missing ID a
// TypeScript error. Keep in sync with sprite-manifest.json (a test checks it).
import energyIcon from './sprites/energy_currency_icon_32.png';
import solarPanel from './sprites/generators/solar_panel.png';
import solarPanelInactive from './sprites/generators/solar_panel_inactive.png';
import windTurbine from './sprites/generators/wind_turbine.png';
import windTurbineInactive from './sprites/generators/wind_turbine_inactive.png';
import coalPlant from './sprites/generators/coal_plant.png';
import coalPlantInactive from './sprites/generators/coal_plant_inactive.png';
import hydroDam from './sprites/generators/hydro_dam.png';
import hydroDamInactive from './sprites/generators/hydro_dam_inactive.png';
import gasPlant from './sprites/generators/gas_plant.png';
import gasPlantInactive from './sprites/generators/gas_plant_inactive.png';
import tidalStation from './sprites/generators/tidal_station.png';
import tidalStationInactive from './sprites/generators/tidal_station_inactive.png';
import resourceCoal from './sprites/resources/coal.png';
import resourceStone from './sprites/resources/stone.png';
import resourceMetal from './sprites/resources/metal.png';
import resourceNaturalGas from './sprites/resources/natural_gas.png';
import producerQuarry from './sprites/producers/quarry.png';
import producerMine from './sprites/producers/mine.png';
import producerCoalMine from './sprites/producers/coal_mine.png';
import roomExpansion from './sprites/ui/room_expansion.png';
import capacityEmpty from './sprites/ui/capacity_empty.png';
import capacityFilled from './sprites/ui/capacity_filled.png';
import capacityCritical from './sprites/ui/capacity_critical.png';
import researchEnergy from './sprites/research/icon_energy.png';
import researchMaterials from './sprites/research/icon_materials.png';
import researchEfficiency from './sprites/research/icon_efficiency.png';
import researchAdvanced from './sprites/research/icon_advanced.png';
import researchProgressSegment from './sprites/research/progress_segment.png';
import researchLock from './sprites/research/lock.png';
import researchCheck from './sprites/research/check.png';
import researchPanelBg from './sprites/research/panel_bg.png';

export const sprites = {
  energy_icon: energyIcon,
  solar_panel: solarPanel,
  solar_panel_inactive: solarPanelInactive,
  wind_turbine: windTurbine,
  wind_turbine_inactive: windTurbineInactive,
  coal_plant: coalPlant,
  coal_plant_inactive: coalPlantInactive,
  hydro_dam: hydroDam,
  hydro_dam_inactive: hydroDamInactive,
  gas_plant: gasPlant,
  gas_plant_inactive: gasPlantInactive,
  tidal_station: tidalStation,
  tidal_station_inactive: tidalStationInactive,
  resource_coal: resourceCoal,
  resource_stone: resourceStone,
  resource_metal: resourceMetal,
  resource_natural_gas: resourceNaturalGas,
  producer_quarry: producerQuarry,
  producer_mine: producerMine,
  producer_coal_mine: producerCoalMine,
  room_expansion: roomExpansion,
  capacity_empty: capacityEmpty,
  capacity_filled: capacityFilled,
  capacity_critical: capacityCritical,
  research_energy: researchEnergy,
  research_materials: researchMaterials,
  research_efficiency: researchEfficiency,
  research_advanced: researchAdvanced,
  research_progress_segment: researchProgressSegment,
  research_lock: researchLock,
  research_check: researchCheck,
  research_panel_bg: researchPanelBg,
} as const;

export type SpriteId = keyof typeof sprites;
