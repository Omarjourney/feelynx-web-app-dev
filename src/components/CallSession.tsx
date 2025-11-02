import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export interface CallSessionProps {
  creatorName: string;
  ratePerMinute: number;
}

const CallSession = ({ creatorName, ratePerMinute }: CallSessionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [connected, setConnected] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!connected) return;
    const iv = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [connected]);

  const cost = ((seconds / 60) * ratePerMinute).toFixed(2);

  return (
    <div className="space-y-4">
      <div className="text-center font-semibold">Calling {creatorName}</div>
      <div className="relative aspect-video bg-black rounded">
        {connected && <video ref={videoRef} className="w-full h-full" autoPlay muted />}
        {!connected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button onClick={() => setConnected(true)}>Connect</Button>
          </div>
        )}
      </div>
      {connected && (
        <div className="flex items-center justify-between text-sm">
          <span>⏱ {(seconds / 60).toFixed(1)}m</span>
          <span>Cost: {cost}💎</span>
          <div className="space-x-2">
            <Button variant="secondary" size="sm">
              Mute
            </Button>
            <Button variant="secondary" size="sm">
              Camera
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setConnected(false)}>
              End
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallSession;
