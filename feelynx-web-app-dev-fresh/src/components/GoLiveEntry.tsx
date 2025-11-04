import { useHealth } from '@/lib/health';
import { Button } from '@/components/ui/button';
import { GoLiveButton } from '@/components/live';

export default function GoLiveEntry() {
  const { loading, health } = useHealth();
  if (loading) return null;
  // Always offer Go Live. LiveCreator handles demo mode when LiveKit is unconfigured.
  return <GoLiveButton />;
}
