import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { LovenseToy } from '@/lib/lovense';

type Step = { level: number; ms: number };

const DEFAULT_STEPS: Step[] = [
  { level: 4, ms: 800 },
  { level: 8, ms: 800 },
  { level: 12, ms: 800 },
  { level: 6, ms: 800 },
];

const PatternEditor: React.FC = () => {
  const [steps, setSteps] = useState<Step[]>(DEFAULT_STEPS);
  const [maxIntensity, setMaxIntensity] = useState(12);
  const [playing, setPlaying] = useState(false);
  const toyRef = useRef<LovenseToy>();
  const timerRef = useRef<any>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const bounded = (v: number) => Math.min(maxIntensity, Math.max(0, v));

  const startPreview = async () => {
    if (playing) return;
    setPlaying(true);
    const toy = (toyRef.current ||= new LovenseToy());
    let idx = 0;
    const run = async () => {
      if (!playing) return;
      const step = steps[idx % steps.length];
      try {
        await toy.vibrate(bounded(step.level));
      } catch (err) {
        // ignore in preview if not paired
      }
      timerRef.current = setTimeout(() => {
        idx += 1;
        if (playing) run();
      }, step.ms);
    };
    run();
  };

  const stopPreview = async () => {
    setPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      await toyRef.current?.vibrate(0);
    } catch (err) {
      // ignore if not paired during stop
    }
  };

  const updateStep = (i: number, patch: Partial<Step>) => {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const addStep = () => setSteps((prev) => [...prev, { level: 6, ms: 800 }]);
  const removeStep = (i: number) => setSteps((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Pattern Editor</h1>
        <p className="text-muted-foreground">
          Create a sequence of intensity steps and preview on your paired device.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Safety</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Max Intensity</span>
              <span>{maxIntensity}/20</span>
            </div>
            <Slider
              value={[maxIntensity]}
              onValueChange={(v) => setMaxIntensity(Math.min(20, Math.max(0, v[0] ?? 12)))}
              max={20}
              step={1}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {steps.map((s, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>Step {i + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Level</span>
                  <span>{s.level}</span>
                </div>
                <Slider
                  value={[s.level]}
                  onValueChange={(v) =>
                    updateStep(i, { level: Math.min(20, Math.max(0, v[0] ?? s.level)) })
                  }
                  max={20}
                  step={1}
                />
                <div className="flex justify-between text-sm">
                  <span>Duration (ms)</span>
                  <span>{s.ms}</span>
                </div>
                <Slider
                  value={[s.ms]}
                  onValueChange={(v) =>
                    updateStep(i, { ms: Math.min(5000, Math.max(200, v[0] ?? s.ms)) })
                  }
                  max={5000}
                  min={200}
                  step={100}
                />
                <div className="pt-2">
                  <Button variant="outline" onClick={() => removeStep(i)}>
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={addStep} variant="secondary">
            Add Step
          </Button>
          {!playing ? (
            <Button onClick={startPreview}>Preview Pattern</Button>
          ) : (
            <Button variant="destructive" onClick={stopPreview}>
              Stop Preview
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatternEditor;
