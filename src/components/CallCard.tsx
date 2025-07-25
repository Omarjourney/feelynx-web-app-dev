import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Creator {
  id: number;
  name: string;
  username: string;
  initial: string;
  gradientColors: string;
  videoRate: number;
}

export const CallCard = ({ creator }: { creator: Creator }) => {
  const [duration, setDuration] = useState(0);
  const [active, setActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(iv);
  }, [active]);

  const cost = ((duration / 60) * creator.videoRate).toFixed(2);

  return (
    <Dialog>
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className={`h-32 flex items-center justify-center text-6xl text-white ${creator.gradientColors}`}>{creator.initial}</div>
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{creator.name}</h3>
            <Badge>{creator.videoRate}💎/min</Badge>
          </div>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-primary text-primary-foreground" size="sm">
              Call
            </Button>
          </DialogTrigger>
        </div>
      </div>
      <DialogContent>
        <div className="space-y-4">
          <div className="relative aspect-video bg-black rounded">
            {active && <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />}
            {!active && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button onClick={() => setActive(true)}>Connect</Button>
              </div>
            )}
          </div>
          {active && (
            <div className="flex items-center justify-between">
              <span>⏱ {(duration / 60).toFixed(1)}m</span>
              <span>Cost: {cost}💎</span>
              <Button variant="destructive" onClick={() => setActive(false)}>
                End
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
