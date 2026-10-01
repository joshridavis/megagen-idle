import { useState } from 'react';
import { sprites } from '../assets';
import { PRODUCER_IDS, PRODUCERS } from '../data/producers';
import { RESEARCH_BY_ID } from '../data/research';
import { RESOURCE_NAMES } from '../data/resources';
import { useStore } from '../store';
import type { ProducerId } from '../types/resource';
import { getBonuses } from '../utils/bonuses';
import { getProducerBlock, getProducerCost, type ProducerBlock } from '../utils/producerSystem';
import CostList from './CostList';
import { PRODUCER_SPRITES } from './producerSprites';
import { ScrapButton, ScrapQuantityConfirm } from './Scrap';

const BLOCK_TEXT: Record<ProducerBlock, string> = {
  locked: 'Locked',
  room: 'Not enough room',
  resources: 'Not enough resources',
  energy: 'Not enough energy',
};

function ProducerCard({ id }: { id: ProducerId }) {
  const state = useStore((s) => s);
  const buy = useStore((s) => s.buildProducer);
  const scrap = useStore((s) => s.scrapProducer);
  const [confirming, setConfirming] = useState(false);
  const def = PRODUCERS[id];
  const bonuses = getBonuses(state.completedResearch);
  const owned = state.producers[id] ?? 0;
  const cost = getProducerCost(id, owned, bonuses);
  const block = getProducerBlock(state, id, bonuses);
  const perSecond = def.amount / def.intervalSeconds;
  const resource = RESOURCE_NAMES[def.resource].toLowerCase();

  return (
    <article
      className={`flex flex-col gap-2 rounded-lg border p-3 ${block === 'locked' ? 'border-slate-700 bg-slate-800/50 opacity-60' : 'border-slate-600 bg-slate-800'}`}
      data-testid={`producer-card-${id}`}
    >
      <div className="flex items-center gap-3">
        <img src={sprites[PRODUCER_SPRITES[id]]} alt="" width={48} height={48} className="pixelated" />
        <div>
          <h3 className="font-semibold">{def.name}</h3>
          <div className="text-sm text-slate-300">
            {perSecond >= 0.01
              ? `+${perSecond.toFixed(3)} ${resource}/s each`
              : `+${(perSecond * 3600).toLocaleString('en-US', { maximumFractionDigits: 1 })} ${resource}/h each`}
          </div>
          <div className="text-xs text-slate-400">
            Owned: <strong data-testid={`producer-owned-${id}`}>{owned}</strong> · {def.roomCost} room each
          </div>
        </div>
      </div>
      <div className="text-sm">
        <span className="text-slate-400">Next costs: </span>
        <span className="inline-flex flex-wrap gap-x-2">
          <span className={state.energy < cost.energy ? 'text-red-400' : ''}>{cost.energy.toLocaleString('en-US')} energy</span>
          <CostList cost={cost.resources} have={state.resources} />
        </span>
      </div>
      {block === 'locked' && def.requiresResearch && (
        <div className="text-xs text-sky-300">Needs research: {RESEARCH_BY_ID[def.requiresResearch]?.name}</div>
      )}
      <button
        type="button"
        disabled={block !== null}
        onClick={() => buy(id)}
        className="mt-auto min-h-11 rounded bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        {block ? BLOCK_TEXT[block] : `Build ${def.name}`}
      </button>
      {owned > 0 &&
        (confirming ? (
          <ScrapQuantityConfirm
            name={def.name}
            plural={`${def.name}s`}
            max={owned}
            roomEach={def.roomCost}
            onConfirm={(n) => {
              scrap(id, n);
              setConfirming(false);
            }}
            onCancel={() => setConfirming(false)}
          />
        ) : (
          <div className="flex justify-end">
            <ScrapButton id={`producer-${id}`} name={`${def.name}s`} what="producer" onClick={() => setConfirming(true)} />
          </div>
        ))}
    </article>
  );
}

export default function ProducerPanel() {
  return (
    <section aria-label="Producers" className="w-full">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">Producers</h2>
      <p className="mb-3 text-sm text-slate-400">
        More producers mean more resources. Each takes room, and each one you buy costs more than the last.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PRODUCER_IDS.map((id) => (
          <ProducerCard key={id} id={id} />
        ))}
      </div>
    </section>
  );
}
