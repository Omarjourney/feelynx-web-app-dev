import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LovenseToy } from '@/lib/lovense';
import { Input } from '@/components/ui/input';
import { getServerWsUrl } from '@/lib/ws';
import { isBluetoothSupported, isSecureContextSupported } from '@/lib/bluetooth';

const ControlRemote: React.FC = () => {
  const toyRef = useRef<LovenseToy>();
  const toy = useMemo(() => new LovenseToy(), []);
  toyRef.current = toy;

  const [paired, setPaired] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const [maxIntensity, setMaxIntensity] = useState(12); // safety cap (0-20)
  const [durationSec, setDurationSec] = useState(300); // consent duration
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [listenSessionId, setListenSessionId] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const [btSupported, setBtSupported] = useState<boolean>(true);
  const [secureCtx, setSecureCtx] = useState<boolean>(true);

  useEffect(() => {
    setBtSupported(isBluetoothSupported());
    setSecureCtx(isSecureContextSupported());
  }, []);

  const startConsentSession = async () => {
    try {
      setBusy(true);
      const res = await fetch('/control/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxIntensity, durationSec }),
      });
      if (!res.ok) throw new Error('Failed to start session');
      const data = await res.json();
      setSessionId(data.id);
      setSessionToken(data.token);
    } catch (err) {
      console.error(err);
      alert('Could not start consent session');
    } finally {
      setBusy(false);
    }
  };

  const revokeConsentSession = async () => {
    if (!sessionId) return;
    try {
      setBusy(true);
      await fetch(`/control/sessions/${sessionId}/revoke`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    } finally {
      setSessionId(null);
      setSessionToken(null);
      setBusy(false);
    }
  };

  const handlePair = async () => {
    try {
      setBusy(true);
      await toy.pair();
      setPaired(true);
    } catch (err) {
      console.error(err);
      const msg = (err as Error)?.message || 'Failed to pair device';
      alert(
        `${msg}\n\nTips:\n• Use Chrome on desktop with Bluetooth enabled.\n• Make sure you are on HTTPS.\n• Ensure the device is on and in pairing mode.`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setBusy(true);
      await toy.disconnect();
      setPaired(false);
      setIntensity(0);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const applyVibration = async (value: number[]) => {
    const target = Math.min(Math.max(0, value[0] ?? 0), maxIntensity);
    setIntensity(target);
    // Send to backend if a consent session exists
    if (sessionId && sessionToken) {
      try {
        await fetch(`/control/sessions/${sessionId}/command`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
          body: JSON.stringify({ intensity: target }),
        });
      } catch (err) {
        console.error(err);
      }
    }
    if (!paired) return;
    try {
      await toy.vibrate(target);
    } catch (err) {
      console.error(err);
    }
  };

  const killSwitch = async () => {
    setIntensity(0);
    try {
      await toy.vibrate(0);
    } catch (err) {
      console.error(err);
    }
  };

  const startListening = () => {
    if (!listenSessionId) return alert('Enter a session id to listen');
    if (wsRef.current) wsRef.current.close();
    const wsUrl = getServerWsUrl().replace(/^http/, 'ws');
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribeControl', sessionId: listenSessionId }));
    };
    ws.onmessage = async (ev) => {
      try {
        const msg = JSON.parse(String(ev.data));
        if (msg?.type === 'controlCommand' && msg.sessionId === listenSessionId) {
          const target = Math.min(Math.max(0, Number(msg.intensity) || 0), maxIntensity);
          setIntensity(target);
          try {
            await toy.vibrate(target);
          } catch (err) {
            // ignore if not paired
          }
        } else if (msg?.type === 'controlEnded' && msg.sessionId === listenSessionId) {
          try {
            await killSwitch();
          } catch (err) {
            // ignore
          }
        }
      } catch (err) {
        // ignore malformed
      }
    };
    ws.onclose = () => {
      wsRef.current = null;
    };
    wsRef.current = ws;
  };

  const stopListening = () => {
    if (wsRef.current && listenSessionId) {
      try {
        wsRef.current.send(
          JSON.stringify({ type: 'unsubscribeControl', sessionId: listenSessionId }),
        );
      } catch (err) {
        // ignore
      }
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  return (
    <div className="bg-background">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Universal Toy Remote</h1>
        <p className="text-muted-foreground">
          Connect devices, set safety caps, and control sessions.
        </p>

        {(!btSupported || !secureCtx) && (
          <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 p-3 text-sm">
            {!btSupported && <div>Web Bluetooth is not supported in this browser.</div>}
            {!secureCtx && <div>Bluetooth requires a secure context (HTTPS).</div>}
            <div className="mt-1 opacity-80">Try Chrome desktop and ensure you’re on HTTPS.</div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border border-border/60">
            <CardHeader>
              <CardTitle>Device</CardTitle>
            </CardHeader>
            <CardContent className="space-x-2 space-y-2">
              {!paired ? (
                <Button onClick={handlePair} disabled={busy || !btSupported || !secureCtx}>
                  Pair Lovense
                </Button>
              ) : (
                <Button variant="outline" onClick={handleDisconnect} disabled={busy}>
                  Disconnect
                </Button>
              )}
              <Button variant="destructive" onClick={killSwitch} disabled={!paired || busy}>
                Emergency Stop
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-border/60">
            <CardHeader>
              <CardTitle>Consent & Safety</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Max Intensity</span>
                  <span>{maxIntensity}/20</span>
                </div>
                <Slider
                  value={[maxIntensity]}
                  onValueChange={(v) => setMaxIntensity(Math.min(20, Math.max(0, v[0] ?? 0)))}
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
              <p className="text-xs text-muted-foreground">
                These caps are local safeguards; enforce server-side for shared/control sessions.
              </p>
              <div className="flex gap-2 pt-2 items-center">
                {!sessionId ? (
                  <Button onClick={startConsentSession} disabled={busy}>
                    Start Consent Session
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={revokeConsentSession} disabled={busy}>
                      End Session
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Session: {sessionId.slice(0, 8)}…
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle>Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Intensity</span>
              <span>
                {intensity}/{maxIntensity}
              </span>
            </div>
            <Slider
              value={[intensity]}
              onValueChange={applyVibration}
              max={maxIntensity}
              step={1}
            />
            <div className="grid gap-2 pt-4">
              <div className="text-sm font-medium">Listen to Session (performer)</div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter session id"
                  value={listenSessionId}
                  onChange={(e) => setListenSessionId(e.target.value)}
                />
                <Button variant="secondary" onClick={startListening} disabled={!listenSessionId}>
                  Listen
                </Button>
                <Button variant="outline" onClick={stopListening}>
                  Stop
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ControlRemote;
