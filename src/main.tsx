import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

// Enterprise global handler for Vite dynamic preload errors (stale chunk recovery across deployments)
window.addEventListener('vite:preloadError', () => {
  const lastReload = parseInt(sessionStorage.getItem('cm_chunk_reload_ts') || '0', 10);
  if (Date.now() - lastReload > 3000) {
    sessionStorage.setItem('cm_chunk_reload_ts', String(Date.now()));
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

