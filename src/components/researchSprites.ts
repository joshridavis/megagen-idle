import type { SpriteId } from '../assets';
import type { ResearchCategory } from '../types/research';

export const RESEARCH_ICONS: Record<ResearchCategory, SpriteId> = {
  energy: 'research_energy',
  materials: 'research_materials',
  efficiency: 'research_efficiency',
  advanced: 'research_advanced',
};
