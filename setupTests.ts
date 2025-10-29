// Conditionally load DOM testing helpers when available (UI tests)
let cleanupFn: (() => void) | null = null;
(async () => {
  try {
    const di = Function('m', 'return import(m)') as (m: string) => Promise<any>;
    await di('@testing-library/jest-dom/vitest');
  } catch {
    // not a UI test run; ignore
  }
  try {
    const di = Function('m', 'return import(m)') as (m: string) => Promise<any>;
    const mod: any = await di('@testing-library/react');
    cleanupFn = typeof mod.cleanup === 'function' ? mod.cleanup : null;
  } catch {
    cleanupFn = null;
  }
})();

import { afterEach } from 'vitest';
afterEach(() => {
  if (cleanupFn) cleanupFn();
});
