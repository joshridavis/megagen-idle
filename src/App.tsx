import { useState } from 'react';
import { sprites, type SpriteId } from './assets';
import ActiveGenerators from './components/ActiveGenerators';
import ClickButton from './components/ClickButton';
import CompletionPanel from './components/CompletionPanel';
import DepletionWarning from './components/DepletionWarning';
import EnergyDisplay from './components/EnergyDisplay';
import EventLog from './components/EventLog';
import GuidePanel from './components/GuidePanel';
import GeneratorGrid from './components/GeneratorGrid';
import ProducerPanel from './components/ProducerPanel';
import ResearchCelebration from './components/ResearchCelebration';
import ResearchChip from './components/ResearchChip';
import ResearchTree from './components/ResearchTree';
import ResourceDisplay from './components/ResourceDisplay';
import RoomPanel from './components/RoomPanel';
import SettingsPanel from './components/SettingsPanel';
import Sightings from './components/Sightings';
import Toasts from './components/Toasts';
import TutorialCoach from './components/TutorialCoach';
import VersionFooter from './components/VersionFooter';
import WelcomeBack from './components/WelcomeBack';
import { useStore } from './store';
import { formatCompletion, getCompletion } from './utils/completion';
import { useIdleEngine } from './utils/idleEngine';

type Tab = 'generators' | 'producers' | 'research' | 'completion' | 'guide' | 'settings';
const TABS: { id: Tab; label: string; icon: SpriteId }[] = [
  { id: 'generators', label: 'Generators', icon: 'solar_panel' },
  { id: 'producers', label: 'Producers', icon: 'producer_mine' },
  { id: 'research', label: 'Research', icon: 'research_advanced' },
  { id: 'completion', label: 'Completion', icon: 'research_check' },
  { id: 'guide', label: 'Guide', icon: 'research_energy' },
  { id: 'settings', label: 'Settings', icon: 'research_materials' },
];

export default function App() {
  useIdleEngine();
  const [tab, setTab] = useState<Tab>('generators');
  const researching = useStore((s) => s.currentResearch !== null);
  // Completion % on its tab, always visible (like Melvor Idle's completion log).
  const completion = useStore((s) => formatCompletion(getCompletion(s).ratio));
  return (
    <main
      className={`mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-4 sm:p-6 ${researching ? 'pb-28 sm:pb-28' : ''}`}
      data-testid="main"
    >
      <header className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">MegaGen Idle</h1>
        <EnergyDisplay />
        <ClickButton />
        <TutorialCoach />
        <DepletionWarning />
      </header>
      <ResourceDisplay />
      <nav role="tablist" aria-label="Sections" className="flex gap-1 border-b border-slate-700 sm:gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            data-tutorial={`tab-${t.id}`}
            className={`min-h-11 min-w-11 shrink-0 rounded-t px-3 py-2 text-sm font-semibold sm:px-4 sm:text-base ${tab === t.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <span className="flex items-center gap-1 sm:gap-1.5">
              <img src={sprites[t.icon]} alt="" width={20} height={20} className="pixelated h-5 w-5 object-contain" data-testid={`tab-icon-${t.id}`} />
              {/* On phones only the active tab shows its label; the rest show their icon. */}
              <span className={tab === t.id ? undefined : 'sr-only sm:not-sr-only'}>{t.label}</span>
              {t.id === 'completion' && (
                <span
                  className={`font-mono text-xs text-sky-200 ${tab === t.id ? 'hidden sm:inline' : ''}`}
                  data-testid="completion-tab-pct"
                >
                  {completion}
                </span>
              )}
            </span>
          </button>
        ))}
      </nav>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'generators' ? (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <GeneratorGrid />
            <div className="flex flex-col gap-6">
              <RoomPanel />
              <ActiveGenerators />
            </div>
          </div>
        ) : tab === 'producers' ? (
          <div className="grid gap-6 lg:grid-cols-[3fr_1fr]">
            <ProducerPanel />
            <RoomPanel />
          </div>
        ) : tab === 'research' ? (
          <ResearchTree />
        ) : tab === 'completion' ? (
          <CompletionPanel />
        ) : tab === 'guide' ? (
          <GuidePanel />
        ) : (
          <SettingsPanel />
        )}
      </div>
      <EventLog />
      <VersionFooter />
      {researching && (
        <div
          data-testid="research-chip-dock"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <div className="pointer-events-auto w-full max-w-md shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <ResearchChip onOpen={() => setTab('research')} />
          </div>
        </div>
      )}
      <ResearchCelebration />
      <Toasts />
      <Sightings />
      <WelcomeBack />
    </main>
  );
}
