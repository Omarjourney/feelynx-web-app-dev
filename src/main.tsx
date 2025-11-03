import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './globals.css';
import { AuthProvider } from './contexts/AuthContext';
import { enableDemoMocks } from './lib/demo/mockFetch';

// Optional audit shim: expose React on window for headless audit tools
// Some third-party bundles or mis-transpiled modules may expect a global React.
// Enable only when VITE_AUDIT_SHIM=true to avoid polluting production/runtime.
if ((import.meta as any).env?.VITE_AUDIT_SHIM === 'true' && typeof window !== 'undefined') {
  // Dynamically import to avoid adding React to initial chunk unnecessarily.
  import('react')
    .then((mod) => {
      try {
        (window as any).React = (mod as any).default ?? mod;
        console.info('Audit shim enabled: window.React provided');
      } catch {
        // ignore
      }
    })
    .catch(() => {
      // ignore
    });
}

if ((import.meta as any).env?.VITE_DEMO_MODE === 'true') {
  enableDemoMocks();
}
// Global error handlers to capture stacks in headless runs (Puppeteer/Lighthouse)
window.addEventListener('error', (ev) => {
  try {
    // ev.error may be undefined for resource/script load errors
    // Log as much useful information as possible for diagnostics
    console.error('Global error captured:', ev.error ?? ev.message, ev.error?.stack ?? `${ev.filename}:${ev.lineno}:${ev.colno}`);
  } catch (e) {
    // ignore
  }
});

window.addEventListener('unhandledrejection', (ev) => {
  try {
    console.error('Unhandled promise rejection:', ev.reason, ev.reason?.stack ?? 'no-stack');
  } catch (e) {
    // ignore
  }
});

// Enhanced console.error to help diagnose runtime issues in headless or production
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  // Log stack if available
  const stack = args.find((a) => a instanceof Error)?.stack;
  if (stack) {
    originalConsoleError(...args, '\nStack:', stack);
  } else {
    originalConsoleError(...args);
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      {/* main landmark for accessibility and skip link target */}
      <main id="main" role="main">
        <App />
      </main>
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
