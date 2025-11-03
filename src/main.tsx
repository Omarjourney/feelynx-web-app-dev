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
        // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.error('Global error captured:', ev.error ?? ev.message, ev.error?.stack ?? `${ev.filename}:${ev.lineno}:${ev.colno}`);
  } catch (e) {
    // ignore
  }
});

window.addEventListener('unhandledrejection', (ev) => {
  try {
    // eslint-disable-next-line no-console
    console.error('Unhandled promise rejection:', ev.reason, ev.reason?.stack ?? 'no-stack');
  } catch (e) {
    // ignore
  }
});

// Improve console.error output to surface Error stacks and non-serializable objects
(() => {
  try {
    const orig = console.error.bind(console);
    // eslint-disable-next-line no-console
    console.error = (...args: any[]) => {
      for (const a of args) {
        try {
          if (a && typeof a === 'object') {
            // If it's a puppeteer JSHandle-like object, attempt to print common fields
            if ((a as any).stack) {
              orig('Captured error stack:', (a as any).stack);
            } else if ((a as any).message) {
              orig('Captured error message:', (a as any).message, (a as any).stack ?? 'no-stack');
            } else {
              // Fallback: stringify own properties
              try {
                const plain = JSON.stringify(a, Object.getOwnPropertyNames(a), 2);
                orig('Captured object:', plain);
              } catch (e) {
                orig('Captured object [non-serializable]:', a);
              }
            }
          } else {
            orig(a);
          }
        } catch (inner) {
          orig('Error while logging console.error arg:', inner, a);
        }
      }
    };
  } catch (e) {
    /* noop */
  }
})();

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
