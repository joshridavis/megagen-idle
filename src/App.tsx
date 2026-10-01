import { useState } from 'react';
import { sprites, type SpriteId } from './assets';
import ActiveGenerators from './components/ActiveGenerators';
import ClickButton from './components/ClickButton';
import DepletionWarning from './components/DepletionWarning';
import EnergyDisplay from './components/EnergyDisplay';
import GeneratorGrid from './components/GeneratorGrid';
import ProducerPanel from './components/ProducerPanel';
import ResearchCelebration from './components/ResearchCelebration';
import ResearchChip from './components/ResearchChip';
import ResearchTree from './components/ResearchTree';
import ResourceDisplay from './components/ResourceDisplay';
import RoomPanel from './components/RoomPanel';
import SettingsPanel from './components/SettingsPanel';
import VersionFooter from './components/VersionFooter';
import WelcomeBack from './components/WelcomeBack';
import { useIdleEngine } from './utils/idleEngine';

type Tab = 'generators' | 'producers' | 'research' | 'settings';
const TABS: { id: Tab; label: string; icon: SpriteId }[] = [
  { id: 'generators', label: 'Generators', icon: 'solar_panel' },
  { id: 'producers', label: 'Producers', icon: 'producer_mine' },
  { id: 'research', label: 'Research', icon: 'research_advanced' },
  { id: 'settings', label: 'Settings', icon: 'research_materials' },
];

export default function App() {
  useIdleEngine();
  const [tab, setTab] = useState<Tab>('generators');
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">MegaGen Idle</h1>
        <EnergyDisplay />
        <ResearchChip onOpen={() => setTab('research')} />
        <ClickButton />
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
            className={`min-h-11 min-w-11 shrink-0 rounded-t px-3 py-2 text-sm font-semibold sm:px-4 sm:text-base ${tab === t.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <span className="flex items-center gap-1 sm:gap-1.5">
              <img src={sprites[t.icon]} alt="" width={20} height={20} className="pixelated h-5 w-5 object-contain" data-testid={`tab-icon-${t.id}`} />
              {/* On phones only the active tab shows its label; the rest show their icon. */}
              <span className={tab === t.id ? undefined : 'sr-only sm:not-sr-only'}>{t.label}</span>
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
        ) : (
          <SettingsPanel />
        )}
      </div>
      <VersionFooter />
      <ResearchCelebration />
      <WelcomeBack />
    </main>
  );
}
