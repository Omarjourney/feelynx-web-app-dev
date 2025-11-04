import { useEffect, useState } from 'react';

type Health = {
  ok: boolean;
  features?: {
    livekitConfigured?: boolean;
    stripeConfigured?: boolean;
    dbConfigured?: boolean;
    supabaseConfigured?: boolean;
  };
};

export default function PreviewBanner() {
  // Hide banner by default; enable only when explicitly requested
  const show = (import.meta as any).env?.VITE_SHOW_PREVIEW_BANNER === 'true';
  const [health, setHealth] = useState<Health | null>(null);
  useEffect(() => {
    if (!show) return;
    fetch('/health')
      .then((r) => r.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ ok: false }));
  }, [show]);

  if (!show) return null;

  if (!health) return null;

  const serverOffline = !health.ok || !health.features;
  const liveDisabled = !serverOffline && !health.features?.livekitConfigured;
  const payDisabled = !serverOffline && !health.features?.stripeConfigured;
  const supabaseDisabled = !serverOffline && !health.features?.supabaseConfigured;

  if (!serverOffline && !liveDisabled && !payDisabled && !supabaseDisabled) return null;

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 text-amber-900">
      <div className="container mx-auto px-4 py-2 text-sm">
        {serverOffline ? (
          <span>Preview mode: server not reachable. Live and payments are disabled.</span>
        ) : (
          <span>
            Preview mode:
            {liveDisabled && ' Live'}
            {payDisabled && (liveDisabled ? ' and Payments' : ' Payments')}
            {supabaseDisabled && (liveDisabled || payDisabled ? ' and Supabase' : ' Supabase')} not
            configured.
          </span>
        )}
      </div>
    </div>
  );
}
