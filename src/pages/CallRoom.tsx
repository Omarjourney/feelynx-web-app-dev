import { useEffect, useRef, useState } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import LovenseToggle from '@/components/LovenseToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const CallRoom = () => {
  const [state, setState] = useState<'idle' | 'connecting' | 'live' | 'ended'>('idle');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null);

  const startCall = async () => {
    setState('connecting');
    try {
      const resp = await fetch(`/livekit/token?room=demo&identity=web`);
      const { token } = await resp.json();
      const room = new Room({ adaptiveStream: true, dynacast: true });
      await room.connect(
        import.meta.env.VITE_LIVEKIT_WS_URL || 'ws://localhost:7880',
        token,
      );
      await room.localParticipant.enableCameraAndMicrophone();

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Video) {
          const el = track.attach();
          remoteVideoRef.current?.appendChild(el);
        }
        if (track.kind === Track.Kind.Audio) {
          track.attach();
        }
      });

      const localTrackPublications = Array.from(room.localParticipant.videoTrackPublications.values());
      const localTrack = localTrackPublications[0]?.track;
      if (localTrack && localVideoRef.current) {
        localVideoRef.current.srcObject = new MediaStream([
          localTrack.mediaStreamTrack,
        ]);
      }

      roomRef.current = room;
      setState('live');
    } catch (err) {
      console.error(err);
      toast({ title: 'Connection failed' });
      setState('idle');
    }
  };

  const endCall = () => {
    roomRef.current?.disconnect();
    roomRef.current = null;
    setState('ended');
  };

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
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
