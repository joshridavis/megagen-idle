import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { GROW_HOURS, PETS, PETS_BY_ID, type PetId } from '../data/pets';
import { RESEARCH_BY_ID } from '../data/research';
import { GeneratorType } from '../types/generator';
import type { Contract, GameState } from '../types/state';
import { getBonuses } from './bonuses';
import { getResourceBreakdown } from './breakdown';
import { contractRewards } from './contracts';
import { NO_MODS } from './effectMods';
import { feedPet, petContractBonus, petResearchSpeed, updatePets, withPetMods } from './pets';
import { energyForLevel } from './playerLevel';
import { getResearchDuration, startResearch } from './researchSystem';

const H = 3_600_000;
const NEW: PetId[] = ['mole', 'toad', 'mouse', 'pigeon', 'owl', 'axolotl'];
const s0 = (over: Partial<GameState> = {}): GameState => ({ ...createInitialState(0), ...over });
const withPet = (id: PetId, stage = 3, over: Partial<GameState> = {}): GameState =>
  s0({ pets: { active: id, extra: [], slots: 1, owned: { [id]: { stage, growUntil: null, foundAt: 0 } } }, ...over });

describe('more pets (1.56)', () => {
  it('six new pets, each with a bonus no other pet gives', () => {
    for (const id of NEW) expect(PETS_BY_ID[id]).toBeDefined();
    const key = (id: PetId) => JSON.stringify(PETS_BY_ID[id].bonus);
    const keys = PETS.map((p) => key(p.id));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('each new pet is found by its condition', () => {
    const cases: [PetId, Partial<GameState>][] = [
      ['mole', { lifetimeEnergy: energyForLevel(15) }],
      ['toad', { records: { builtTypes: [GeneratorType.GAS], bestLevel: {} } }],
      ['mouse', { completedResearch: ['automated_labs'] }],
      ['pigeon', { contracts: { ...createInitialState(0).contracts, done: 25 } }],
      ['owl', { lifetimeEnergy: energyForLevel(35) }],
      ['axolotl', { records: { builtTypes: [GeneratorType.FUSION], bestLevel: {} } }],
    ];
    for (const [id, over] of cases) {
      expect(updatePets(s0(), 1).found, `${id} not found too early`).not.toContain(id);
      expect(updatePets(s0(over), 1).found, id).toContain(id);
    }
  });

  it('each new pet is fed with its food and grows to adult', () => {
    for (const id of NEW) {
      let s = withPet(id, 1, { energy: 1e12, resources: { ...s0().resources, coal: 1e9, stone: 1e9, metal: 1e9 } });
      s = feedPet(s, id, 0);
      expect(s.pets.owned[id]!.growUntil, id).toBe(GROW_HOURS[0] * H);
      s = updatePets(s, GROW_HOURS[0] * H).state;
      s = feedPet(s, id, GROW_HOURS[0] * H);
      s = updatePets(s, (GROW_HOURS[0] + GROW_HOURS[1]) * H).state;
      expect(s.pets.owned[id]!.stage, id).toBe(3);
    }
  });

  it('Coal Mole and Bubble Toad boost coal and gas production', () => {
    expect(withPetMods(NO_MODS, withPet('mole')).resource.coal).toBeCloseTo(PETS_BY_ID.mole.bonusByStage[2]);
    expect(withPetMods(NO_MODS, withPet('toad')).resource.naturalGas).toBeCloseTo(PETS_BY_ID.toad.bonusByStage[2]);
    const b = getResourceBreakdown(withPet('mole'), 'coal');
    expect(b.modifiers.some((m) => m.source.includes('Coal Mole'))).toBe(true);
  });

  it('Soot Owl and Atomic Axolotl boost their generator types', () => {
    const owl = withPetMods(NO_MODS, withPet('owl')).generator;
    for (const g of [GeneratorType.COAL, GeneratorType.GAS, GeneratorType.OIL]) expect(owl[g]).toBeCloseTo(PETS_BY_ID.owl.bonusByStage[2]);
    const ax = withPetMods(NO_MODS, withPet('axolotl')).generator;
    for (const g of [GeneratorType.NUCLEAR, GeneratorType.FUSION]) expect(ax[g]).toBeCloseTo(PETS_BY_ID.axolotl.bonusByStage[2]);
    expect(ax[GeneratorType.SOLAR]).toBeUndefined();
  });

  it('Lab Mouse makes research faster, by stage', () => {
    const def = RESEARCH_BY_ID.basic_solar;
    const plain = getResearchDuration(def, getBonuses([]));
    expect(petResearchSpeed(withPet('mouse', 1))).toBeCloseTo(PETS_BY_ID.mouse.bonusByStage[0]);
    const s = startResearch(
      withPet('mouse', 3, {
        energy: 1e9,
        resources: { ...s0().resources, metal: 1e6, stone: 1e6 },
        activeGenerators: [{ id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 }],
      }),
      'basic_solar',
      0,
    );
    expect(s.currentResearch!.duration).toBeCloseTo(plain / (1 + PETS_BY_ID.mouse.bonusByStage[2]));
    expect(petResearchSpeed(s0())).toBe(0);
  });

  it('Courier Pigeon gives bigger contract bundles and longer boosts', () => {
    const c = { id: 'c1', tier: 1 } as Contract;
    const plain = contractRewards(s0(), c);
    const pigeon = contractRewards(withPet('pigeon'), c);
    const f = 1 + petContractBonus(withPet('pigeon'));
    expect(f).toBeCloseTo(1 + PETS_BY_ID.pigeon.bonusByStage[2]);
    expect(pigeon.boostMinutes).toBeCloseTo(plain.boostMinutes * f);
    expect(pigeon.bundle.metal!).toBeGreaterThan(plain.bundle.metal!);
    expect(pigeon.points).toBe(plain.points);
  });
});
