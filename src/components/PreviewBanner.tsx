import { useEffect, useState } from 'react';

type Health = {
  ok: boolean;
  features?: {
    livekitConfigured?: boolean;
    stripeConfigured?: boolean;
    dbConfigured?: boolean;
  };
};

export default function PreviewBanner() {
  const [health, setHealth] = useState<Health | null>(null);
  useEffect(() => {
    fetch('/health')
      .then((r) => r.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ ok: false }));
  }, []);

  if (!health) return null;

  const serverOffline = !health.ok || !health.features;
  const liveDisabled = !serverOffline && !health.features?.livekitConfigured;
  const payDisabled = !serverOffline && !health.features?.stripeConfigured;

  if (!serverOffline && !liveDisabled && !payDisabled) return null;

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 text-amber-900">
      <div className="container mx-auto px-4 py-2 text-sm">
        {serverOffline ? (
          <span>Preview mode: server not reachable. Live and payments are disabled.</span>
        ) : (
          <span>
            Preview mode: {liveDisabled && 'Live '} {liveDisabled && payDisabled && 'and '}
            {payDisabled && 'Payments '} not configured.
          </span>
        )}
      </div>
    </div>
  );
}
