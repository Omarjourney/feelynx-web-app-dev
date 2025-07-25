import { useEffect, useRef, useState } from 'react';
import {
  Room,
  Track,
  createLocalTracks,
  LocalTrackPublication,
} from 'livekit-client';
import LovenseToggle from '@/components/LovenseToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const CallRoom = () => {
  const [state, setState] = useState<'idle' | 'connecting' | 'live' | 'ended'>('idle');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room>();

  const startCall = async () => {
    setState('connecting');
    try {
      const identity = `user-${Math.floor(Math.random() * 10000)}`;
      const res = await fetch(`/livekit/token?identity=${identity}`);
      if (!res.ok) throw new Error('token request failed');
      const { token, url } = await res.json();

      const room = new Room();
      roomRef.current = room;

      room.on('trackSubscribed', (track) => {
        if (track.kind === Track.Kind.Video && remoteVideoRef.current) {
          track.attach(remoteVideoRef.current);
        }
      });

      const tracks = await createLocalTracks({ audio: true, video: true });
      tracks.forEach((t) => {
        if (t.kind === Track.Kind.Video && localVideoRef.current) {
          t.attach(localVideoRef.current);
        }
      });

      await room.connect(url, token, { tracks });
      setState('live');
      toast({ title: 'Connected to room' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Connection failed' });
      setState('idle');
    }
  };

  const endCall = () => {
    roomRef.current?.disconnect();
    roomRef.current = undefined;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setState('ended');
  };

  useEffect(() => {
    return () => {
      endCall();
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
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto rounded-lg bg-black"
              />
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
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
