import { useMemo, useState } from 'react';
import { sprites } from '../assets';
import { RESEARCH, RESEARCH_BY_ID } from '../data/research';
import { useStore } from '../store';
import { computeResearchLayout } from '../utils/researchLayout';
import { researchProgress } from '../utils/researchSystem';
import ProgressBar from './ProgressBar';
import ResearchNode, { NODE_H, NODE_W } from './ResearchNode';
import ResearchPanel from './ResearchPanel';
import { getNodeStatus } from './researchStatus';

const GAP_X = 56;
const GAP_Y = 20;
const PAD = 16;

export default function ResearchTree() {
  const state = useStore((s) => s);
  const [openId, setOpenId] = useState<string | null>(null);
  const layout = useMemo(() => computeResearchLayout(RESEARCH), []);
  const pos = (id: string) => {
    const p = layout.positions[id];
    return { x: PAD + p.col * (NODE_W + GAP_X), y: PAD + p.row * (NODE_H + GAP_Y) };
  };
  const width = PAD * 2 + layout.cols * NODE_W + Math.max(0, layout.cols - 1) * GAP_X;
  const height = PAD * 2 + layout.rows * NODE_H + Math.max(0, layout.rows - 1) * GAP_Y;
  const current = state.currentResearch;

  return (
    <section aria-label="Research" className="w-full">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Research</h2>
        <span className="text-right text-sm">
          <span data-testid="research-level-label" className="block">
            Your research level: <strong data-testid="research-level">{state.researchLevel}</strong>
          </span>
          {current && (
            <span data-testid="research-level-next" className="block text-xs text-slate-400">
              Rises to {state.researchLevel + 1} when {RESEARCH_BY_ID[current.id]?.name} finishes
            </span>
          )}
        </span>
      </div>
      {current && (
        <div className="mb-3 rounded-lg bg-slate-800 p-3 text-sm">
          <div className="mb-1">Researching: {RESEARCH_BY_ID[current.id]?.name}</div>
          <ProgressBar value={researchProgress(state, state.lastSavedTimestamp)} label="Current research progress" />
        </div>
      )}
      <div
        className="overflow-x-auto rounded-lg border border-slate-700"
        style={{ backgroundImage: `url(${sprites.research_panel_bg})` }}
      >
        <div className="relative" style={{ width, height }}>
          <svg className="pointer-events-none absolute inset-0" width={width} height={height} aria-hidden="true">
            {layout.edges.map(({ from, to }) => {
              const a = pos(from);
              const b = pos(to);
              const x1 = a.x + NODE_W;
              const y1 = a.y + NODE_H / 2;
              const x2 = b.x;
              const y2 = b.y + NODE_H / 2;
              const mid = (x1 + x2) / 2;
              const done = state.completedResearch.includes(from);
              return (
                <path
                  key={`${from}-${to}`}
                  d={`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`}
                  fill="none"
                  stroke={done ? '#59c135' : '#8b93af'}
                  strokeWidth={3}
                  strokeDasharray={done ? undefined : '6 4'}
                />
              );
            })}
          </svg>
          {RESEARCH.map((def) => {
            const p = pos(def.id);
            return (
              <ResearchNode
                key={def.id}
                def={def}
                status={getNodeStatus(state, def.id)}
                x={p.x}
                y={p.y}
                onOpen={() => setOpenId(def.id)}
              />
            );
          })}
        </div>
      </div>
      {openId && <ResearchPanel id={openId} onClose={() => setOpenId(null)} />}
    </section>
  );
}
