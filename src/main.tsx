import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { useStore } from './store';
import { hideBootLoader } from './utils/bootLoader';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// The loading screen (1.49) goes once the save has loaded and the first screen
// with it has been painted (two frames: React commits, then the browser paints).
const done = () =>
  requestAnimationFrame(() =>
    requestAnimationFrame(() => hideBootLoader(performance.now(), useStore.getState().settings.reduceMotion)),
  );
// Purchases (1.95) are re-checked with the store once the save has loaded, so
// the store's record of what is owned replaces the save's.
const ready = () => {
  void useStore.getState().initPurchases();
  done();
};
if (useStore.persist.hasHydrated()) ready();
else useStore.persist.onFinishHydration(ready);
