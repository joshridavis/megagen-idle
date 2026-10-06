import { describe, expect, it, vi } from 'vitest';
import { STARTING_RESOURCES } from '../data/resources';
import { EVENTS_BY_ID } from '../data/events';
import { createInitialState } from '../data/initialState';
import { GROW_HOURS, PET_SLOT_UPGRADES, PET_STAGE_MULTIPLIERS, PETS, PETS_BY_ID } from '../data/pets';
import { migrateSave } from '../store/migrations';
import { useStore } from '../store';
import { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { getClickValue } from './bonuses';
import { getCompletion } from './completion';
import { NO_MODS } from './effectMods';
import { applyEventEffect } from './eventEffects';
import { energyForLevel } from './playerLevel';
import { activePetBonus, activePets, addPet, buyPetSlot, canFeed, feedCost, feedPet, growingPet, otherPetGrowing, petClickBonus, petSlotBlock, petSlots, restPet, setActivePet, updatePets, withPetMods } from './pets';
import { getEnergyBreakdown } from './breakdown';
import { eligibleEvents } from './randomEvents';
import { advanceTime, deriveRates } from './simulation';

vi.mock('../data/playerLevel', async (orig) => ({ ...(await orig<object>()), ENERGY_BONUS_PER_LEVEL: 0 }));

const H = 3_600_000;
const s0 = (over: Partial<GameState> = {}): GameState => ({ ...createInitialState(0), ...over });

describe('energy pets (0.92)', () => {
  it('has 14 pets on the energy theme, each with a hint and three stages of bonus', () => {
    expect(PETS).toHaveLength(14);
    for (const p of PETS) {
      expect(p.hint.length).toBeGreaterThan(5);
      expect(p.bonusByStage[0]).toBeLessThan(p.bonusByStage[2]);
      expect(p.feedCost[0]).toBeLessThan(p.feedCost[1]);
    }
  });

  it('are found when their condition is met, and the first one becomes active', () => {
    const s = s0({ lifetimeEnergy: energyForLevel(8), records: { builtTypes: [GeneratorType.TIDAL], bestLevel: {} } });
    const r = updatePets(s, 5);
    expect(r.found.sort()).toEqual(['eel', 'hamster']);
    expect(r.state.pets.active).toBe('hamster');
    expect(updatePets(r.state, 6).found).toEqual([]);
  });

  it('event pets join through their rare event, which stops rolling once found', () => {
    const s = s0({ activeGenerators: [{ id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 }] });
    expect(eligibleEvents(s, { foreground: true }).map((e) => e.id)).toContain('firefly_swarm');
    const found = applyEventEffect(s, EVENTS_BY_ID.firefly_swarm, 0, () => 0).state;
    expect(found.pets.owned.firefly?.stage).toBe(1);
    expect(eligibleEvents(found, { foreground: true }).map((e) => e.id)).not.toContain('firefly_swarm');
  });

  it('feeding costs food, then the pet grows after real time, offline too', () => {
    let s = addPet(s0({ energy: 1e6 }), 'hamster', 0);
    expect(feedCost(s, 'hamster')).toBe(PETS_BY_ID.hamster.feedCost[0]);
    s = feedPet(s, 'hamster', 0);
    expect(s.energy).toBe(1e6 - PETS_BY_ID.hamster.feedCost[0]);
    expect(feedCost(s, 'hamster')).toBeNull(); // growing
    expect(updatePets(s, GROW_HOURS[0] * H - 1).grown).toEqual([]);
    const grown = updatePets(s, GROW_HOURS[0] * H);
    expect(grown.grown).toEqual(['hamster']);
    expect(grown.state.pets.owned.hamster?.stage).toBe(2);
    expect(canFeed(s0({ energy: 1 }), 'hamster')).toBe(false);
  });

  it('only the active pet gives its bonus, which grows with its stage', () => {
    let s = addPet(addPet(s0(), 'eel', 0), 'cat', 0);
    expect(activePetBonus(s)?.def.id).toBe('eel');
    expect(withPetMods(NO_MODS, s).generator.hydro).toBeCloseTo(PETS_BY_ID.eel.bonusByStage[0]);
    s = setActivePet(s, 'cat');
    expect(withPetMods(NO_MODS, s).allEnergy).toBeCloseTo(0.0075, 6);
    expect(withPetMods(NO_MODS, s).generator.hydro).toBeUndefined();
    const adult = { ...s, pets: { ...s.pets, owned: { ...s.pets.owned, cat: { stage: 3, growUntil: null, foundAt: 0 } } } };
    expect(withPetMods(NO_MODS, adult).allEnergy).toBeCloseTo(0.03, 6);
  });

  it('pet bonuses apply to energy, production and clicks', () => {
    const solar = { id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 };
    const withCat = deriveRates(setActivePet(addPet(s0({ activeGenerators: [solar] }), 'cat', 0), 'cat'));
    expect(withCat.energyPerSecond).toBeCloseTo(0.5 * (1 + PETS_BY_ID.cat.bonusByStage[0]), 6);
    const dog = addPet(s0(), 'robodog', 0);
    const plain = advanceTime(s0(), 3600, 3600_000).state.resources.stone;
    expect(advanceTime(dog, 3600, 3600_000).state.resources.stone).toBeCloseTo(STARTING_RESOURCES.stone + (plain - STARTING_RESOURCES.stone) * (1 + PETS_BY_ID.robodog.bonusByStage[0]));
    const ham = addPet(s0(), 'hamster', 0);
    expect(getClickValue([], 0, petClickBonus(ham))).toBeCloseTo(1.5); // hamster baby: +50% (adult +200%)
  });

  it('count toward completion and are saved', () => {
    const s = addPet(s0(), 'eel', 0);
    const part = (st: GameState, label: string) => getCompletion(st).parts.find((p) => p.label === label)!;
    expect(part(s, 'Pets found')).toMatchObject({ done: 1, total: PETS.length });
    expect(part(s, 'Pets fully grown').done).toBe(0);
    const v13 = { ...createInitialState(0) } as Record<string, unknown>;
    delete v13.pets;
    expect(migrateSave(v13, 13).pets).toEqual({ owned: {}, active: null, extra: [], slots: 1 });
  });

  it('the store finds, feeds and switches pets', () => {
    useStore.getState().resetGame();
    useStore.setState({ lifetimeEnergy: energyForLevel(8), energy: 1e6 });
    useStore.getState().tickPets(10);
    expect(useStore.getState().pets.owned.hamster).toBeDefined();
    expect(useStore.getState().feedPet('hamster', 10)).toBe(true);
    expect(useStore.getState().toasts.some((t) => t.text.includes('Wheel Hamster'))).toBe(true);
  });
});

describe('one pet grows at a time, and maturity clearly pays (1.57)', () => {
  it('a second pet cannot start growing while one grows', () => {
    let s = addPet(addPet(s0({ energy: 1e9, resources: { ...createInitialState(0).resources, metal: 1e6 } }), 'hamster', 0), 'eel', 0);
    expect(canFeed(s, 'eel')).toBe(true);
    s = feedPet(s, 'hamster', 0);
    expect(growingPet(s)).toEqual({ id: 'hamster', until: GROW_HOURS[0] * H });
    expect(otherPetGrowing(s, 'eel')).toEqual({ id: 'hamster', until: GROW_HOURS[0] * H });
    expect(otherPetGrowing(s, 'hamster')).toBeNull();
    expect(canFeed(s, 'eel')).toBe(false);
    expect(feedPet(s, 'eel', 0)).toBe(s);
    // once grown, the other can start
    const grown = updatePets(s, GROW_HOURS[0] * H).state;
    expect(growingPet(grown)).toBeNull();
    expect(canFeed(grown, 'eel')).toBe(true);
  });

  it('a save with several pets growing (from before 1.57) lets them all finish', () => {
    const owned = {
      hamster: { stage: 1, growUntil: 5 * H, foundAt: 0 },
      eel: { stage: 2, growUntil: 6 * H, foundAt: 0 },
    };
    const s = s0({ pets: { owned, active: 'hamster' } });
    const r = updatePets(s, 6 * H);
    expect(r.grown.sort()).toEqual(['eel', 'hamster']);
    expect(r.state.pets.owned.hamster?.stage).toBe(2);
    expect(r.state.pets.owned.eel?.stage).toBe(3);
  });

  it('every pet gives Baby 1x, Young 2x and Adult 4x of a base value', () => {
    expect(PET_STAGE_MULTIPLIERS).toEqual([1, 2, 4]);
    for (const p of PETS) {
      const [baby, young, adult] = p.bonusByStage;
      expect(young / baby).toBeCloseTo(2, 9);
      expect(adult / baby).toBeCloseTo(4, 9);
    }
  });
});

describe('up to 3 active pets, slots bought with energy (1.59)', () => {
  const adult = { stage: 3, growUntil: null, foundAt: 0 };
  const zoo = (over: Partial<GameState> = {}) =>
    s0({ pets: { owned: { cat: adult, robodog: adult, eel: adult, hamster: adult }, active: 'cat' }, ...over });

  it('slots are bought with energy only, and need a player level', () => {
    const [two, three] = PET_SLOT_UPGRADES;
    expect(petSlots(zoo())).toBe(1); // an old save without slots has 1
    const low = zoo({ energy: two.energy, lifetimeEnergy: energyForLevel(two.playerLevel - 1) });
    expect(petSlotBlock(low)).toBe(`Needs player level ${two.playerLevel}.`);
    expect(buyPetSlot(low)).toBe(low);
    const poor = zoo({ energy: two.energy - 1, lifetimeEnergy: energyForLevel(two.playerLevel) });
    expect(petSlotBlock(poor)).toBe('Not enough energy.');
    const ok = zoo({ energy: two.energy + 5, lifetimeEnergy: energyForLevel(three.playerLevel) });
    const bought = buyPetSlot(ok);
    expect(petSlots(bought)).toBe(2);
    expect(bought.energy).toBe(5);
    expect(bought.resources).toEqual(ok.resources);
    const third = buyPetSlot({ ...bought, energy: three.energy });
    expect(petSlots(third)).toBe(3);
    expect(petSlotBlock(third)).toBe('All slots owned.');
  });

  it('bonuses of up to 3 different pets stack; a pet fills one slot only', () => {
    let s = zoo({ pets: { ...zoo().pets, slots: 3 } });
    s = setActivePet(setActivePet(s, 'robodog'), 'eel');
    expect(activePets(s)).toEqual(['cat', 'robodog', 'eel']);
    expect(setActivePet(s, 'eel')).toBe(s); // already active
    const mods = withPetMods(NO_MODS, s);
    expect(mods.allEnergy).toBeCloseTo(PETS_BY_ID.cat.bonusByStage[2]);
    expect(mods.allProduction).toBeCloseTo(PETS_BY_ID.robodog.bonusByStage[2]);
    expect(mods.generator.hydro).toBeCloseTo(PETS_BY_ID.eel.bonusByStage[2]);
    // full: a new one takes the first slot's place
    const swapped = setActivePet(s, 'hamster');
    expect(activePets(swapped)).toEqual(['hamster', 'robodog', 'eel']);
    expect(petClickBonus(swapped)).toBeCloseTo(PETS_BY_ID.hamster.bonusByStage[2]);
    // resting frees a slot; the last active pet stays
    const rested = restPet(s, 'cat');
    expect(activePets(rested)).toEqual(['robodog', 'eel']);
    const one = restPet(restPet(rested, 'robodog'), 'eel');
    expect(activePets(one)).toEqual(['eel']);
    // a slot list with a duplicate counts the pet once
    expect(activePets({ pets: { owned: { cat: adult }, active: 'cat', extra: ['cat'], slots: 3 } })).toEqual(['cat']);
  });

  it('the energy breakdown lists each active pet', () => {
    const solar = { id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 };
    const s = zoo({ activeGenerators: [solar], pets: { owned: { cat: adult, firefly: adult }, active: 'cat', extra: ['firefly'], slots: 2 } });
    const sources = getEnergyBreakdown(s).modifiers.map((m) => m.source);
    expect(sources.some((x) => x.includes('Static Cat'))).toBe(true);
    expect(sources.some((x) => x.includes('Firefly Swarm'))).toBe(true);
  });

  it('old saves keep their one active pet; completion counts the two slots', () => {
    const old = { ...createInitialState(0), pets: { owned: { cat: adult }, active: 'cat' } } as unknown as Record<string, unknown>;
    const m = migrateSave(old, 21);
    expect(activePets(m)).toEqual(['cat']);
    expect(petSlots(m)).toBe(1);
    const part = (st: GameState) => getCompletion(st).parts.find((p) => p.label === 'Pet slots')!;
    expect(part(m)).toMatchObject({ done: 0, total: 2 });
    expect(part({ ...m, pets: { ...m.pets, slots: 3 } }).done).toBe(2);
    expect(activePetBonus(m)?.def.id).toBe('cat');
  });
});
