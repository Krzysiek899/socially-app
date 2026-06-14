import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/runtimeEnv.ts'
import './tokens/primitive.css'
import './tokens/semantic.css'
import './index.css'
import App from './App.tsx'
import { startMockServiceWorker } from './mocks/browser.ts'

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
