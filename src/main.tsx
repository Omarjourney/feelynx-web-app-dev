import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './globals.css';
import { AuthProvider } from './contexts/AuthContext';
import { enableDemoMocks } from './lib/demo/mockFetch';

if ((import.meta as any).env?.VITE_DEMO_MODE === 'true') {
  enableDemoMocks();
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);

// Register SW only in production to avoid dev caching issues
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .catch((err) => console.error('Service worker registration failed', err));
  });
}
