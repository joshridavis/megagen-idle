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
import fusionReactor from './sprites/generators/fusion_reactor.png';
import fusionReactorInactive from './sprites/generators/fusion_reactor_inactive.png';
import supernovaCore from './sprites/generators/supernova_core.png';
import supernovaCoreInactive from './sprites/generators/supernova_core_inactive.png';
import resourceDeuterium from './sprites/resources/deuterium.png';
import producerDeuteriumExtractor from './sprites/producers/deuterium_extractor.png';
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
import logoWordmark from './sprites/ui/logo_wordmark.png';
import logoIcon from './sprites/ui/logo_icon.png';
import tileGround from './sprites/map/ground.png';
import mapBird1 from './sprites/events/map_bird_1.png';
import mapBird2 from './sprites/events/map_bird_2.png';
import mapTruck from './sprites/events/map_truck.png';
import mapBolt from './sprites/events/map_bolt.png';
import mapFire1 from './sprites/events/map_fire_1.png';
import mapFire2 from './sprites/events/map_fire_2.png';
import mapStar from './sprites/events/map_star.png';
import mapWave from './sprites/events/map_wave.png';
import tileLocked from './sprites/map/locked.png';
import tilePlateau from './sprites/map/plateau.png';
import tileRidge from './sprites/map/ridge.png';
import tileRiver from './sprites/map/river.png';
import tileCoast from './sprites/map/coast.png';
import tileSea from './sprites/map/sea.png';
import tileExclusion from './sprites/map/exclusion.png';
import decoWarning from './sprites/map/deco_warning.png';
import decoPylon from './sprites/map/deco_pylon.png';
import decorTree from './sprites/map/decor_tree.png';
import decorPond from './sprites/map/decor_pond.png';
import decorWindsock from './sprites/map/decor_windsock.png';
import decorStatue from './sprites/map/decor_statue.png';
import decorFlag from './sprites/map/decor_flag.png';
import decorLamp from './sprites/map/decor_lamp.png';
import decorFlowerbed from './sprites/map/decor_flowerbed.png';
import decorBench from './sprites/map/decor_bench.png';
import decorHedge from './sprites/map/decor_hedge.png';
import decorRockGarden from './sprites/map/decor_rock_garden.png';
import decorPicnic from './sprites/map/decor_picnic.png';
import decorFountain from './sprites/map/decor_fountain.png';
import decorWeatherStation from './sprites/map/decor_weather_station.png';
import decorPlaque from './sprites/map/decor_plaque.png';
import tileCoalfield from './sprites/map/coalfield.png';
import tileOutcrop from './sprites/map/outcrop.png';
import tileOilfield from './sprites/map/oilfield.png';
import tileLake from './sprites/map/lake.png';
import decoRock from './sprites/map/deco_rock.png';
import decoTuft from './sprites/map/deco_tuft.png';
import decoFlower from './sprites/map/deco_flower.png';
import decoBush from './sprites/map/deco_bush.png';
import decoStump from './sprites/map/deco_stump.png';
import decoMushroom from './sprites/map/deco_mushroom.png';
import decoLog from './sprites/map/deco_log.png';
import decoCactus from './sprites/map/deco_cactus.png';
import decoDrygrass from './sprites/map/deco_drygrass.png';
import decoBoulder from './sprites/map/deco_boulder.png';
import decoBentgrass from './sprites/map/deco_bentgrass.png';
import decoReeds from './sprites/map/deco_reeds.png';
import decoLily from './sprites/map/deco_lily.png';
import decoShell from './sprites/map/deco_shell.png';
import decoDriftwood from './sprites/map/deco_driftwood.png';
import decoBoat from './sprites/map/deco_boat.png';
import decoBuoy from './sprites/map/deco_buoy.png';
import sightingSpaceship from './sprites/events/spaceship.png';
import sightingBirds from './sprites/events/birds.png';
import sightingBalloon from './sprites/events/balloon.png';
import sightingPaperPlane from './sprites/events/paper_plane.png';
import sightingCat from './sprites/events/cat.png';
import sightingUfo from './sprites/events/ufo.png';
import sightingWhale from './sprites/events/whale.png';
import sightingMeteor from './sprites/events/meteor.png';
import sightingHotAirBalloon from './sprites/events/hot_air_balloon.png';
import sightingComet from './sprites/events/comet.png';
import sightingDrone from './sprites/events/drone.png';
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
import petMole1 from './sprites/pets/mole_1.png';
import petMole2 from './sprites/pets/mole_2.png';
import petMole3 from './sprites/pets/mole_3.png';
import petToad1 from './sprites/pets/toad_1.png';
import petToad2 from './sprites/pets/toad_2.png';
import petToad3 from './sprites/pets/toad_3.png';
import petMouse1 from './sprites/pets/mouse_1.png';
import petMouse2 from './sprites/pets/mouse_2.png';
import petMouse3 from './sprites/pets/mouse_3.png';
import petPigeon1 from './sprites/pets/pigeon_1.png';
import petPigeon2 from './sprites/pets/pigeon_2.png';
import petPigeon3 from './sprites/pets/pigeon_3.png';
import petOwl1 from './sprites/pets/owl_1.png';
import petOwl2 from './sprites/pets/owl_2.png';
import petOwl3 from './sprites/pets/owl_3.png';
import petAxolotl1 from './sprites/pets/axolotl_1.png';
import petAxolotl2 from './sprites/pets/axolotl_2.png';
import petAxolotl3 from './sprites/pets/axolotl_3.png';
// second frames of working machines on the map (1.71)
import windTurbine2 from './sprites/generators/wind_turbine_2.png';
import hydroDam2 from './sprites/generators/hydro_dam_2.png';
import tidalStation2 from './sprites/generators/tidal_station_2.png';
import coalPlant2 from './sprites/generators/coal_plant_2.png';
import producerQuarry2 from './sprites/producers/quarry_2.png';
import producerMine2 from './sprites/producers/mine_2.png';
import producerCoalMine2 from './sprites/producers/coal_mine_2.png';
import producerGasWell2 from './sprites/producers/gas_well_2.png';
import producerOilRig2 from './sprites/producers/oil_rig_2.png';
import producerUraniumMine2 from './sprites/producers/uranium_mine_2.png';

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
  fusion_reactor: fusionReactor,
  fusion_reactor_inactive: fusionReactorInactive,
  supernova_core: supernovaCore,
  supernova_core_inactive: supernovaCoreInactive,
  resource_coal: resourceCoal,
  resource_stone: resourceStone,
  resource_metal: resourceMetal,
  resource_natural_gas: resourceNaturalGas,
  resource_oil: resourceOil,
  resource_uranium: resourceUranium,
  resource_deuterium: resourceDeuterium,
  producer_quarry: producerQuarry,
  producer_mine: producerMine,
  producer_coal_mine: producerCoalMine,
  producer_gas_well: producerGasWell,
  producer_oil_rig: producerOilRig,
  producer_uranium_mine: producerUraniumMine,
  producer_deuterium_extractor: producerDeuteriumExtractor,
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
  logo_wordmark: logoWordmark,
  logo_icon: logoIcon,
  tile_ground: tileGround,
  map_bird_1: mapBird1,
  map_bird_2: mapBird2,
  map_truck: mapTruck,
  map_bolt: mapBolt,
  map_fire_1: mapFire1,
  map_fire_2: mapFire2,
  map_star: mapStar,
  map_wave: mapWave,
  tile_locked: tileLocked,
  tile_plateau: tilePlateau,
  tile_ridge: tileRidge,
  tile_river: tileRiver,
  tile_coast: tileCoast,
  tile_sea: tileSea,
  tile_exclusion: tileExclusion,
  deco_warning: decoWarning,
  deco_pylon: decoPylon,
  decor_tree: decorTree,
  decor_pond: decorPond,
  decor_windsock: decorWindsock,
  decor_statue: decorStatue,
  decor_flag: decorFlag,
  decor_lamp: decorLamp,
  decor_flowerbed: decorFlowerbed,
  decor_bench: decorBench,
  decor_hedge: decorHedge,
  decor_rock_garden: decorRockGarden,
  decor_picnic: decorPicnic,
  decor_fountain: decorFountain,
  decor_weather_station: decorWeatherStation,
  decor_plaque: decorPlaque,
  tile_coalfield: tileCoalfield,
  tile_outcrop: tileOutcrop,
  tile_oilfield: tileOilfield,
  tile_lake: tileLake,
  deco_rock: decoRock,
  deco_tuft: decoTuft,
  deco_flower: decoFlower,
  deco_bush: decoBush,
  deco_stump: decoStump,
  deco_mushroom: decoMushroom,
  deco_log: decoLog,
  deco_cactus: decoCactus,
  deco_drygrass: decoDrygrass,
  deco_boulder: decoBoulder,
  deco_bentgrass: decoBentgrass,
  deco_reeds: decoReeds,
  deco_lily: decoLily,
  deco_shell: decoShell,
  deco_driftwood: decoDriftwood,
  deco_boat: decoBoat,
  deco_buoy: decoBuoy,
  sighting_spaceship: sightingSpaceship,
  sighting_birds: sightingBirds,
  sighting_balloon: sightingBalloon,
  sighting_paper_plane: sightingPaperPlane,
  sighting_cat: sightingCat,
  sighting_ufo: sightingUfo,
  sighting_whale: sightingWhale,
  sighting_meteor: sightingMeteor,
  sighting_hot_air_balloon: sightingHotAirBalloon,
  sighting_comet: sightingComet,
  sighting_drone: sightingDrone,
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
  pet_mole_1: petMole1,
  pet_mole_2: petMole2,
  pet_mole_3: petMole3,
  pet_toad_1: petToad1,
  pet_toad_2: petToad2,
  pet_toad_3: petToad3,
  pet_mouse_1: petMouse1,
  pet_mouse_2: petMouse2,
  pet_mouse_3: petMouse3,
  pet_pigeon_1: petPigeon1,
  pet_pigeon_2: petPigeon2,
  pet_pigeon_3: petPigeon3,
  pet_owl_1: petOwl1,
  pet_owl_2: petOwl2,
  pet_owl_3: petOwl3,
  pet_axolotl_1: petAxolotl1,
  pet_axolotl_2: petAxolotl2,
  pet_axolotl_3: petAxolotl3,
  wind_turbine_2: windTurbine2,
  hydro_dam_2: hydroDam2,
  tidal_station_2: tidalStation2,
  coal_plant_2: coalPlant2,
  producer_quarry_2: producerQuarry2,
  producer_mine_2: producerMine2,
  producer_coal_mine_2: producerCoalMine2,
  producer_gas_well_2: producerGasWell2,
  producer_oil_rig_2: producerOilRig2,
  producer_uranium_mine_2: producerUraniumMine2,
} as const;

export type SpriteId = keyof typeof sprites;
