import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/runtimeEnv.ts'
import ReactGA from 'react-ga4'
import './tokens/primitive.css'
import './tokens/semantic.css'
import './index.css'
import App from './App.tsx'
import { startMockServiceWorker } from './mocks/browser.ts'

// --- Sekcja Inicjalizacji i Diagnostyki GA4 ---
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

console.log("--- DIAGNOSTYKA GA4 ---");
console.log("1. Wczytany klucz z .env:", gaMeasurementId);

if (gaMeasurementId) {
  console.log("2. Inicjalizacja ReactGA uruchomiona pomyślnie!");
  ReactGA.initialize(gaMeasurementId);
} else {
  console.error("2. BŁĄD: Klucz to 'undefined'. Vite nie widzi pliku .env!");
}
// ----------------------------------------------

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