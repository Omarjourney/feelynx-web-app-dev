import { useHealth } from '@/lib/health';
import { Button } from '@/components/ui/button';
import { GoLiveButton } from '@/components/live';

export default function GoLiveEntry() {
  const { loading, health } = useHealth();
  const liveEnabled = !!health?.features?.livekitConfigured;

  if (loading) return null;
  if (liveEnabled) return <GoLiveButton />;
  return (
    <Button
      className="fixed z-40 rounded-full px-6 py-4 text-lg font-semibold safe-fab-offset"
      variant="secondary"
      disabled
      title="Live is disabled in this preview"
    >
      Live Unavailable
    </Button>
  );
}
