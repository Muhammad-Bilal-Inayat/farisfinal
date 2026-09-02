import { VisualEditorProvider } from './components/VisualEditorContext';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n.ts';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext.tsx';
import { SiteSettingsProvider } from './context/SiteSettingsContext.tsx';
import { registerServiceWorker } from './utils/registerServiceWorker.ts';
import reportWebVitals from './utils/reportWebVitals';


// Detect stale Vite chunks or multiple React versions and force reload
window.addEventListener('error', (e) => {
  if (
    e.message.includes('Invalid hook call') ||
    e.message.includes("reading 'useContext'") ||
    e.message.includes("Cannot read properties of null (reading 'useState')") ||
    e.message.includes('Minified React error')
  ) {
    console.error('React version mismatch or stale chunk detected. Force reloading...');
    window.location.reload();
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.message && (e.reason.message.includes('Failed to fetch dynamically imported module') || e.reason.message.includes('Importing a module script failed'))) {
    console.error('Stale chunk detected. Force reloading...');
    window.location.reload();
  }
});

// Initialize Service Worker for instant offline caching & fast speed
registerServiceWorker();

// Log Core Web Vitals to console
// reportWebVitals(console.log);

createRoot(document.getElementById('root')!).render(
  <>
    <SiteSettingsProvider>
      <AuthProvider>
        <HelmetProvider>
          <BrowserRouter>
            <VisualEditorProvider isEditMode={new URLSearchParams(window.location.search).get('visualEditor') === 'true'}>
              <App />
            </VisualEditorProvider>
          </BrowserRouter>
        </HelmetProvider>
      </AuthProvider>
    </SiteSettingsProvider>
  </>,
);

