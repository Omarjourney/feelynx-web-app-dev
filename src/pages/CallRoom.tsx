import { useEffect, useRef, useState } from 'react';
import LovenseToggle from '@/components/LovenseToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const CallRoom = () => {
  const [state, setState] = useState<'idle' | 'connecting' | 'live' | 'ended'>('idle');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCall = async () => {
    setState('connecting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      // In a real app, WebRTC negotiation would happen here.
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setState('live');
      toast({ title: 'Stream started' });
    } catch (err) {
      toast({ title: 'Camera permission denied' });
      setState('idle');
    }
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setState('ended');
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

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
              <video ref={localVideoRef} autoPlay muted className="w-full rounded-lg bg-black" />
              <video ref={remoteVideoRef} autoPlay className="w-full rounded-lg bg-black" />
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
