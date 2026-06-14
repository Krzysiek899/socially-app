import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/runtimeEnv.ts'
import ReactGA from 'react-ga4'
import './tokens/primitive.css'
import './tokens/semantic.css'
import './index.css'
import App from './App.tsx'
import { startMockServiceWorker } from './mocks/browser.ts'

// --- GA4 Initialization ---
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (gaMeasurementId) {
  ReactGA.initialize(gaMeasurementId);
}

const bootstrap = async () => {
  if (import.meta.env.DEV) {
    await startMockServiceWorker();
  }

  const rootEl = document.getElementById('root')!;
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
};

void bootstrap();