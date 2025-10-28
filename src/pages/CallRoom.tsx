import { useEffect, useRef, useState } from 'react';
import type { Room } from 'livekit-client';

import LovenseToggle from '@/components/LovenseToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { requestMediaPermissions } from '@/lib/mediaPermissions';
import { Slider } from '@/components/ui/slider';

const CallRoom = () => {
  const [state, setState] = useState<'idle' | 'connecting' | 'live' | 'ended'>('idle');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  // Control session (Tophy-style) integration
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

  const endConsentSession = async () => {
    if (!sessionId) return;
    try {
      setBusy(true);
      await fetch(`/control/sessions/${sessionId}/revoke`, { method: 'POST' });
      toast({ title: 'Control session ended' });
    } catch (err) {
      // ignore
    } finally {
      setSessionId(null);
      setSessionToken(null);
      setRemainingSec(0);
      setBusy(false);
    }
  };

  // Countdown timer for session
  useEffect(() => {
    if (!sessionId || !remainingSec) return;
    const iv = setInterval(() => {
      setRemainingSec((s) => {
        const n = s - 1;
        if (n <= 0) {
          clearInterval(iv);
        }
        return n;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [sessionId, remainingSec]);

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
        variant: 'destructive',
      });
    }
  };

  const endCall = () => {
    roomRef.current?.disconnect();

    setState('ended');
  };

  useEffect(() => {
    return () => {};
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
              <div ref={remoteVideoRef} className="w-full h-auto rounded-lg bg-black" />
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
          {state === 'live' && (
            <Card>
              <CardHeader>
                <CardTitle>Control Session (Consent & Safety)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Max Intensity</span>
                    <span>{maxIntensity}/20</span>
                  </div>
                  <Slider
                    value={[maxIntensity]}
                    onValueChange={(v) => setMaxIntensity(Math.min(20, Math.max(0, v[0] ?? 12)))}
                    max={20}
                    step={1}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Session Duration</span>
                    <span>{durationSec}s</span>
                  </div>
                  <Slider
                    value={[durationSec]}
                    onValueChange={(v) => setDurationSec(Math.min(3600, Math.max(60, v[0] ?? 300)))}
                    max={3600}
                    min={60}
                    step={30}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {!sessionId ? (
                    <Button onClick={startConsentSession} disabled={busy}>
                      Start Consent Session
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={endConsentSession} disabled={busy}>
                        End Session
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Session: {sessionId.slice(0, 8)}… · {Math.max(0, remainingSec)}s
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
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
