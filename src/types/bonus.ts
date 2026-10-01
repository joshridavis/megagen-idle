/** Permanent research bonuses, as fractions (0.1 = 10%). Filled in by 0.10. */
export interface Bonuses {
  buildDiscount: number;
  researchCostReduction: number;
  researchSpeed: number;
  globalEnergy: number;
  clickPower: number;
}

export const NO_BONUSES: Bonuses = {
  buildDiscount: 0,
  researchCostReduction: 0,
  researchSpeed: 0,
  globalEnergy: 0,
  clickPower: 0,
};
