import { useEffect, useState } from 'react';

export type HealthInfo = {
  ok: boolean;
  features?: {
    livekitConfigured?: boolean;
    stripeConfigured?: boolean;
    dbConfigured?: boolean;
  };
};

export function useHealth(): { loading: boolean; health: HealthInfo | null } {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<HealthInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/health');
        const data = (await res.json()) as HealthInfo;
        if (!cancelled) setHealth(data);
      } catch {
        if (!cancelled) setHealth({ ok: false });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, health };
}
