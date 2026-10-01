import EnergyDisplay from './components/EnergyDisplay';
import { useIdleEngine } from './utils/idleEngine';

export default function App() {
  useIdleEngine();
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center gap-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">MegaGen Idle</h1>
      <EnergyDisplay />
    </main>
  );
}
