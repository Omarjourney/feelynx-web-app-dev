import { useState } from 'react';
import { SettingsDrawer } from './ui/SettingsDrawer';

const NAV_ITEMS = [
  { id: 'discover', label: 'Discover', href: '#discover' },
  { id: 'community', label: 'Crews', href: '#community' },
  { id: 'monetization', label: 'Support', href: '#monetization' },
];

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-10">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white/80"
            aria-label="Feelynx homepage"
          >
            <span aria-hidden>🌀</span>
            Feelynx
          </a>
          <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition hover:bg-white/10 hover:text-white focus-visible:bg-white/10"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <SettingsDrawer />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg transition hover:bg-white/20 md:hidden"
            onClick={() => setIsMobileOpen((open) => !open)}
            aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {isMobileOpen ? (
        <nav className="border-t border-white/10 px-6 pb-4 pt-2 md:hidden" aria-label="Primary mobile">
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item.label}
                  <span aria-hidden>→</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
};

export default Navbar;
