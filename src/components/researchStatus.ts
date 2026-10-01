import type { GameState } from '../types/state';
import { getResearchBlock } from '../utils/researchSystem';

export type NodeStatus = 'completed' | 'researching' | 'available' | 'unaffordable' | 'locked';

/** Visual state of a research node. */
export function getNodeStatus(state: GameState, id: string): NodeStatus {
  if (state.completedResearch.includes(id)) return 'completed';
  if (state.currentResearch?.id === id) return 'researching';
  const block = getResearchBlock(state, id);
  if (block === null) return 'available';
  if (block === 'cost' || block === 'busy') return 'unaffordable';
  return 'locked';
}
