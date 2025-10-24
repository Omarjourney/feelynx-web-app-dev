import { useRef, useState } from 'react';
import type { Room } from 'livekit-client';

import LovenseToggle from '@/components/LovenseToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { requestMediaPermissions } from '@/lib/mediaPermissions';

const CallRoom = () => {
  const [state, setState] = useState<'idle' | 'connecting' | 'live' | 'ended'>('idle');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const startCall = async () => {
    setState('connecting');
    try {
      await requestMediaPermissions();
      setState('live');
      toast({ title: 'Call started', description: 'You are now connected' });
    } catch (error) {
      setState('idle');
      toast({ 
        title: 'Call failed', 
        description: 'Could not start call', 
        variant: 'destructive' 
      });
    }
  };

  const endCall = () => {
    roomRef.current?.disconnect();

    setState('ended');
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>WebRTC Call Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state === 'idle' && (
            <div className="text-center space-y-2">
              <Button onClick={startCall} className="bg-gradient-primary text-primary-foreground">
                Start Call
              </Button>
            </div>
          )}
          {state === 'connecting' && <p className="text-center">Connecting...</p>}
          {(state === 'live' || state === 'ended') && (
            <div className="grid md:grid-cols-2 gap-4">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto rounded-lg bg-black"
              />
              <div
                ref={remoteVideoRef}
                className="w-full h-auto rounded-lg bg-black"
              />
            </div>
          )}
          {state === 'live' && (
            <div className="flex items-center justify-between mt-4">
              <LovenseToggle />
              <Button variant="destructive" onClick={endCall}>
                End Call
              </Button>
            </div>
          )}
          {state === 'ended' && (
            <div className="text-center space-y-2">
              <p>Call ended.</p>
              <Button onClick={startCall}>Start Again</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CallRoom;
