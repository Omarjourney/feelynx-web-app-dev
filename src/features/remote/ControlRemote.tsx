import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LovenseToy } from '@/lib/lovense';

const ControlRemote: React.FC = () => {
  const toyRef = useRef<LovenseToy>();
  const toy = useMemo(() => new LovenseToy(), []);
  toyRef.current = toy;

  const [paired, setPaired] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const [maxIntensity, setMaxIntensity] = useState(12); // safety cap (0-20)
  const [durationSec, setDurationSec] = useState(300); // consent duration
  const [busy, setBusy] = useState(false);

  const handlePair = async () => {
    try {
      setBusy(true);
      await toy.pair();
      setPaired(true);
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Failed to pair device');
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Universal Toy Remote</h1>
        <p className="text-muted-foreground">
          Connect devices, set safety caps, and control sessions. Emergency stop always available.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Device</CardTitle>
            </CardHeader>
            <CardContent className="space-x-2 space-y-2">
              {!paired ? (
                <Button onClick={handlePair} disabled={busy}>
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

          <Card>
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
            </CardContent>
          </Card>
        </div>

        <Card>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ControlRemote;
