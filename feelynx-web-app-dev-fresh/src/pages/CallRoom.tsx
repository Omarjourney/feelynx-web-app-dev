import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Room, Track, createLocalTracks } from 'livekit-client';
import LovenseToggle from '@/components/LovenseToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { requestMediaPermissions } from '@/lib/mediaPermissions';
import { Slider } from '@/components/ui/slider';

const CallRoom = () => {
  const [state, setState] = useState<'idle' | 'connecting' | 'live' | 'ended'>('idle');
  const [params] = useSearchParams();
  const caller = params.get('from') || '';
  const mode = (params.get('mode') as 'video' | 'audio' | null) || 'video';
  const rate = params.get('rate');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const [maxIntensity, setMaxIntensity] = useState(12);
  const [durationSec, setDurationSec] = useState(300);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [remainingSec, setRemainingSec] = useState<number>(0);

  const startConsentSession = async () => {
    try {
      setBusy(true);
      const res = await fetch('/control/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxIntensity, durationSec }),
      });
      if (!res.ok) throw new Error('Failed to start consent session');
      const data = await res.json();
      setSessionId(data.id);
      setSessionToken(data.token);
      setRemainingSec(durationSec);
      toast({ title: 'Control session started', description: `Session ${data.id.slice(0, 8)}…` });
    } catch (err) {
      toast({ title: 'Failed to start control session', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const startCall = async () => {
    setState('connecting');
    try {
      await requestMediaPermissions();
      const wsUrl = import.meta.env.VITE_LIVEKIT_WS_URL || '';
      const room = new Room();

      const token = 'demo-token';
      await room.connect(wsUrl, token);
      roomRef.current = room;

      const tracks = await createLocalTracks({ audio: true, video: mode === 'video' });
      
      for (const track of tracks) {
        await room.localParticipant.publishTrack(track);
      }

      const videoTrack = tracks.find((t) => t.kind === Track.Kind.Video);
      if (videoTrack && localVideoRef.current) {
        videoTrack.attach(localVideoRef.current);
      }

      setState('live');
      toast({ title: 'Call started' });
    } catch (err) {
      setState('idle');
      toast({ title: 'Failed to start call', variant: 'destructive' });
    }
  };

  const endCall = () => {
    roomRef.current?.disconnect();
    setState('ended');
    toast({ title: 'Call ended' });
  };

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pt-4 pb-32">
      <div className="container mx-auto px-4 space-y-4">
        <Card className="bg-gradient-card border-white/10">
          <CardHeader>
            <CardTitle className="text-xl">
              {mode === 'audio' ? '🎙️ Audio Call' : '📹 Video Call'}
              {caller && <span className="ml-2 text-muted-foreground">with {caller}</span>}
              {rate && <span className="ml-2 text-sm text-primary">💎 {rate}/min</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state === 'idle' && (
              <div className="text-center space-y-4 py-8">
                <p className="text-muted-foreground">Ready to start your call</p>
                <Button onClick={startCall} size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow">
                  Start Call
                </Button>
              </div>
            )}
            {state === 'connecting' && (
              <div className="text-center py-8">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Connecting...</p>
              </div>
            )}
            {(state === 'live' || state === 'ended') && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    You
                  </div>
                </div>
                <div className="relative aspect-video overflow-hidden rounded-lg bg-black" ref={remoteVideoRef}>
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Waiting for remote video...
                  </div>
                </div>
              </div>
            )}
            {state === 'live' && (
              <div className="flex items-center justify-between mt-4 p-4 rounded-lg bg-white/5">
                <LovenseToggle />
                <Button variant="destructive" onClick={endCall}>
                  End Call
                </Button>
              </div>
            )}
            {state === 'live' && (
              <Card className="border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Control Session</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Max Intensity</span>
                      <span className="font-semibold">{maxIntensity}/20</span>
                    </div>
                    <Slider
                      value={[maxIntensity]}
                      onValueChange={(v) => setMaxIntensity(v[0])}
                      max={20}
                      step={1}
                      disabled={!!sessionId}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Duration</span>
                      <span className="font-semibold">{durationSec}s</span>
                    </div>
                    <Slider
                      value={[durationSec]}
                      onValueChange={(v) => setDurationSec(v[0])}
                      min={60}
                      max={1800}
                      step={30}
                      disabled={!!sessionId}
                    />
                  </div>
                  {!sessionId && (
                    <Button onClick={startConsentSession} disabled={busy} className="w-full">
                      {busy ? 'Starting…' : 'Start Control Session'}
                    </Button>
                  )}
                  {sessionId && (
                    <div className="rounded-lg bg-white/5 p-4 text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Session ID:</span>
                        <span className="font-mono">{sessionId.slice(0, 8)}…</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time remaining:</span>
                        <span className="font-semibold">~{remainingSec}s</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-xs text-muted-foreground mb-1">Token:</p>
                        <code className="block rounded bg-black/40 p-2 text-[10px] break-all">
                          {sessionToken}
                        </code>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CallRoom;
