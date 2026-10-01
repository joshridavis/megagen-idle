/** Permanent research bonuses, as fractions (0.1 = 10%). Filled in by 0.10. */
export interface Bonuses {
  buildDiscount: number;
  researchCostReduction: number;
  researchSpeed: number;
  globalEnergy: number;
  clickPower: number;
  /** Each click also adds this many seconds of current energy/s (0.25 = a quarter second). */
  clickRateShare: number;
  /** All producers produce more (0.1 = +10%). */
  resourceProduction: number;
  metalProduction: number;
  stoneProduction: number;
  /** Cheaper producers (stacks with buildDiscount, shares its cap). */
  producerDiscount: number;
  /** Generators burn less fuel (0.2 = 20% less). */
  fuelEfficiency: number;
}

export const NO_BONUSES: Bonuses = {
  buildDiscount: 0,
  researchCostReduction: 0,
  researchSpeed: 0,
  globalEnergy: 0,
  clickPower: 0,
  clickRateShare: 0,
  resourceProduction: 0,
  metalProduction: 0,
  stoneProduction: 0,
  producerDiscount: 0,
  fuelEfficiency: 0,
};
