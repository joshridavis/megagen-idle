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
import oilPlant from './sprites/generators/oil_plant.png';
import oilPlantInactive from './sprites/generators/oil_plant_inactive.png';
import nuclearPlant from './sprites/generators/nuclear_plant.png';
import nuclearPlantInactive from './sprites/generators/nuclear_plant_inactive.png';
import resourceCoal from './sprites/resources/coal.png';
import resourceStone from './sprites/resources/stone.png';
import resourceMetal from './sprites/resources/metal.png';
import resourceNaturalGas from './sprites/resources/natural_gas.png';
import resourceOil from './sprites/resources/oil.png';
import resourceUranium from './sprites/resources/uranium.png';
import producerQuarry from './sprites/producers/quarry.png';
import producerMine from './sprites/producers/mine.png';
import producerCoalMine from './sprites/producers/coal_mine.png';
import producerGasWell from './sprites/producers/gas_well.png';
import producerOilRig from './sprites/producers/oil_rig.png';
import producerUraniumMine from './sprites/producers/uranium_mine.png';
import roomExpansion from './sprites/ui/room_expansion.png';
import capacityEmpty from './sprites/ui/capacity_empty.png';
import capacityFilled from './sprites/ui/capacity_filled.png';
import capacityCritical from './sprites/ui/capacity_critical.png';
import capacityBuilding from './sprites/ui/capacity_building.png';
import researchEnergy from './sprites/research/icon_energy.png';
import researchMaterials from './sprites/research/icon_materials.png';
import researchEfficiency from './sprites/research/icon_efficiency.png';
import researchAdvanced from './sprites/research/icon_advanced.png';
import researchProgressSegment from './sprites/research/progress_segment.png';
import researchLock from './sprites/research/lock.png';
import researchCheck from './sprites/research/check.png';
import researchPanelBg from './sprites/research/panel_bg.png';
import achievementUnlocked from './sprites/ui/achievement_unlocked.png';
import achievementLocked from './sprites/ui/achievement_locked.png';
import sightingSpaceship from './sprites/events/spaceship.png';
import sightingBirds from './sprites/events/birds.png';
import sightingBalloon from './sprites/events/balloon.png';
import sightingPaperPlane from './sprites/events/paper_plane.png';
import sightingCat from './sprites/events/cat.png';
import sightingUfo from './sprites/events/ufo.png';
import sightingWhale from './sprites/events/whale.png';
import sightingMeteor from './sprites/events/meteor.png';
import petHamster1 from './sprites/pets/hamster_1.png';
import petHamster2 from './sprites/pets/hamster_2.png';
import petHamster3 from './sprites/pets/hamster_3.png';
import petFirefly1 from './sprites/pets/firefly_1.png';
import petFirefly2 from './sprites/pets/firefly_2.png';
import petFirefly3 from './sprites/pets/firefly_3.png';
import petTortoise1 from './sprites/pets/tortoise_1.png';
import petTortoise2 from './sprites/pets/tortoise_2.png';
import petTortoise3 from './sprites/pets/tortoise_3.png';
import petEel1 from './sprites/pets/eel_1.png';
import petEel2 from './sprites/pets/eel_2.png';
import petEel3 from './sprites/pets/eel_3.png';
import petRobodog1 from './sprites/pets/robodog_1.png';
import petRobodog2 from './sprites/pets/robodog_2.png';
import petRobodog3 from './sprites/pets/robodog_3.png';
import petCat1 from './sprites/pets/cat_1.png';
import petCat2 from './sprites/pets/cat_2.png';
import petCat3 from './sprites/pets/cat_3.png';
import petBeetle1 from './sprites/pets/beetle_1.png';
import petBeetle2 from './sprites/pets/beetle_2.png';
import petBeetle3 from './sprites/pets/beetle_3.png';
import petJellyfish1 from './sprites/pets/jellyfish_1.png';
import petJellyfish2 from './sprites/pets/jellyfish_2.png';
import petJellyfish3 from './sprites/pets/jellyfish_3.png';

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
  oil_plant: oilPlant,
  oil_plant_inactive: oilPlantInactive,
  nuclear_plant: nuclearPlant,
  nuclear_plant_inactive: nuclearPlantInactive,
  resource_coal: resourceCoal,
  resource_stone: resourceStone,
  resource_metal: resourceMetal,
  resource_natural_gas: resourceNaturalGas,
  resource_oil: resourceOil,
  resource_uranium: resourceUranium,
  producer_quarry: producerQuarry,
  producer_mine: producerMine,
  producer_coal_mine: producerCoalMine,
  producer_gas_well: producerGasWell,
  producer_oil_rig: producerOilRig,
  producer_uranium_mine: producerUraniumMine,
  room_expansion: roomExpansion,
  capacity_empty: capacityEmpty,
  capacity_filled: capacityFilled,
  capacity_critical: capacityCritical,
  capacity_building: capacityBuilding,
  research_energy: researchEnergy,
  research_materials: researchMaterials,
  research_efficiency: researchEfficiency,
  research_advanced: researchAdvanced,
  research_progress_segment: researchProgressSegment,
  research_lock: researchLock,
  research_check: researchCheck,
  research_panel_bg: researchPanelBg,
  achievement_unlocked: achievementUnlocked,
  achievement_locked: achievementLocked,
  sighting_spaceship: sightingSpaceship,
  sighting_birds: sightingBirds,
  sighting_balloon: sightingBalloon,
  sighting_paper_plane: sightingPaperPlane,
  sighting_cat: sightingCat,
  sighting_ufo: sightingUfo,
  sighting_whale: sightingWhale,
  sighting_meteor: sightingMeteor,
  pet_hamster_1: petHamster1,
  pet_hamster_2: petHamster2,
  pet_hamster_3: petHamster3,
  pet_firefly_1: petFirefly1,
  pet_firefly_2: petFirefly2,
  pet_firefly_3: petFirefly3,
  pet_tortoise_1: petTortoise1,
  pet_tortoise_2: petTortoise2,
  pet_tortoise_3: petTortoise3,
  pet_eel_1: petEel1,
  pet_eel_2: petEel2,
  pet_eel_3: petEel3,
  pet_robodog_1: petRobodog1,
  pet_robodog_2: petRobodog2,
  pet_robodog_3: petRobodog3,
  pet_cat_1: petCat1,
  pet_cat_2: petCat2,
  pet_cat_3: petCat3,
  pet_beetle_1: petBeetle1,
  pet_beetle_2: petBeetle2,
  pet_beetle_3: petBeetle3,
  pet_jellyfish_1: petJellyfish1,
  pet_jellyfish_2: petJellyfish2,
  pet_jellyfish_3: petJellyfish3,
} as const;

export type SpriteId = keyof typeof sprites;
