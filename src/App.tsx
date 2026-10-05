import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { sprites, type SpriteId } from './assets';
import ActiveEffects from './components/ActiveEffects';
import AchievementsPanel from './components/AchievementsPanel';
import ActiveGenerators from './components/ActiveGenerators';
import ClickButton from './components/ClickButton';
import CompletionPanel from './components/CompletionPanel';
import ContractsPanel from './components/ContractsPanel';
import PetsPanel from './components/PetsPanel';
import DepletionWarning from './components/DepletionWarning';
import EnergyDisplay from './components/EnergyDisplay';
import EventLog from './components/EventLog';
import GuidePanel from './components/GuidePanel';
import MapPanel from './components/MapPanel';
import GeneratorGrid from './components/GeneratorGrid';
import ProducerPanel from './components/ProducerPanel';
import ResearchCelebration from './components/ResearchCelebration';
import ResearchChip from './components/ResearchChip';
import ResearchTree from './components/ResearchTree';
import ResourceDisplay from './components/ResourceDisplay';
import RoomPanel from './components/RoomPanel';
import SettingsPanel from './components/SettingsPanel';
import StatisticsPanel from './components/StatisticsPanel';
import Sightings from './components/Sightings';
import Toasts from './components/Toasts';
import CloudDialogs from './components/CloudDialogs';
import { startCloud } from './store/account';
import TutorialCoach from './components/TutorialCoach';
import VersionFooter from './components/VersionFooter';
import WelcomeBack from './components/WelcomeBack';
import { useStore } from './store';
import { formatCompletion, getCompletion } from './utils/completion';
import { useIdleEngine } from './utils/idleEngine';

type Tab = 'generators' | 'map' | 'producers' | 'research' | 'contracts' | 'pets' | 'achievements' | 'completion' | 'stats' | 'guide' | 'settings';
const TABS: { id: Tab; label: string; icon: SpriteId }[] = [
  { id: 'generators', label: 'Generators', icon: 'solar_panel' },
  { id: 'map', label: 'Map', icon: 'tile_ground' },
  { id: 'producers', label: 'Producers', icon: 'producer_mine' },
  { id: 'research', label: 'Research', icon: 'research_advanced' },
  { id: 'contracts', label: 'Contracts', icon: 'capacity_filled' },
  { id: 'pets', label: 'Pets', icon: 'pet_hamster_3' },
  { id: 'achievements', label: 'Achievements', icon: 'achievement_unlocked' },
  { id: 'completion', label: 'Completion', icon: 'research_check' },
  { id: 'stats', label: 'Stats', icon: 'research_efficiency' },
  { id: 'guide', label: 'Guide', icon: 'research_energy' },
  { id: 'settings', label: 'Settings', icon: 'research_materials' },
];

export default function App() {
  useIdleEngine();
  // accounts and cloud saves (0.68): does nothing unless this build has the cloud settings
  useEffect(() => startCloud(), []);
  const [tab, setTab] = useState<Tab>('generators');
  const researching = useStore((s) => s.currentResearch !== null);
  // Completion % on its tab, always visible (like Melvor Idle's completion log).
  const completion = useStore((s) => formatCompletion(getCompletion(s).ratio));
  // The in-game "Reduce motion" setting stills every CSS animation, like the OS setting does (0.41).
  const reduceMotion = useStore((s) => s.settings.reduceMotion);
  useEffect(() => {
    document.documentElement.toggleAttribute('data-reduce-motion', reduceMotion);
  }, [reduceMotion]);
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});
  // Tabs follow the ARIA tabs pattern (0.41): one Tab stop, arrows, Home and End move between tabs.
  const onTabKey = (e: KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === tab);
    const to =
      e.key === 'ArrowRight' ? (i + 1) % TABS.length
      : e.key === 'ArrowLeft' ? (i - 1 + TABS.length) % TABS.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? TABS.length - 1
      : null;
    if (to === null) return;
    e.preventDefault();
    setTab(TABS[to].id);
    tabRefs.current[TABS[to].id]?.focus();
  };
  return (
    <main
      className={`mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-4 sm:p-6 ${researching ? 'pb-28 sm:pb-28' : ''}`}
      data-testid="main"
    >
      <header className="-mb-2 flex flex-col items-center">
        <h1 className="text-3xl font-bold tracking-tight">MegaGen Idle</h1>
      </header>
      {/* The top bar (energy, rate, room, level) stays in view while scrolling (0.43). It sits above
          hovered cards (z-40) and their tooltips; dialogs, toasts and celebrations stay above it (playtest 20). */}
      <div className="sticky top-2 z-[45] -mb-2 self-center" data-testid="top-bar">
        <EnergyDisplay />
      </div>
      <div className="flex flex-col items-center gap-4">
        <ActiveEffects />
        <ClickButton />
        <TutorialCoach />
        <DepletionWarning />
      </div>
      <ResourceDisplay />
      {/* Tabs wrap onto a second row on narrow screens, so nothing scrolls sideways (0.41). */}
      <nav role="tablist" aria-label="Sections" className="flex flex-wrap gap-0.5 border-b border-slate-700" onKeyDown={onTabKey}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            ref={(el) => {
              tabRefs.current[t.id] = el;
            }}
            onClick={() => setTab(t.id)}
            data-tutorial={`tab-${t.id}`}
            className={`relative min-h-11 min-w-11 shrink-0 rounded-t px-2.5 py-2 text-sm font-semibold transition-colors ${tab === t.id ? 'bg-slate-800 text-white shadow-[inset_0_2px_0_0_var(--color-aap-yellow)]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <span className="flex items-center gap-1">
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
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="min-w-0">
        {tab === 'generators' ? (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <GeneratorGrid />
            <div className="flex flex-col gap-6">
              <RoomPanel />
              <ActiveGenerators />
            </div>
          </div>
        ) : tab === 'map' ? (
          <MapPanel
            onSelect={(id) => {
              setTab('generators');
              // after the list renders, bring that generator into view and flash it
              setTimeout(() => {
                const el = document.querySelector(`[data-testid="generator-${id}"]`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el?.classList.add('ring-2', 'ring-yellow-300');
                setTimeout(() => el?.classList.remove('ring-2', 'ring-yellow-300'), 1500);
              }, 50);
            }}
          />
        ) : tab === 'producers' ? (
          <div className="grid gap-6 lg:grid-cols-[3fr_1fr]">
            <ProducerPanel />
            <RoomPanel />
          </div>
        ) : tab === 'research' ? (
          <ResearchTree />
        ) : tab === 'contracts' ? (
          <ContractsPanel />
        ) : tab === 'pets' ? (
          <PetsPanel />
        ) : tab === 'achievements' ? (
          <AchievementsPanel />
        ) : tab === 'completion' ? (
          <CompletionPanel />
        ) : tab === 'stats' ? (
          <StatisticsPanel />
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
      <CloudDialogs />
      <Sightings />
      <WelcomeBack />
    </main>
  );
}
