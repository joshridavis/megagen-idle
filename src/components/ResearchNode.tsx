import { sprites } from '../assets';
import type { ResearchDef } from '../types/research';
import type { NodeStatus } from './researchStatus';
import { getResearchRewards } from './researchRewards';
import { RESEARCH_ICONS } from './researchSprites';

export const NODE_W = 184;
export const NODE_H = 84;

const STYLE: Record<NodeStatus, string> = {
  completed: 'border-emerald-500 bg-emerald-950/80',
  researching: 'border-sky-400 bg-sky-950/80',
  available: 'border-yellow-400 bg-slate-800 animate-pulse motion-reduce:animate-none',
  unaffordable: 'border-slate-500 bg-slate-800',
  locked: 'border-slate-700 bg-slate-900/80 opacity-60 grayscale',
};

const STATUS_TEXT: Record<NodeStatus, string> = {
  completed: 'completed',
  researching: 'in progress',
  available: 'available',
  unaffordable: 'not affordable yet',
  locked: 'locked',
};

export default function ResearchNode({
  def,
  status,
  x,
  y,
  onOpen,
}: {
  def: ResearchDef;
  status: NodeStatus;
  x: number;
  y: number;
  onOpen: () => void;
}) {
  const reward = getResearchRewards(def)[0];
  return (
    <button
      type="button"
      onClick={onOpen}
      data-testid={`research-node-${def.id}`}
      data-status={status}
      title={def.name}
      aria-label={`${def.name}, needs research level ${def.requiredLevel}, ${STATUS_TEXT[status]}`}
      className={`absolute flex items-center gap-2 rounded-lg border-2 p-2 text-left hover:brightness-125 focus-visible:outline-4 focus-visible:outline-sky-400 ${STYLE[status]}`}
      style={{ left: x, top: y, width: NODE_W, height: NODE_H }}
    >
      <img src={sprites[RESEARCH_ICONS[def.category]]} alt="" width={32} height={32} className="pixelated shrink-0" />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-sm font-semibold">{def.name}</span>
        <span className="block text-xs text-slate-400">
          Needs level {def.requiredLevel} · {def.cost.energy.toLocaleString('en-US')} energy
        </span>
        {reward && <span className="block truncate text-xs text-emerald-300">🎁 {reward.short}</span>}
      </span>
      {status === 'completed' && <img src={sprites.research_check} alt="" width={16} height={16} className="pixelated" />}
      {status === 'locked' && <img src={sprites.research_lock} alt="" width={16} height={16} className="pixelated" />}
    </button>
  );
}
