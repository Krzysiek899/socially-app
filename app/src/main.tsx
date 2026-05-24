import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tokens/primitive.css'
import './tokens/semantic.css'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')!;
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
