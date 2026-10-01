import ActiveGenerators from './components/ActiveGenerators';
import ClickButton from './components/ClickButton';
import DepletionWarning from './components/DepletionWarning';
import EnergyDisplay from './components/EnergyDisplay';
import GeneratorGrid from './components/GeneratorGrid';
import ResourceDisplay from './components/ResourceDisplay';
import { useIdleEngine } from './utils/idleEngine';

export default function App() {
  useIdleEngine();
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">MegaGen Idle</h1>
        <EnergyDisplay />
        <ClickButton />
        <DepletionWarning />
      </header>
      <ResourceDisplay />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <GeneratorGrid />
        <ActiveGenerators />
      </div>
    </main>
  );
}
